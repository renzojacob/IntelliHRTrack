from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from typing import List
import os
import traceback
from app.core.database import get_db
from sqlalchemy.orm import Session
import importlib
import numpy as np
import cv2
import json
from app.models.face import FaceEmbedding
from app.models.user import Employee

router = APIRouter()


def _get_deepface_class():
    """Try to obtain the DeepFace class from the installed deepface package using a few import strategies."""
    try:
        mod = importlib.import_module('deepface')
        if hasattr(mod, 'DeepFace'):
            return mod.DeepFace
    except Exception:
        pass
    try:
        # try direct import
        from deepface import DeepFace as _DF
        return _DF
    except Exception as e:
        raise


@router.get("/api/v1/biometrics/health")
def biometrics_health():
    """Return import/availability status for DeepFace, TensorFlow and retinaface."""
    info = {}
    # DeepFace
    try:
        import importlib.util as _il
        spec = _il.find_spec('deepface')
        if spec is None:
            info['deepface'] = {'installed': False}
        else:
            import deepface as _df
            info['deepface'] = {'installed': True, 'version': getattr(_df, '__version__', 'unknown')}
    except Exception as e:
        info['deepface'] = {'installed': False, 'error': str(e)}

    # TensorFlow
    try:
        import tensorflow as _tf
        info['tensorflow'] = {'installed': True, 'version': getattr(_tf, '__version__', 'unknown')}
    except Exception as e:
        info['tensorflow'] = {'installed': False, 'error': str(e)}

    # retinaface
    try:
        import importlib.util as _il2
        info['retinaface'] = {'installed': _il2.find_spec('retinaface') is not None}
    except Exception as e:
        info['retinaface'] = {'installed': False, 'error': str(e)}

    return info


@router.get('/api/v1/biometrics/deepface-probe')
def deepface_probe_api():
    out = {}
    try:
        mod = importlib.import_module('deepface')
        out['mod_dir'] = [k for k in dir(mod)]
        out['mod_repr'] = repr(mod)
    except Exception as e:
        out['import_error'] = str(e)
    try:
        from deepface import DeepFace
        out['from_ok'] = True
    except Exception as e:
        out['from_error'] = str(e)
    return out


LOG_PATH = os.path.join(os.getcwd(), 'biometrics_errors.log')


def _write_log(text: str):
    try:
        with open(LOG_PATH, 'a', encoding='utf-8') as f:
            f.write(f"[{__name__}] {text}\n")
    except Exception:
        pass


@router.get('/api/v1/biometrics/logs')
def get_biometrics_logs(lines: int = 200):
    """Return last `lines` lines from the biometrics error log file."""
    try:
        if not os.path.exists(LOG_PATH):
            return {"exists": False, "lines": []}
        with open(LOG_PATH, 'r', encoding='utf-8') as f:
            all_lines = f.read().splitlines()
        return {"exists": True, "lines": all_lines[-lines:]}
    except Exception as e:
        return {"exists": False, "error": str(e)}



def _bytes_to_cv2_image(data: bytes):
    npimg = np.frombuffer(data, np.uint8)
    img = cv2.imdecode(npimg, cv2.IMREAD_COLOR)
    return img


@router.post("/api/v1/biometrics/face/enroll")
async def enroll_face(employee_id: str = Form(...), files: List[UploadFile] = File(...), db: Session = Depends(get_db)):
    """Accepts either numeric employee DB id or employee code (employee.employee_id like EMP-0001)."""
    # Resolve employee identifier: try numeric id first, then employee.employee_id
    emp = None
    try:
        # numeric id
        emp_id_num = int(employee_id)
        emp = db.query(Employee).filter(Employee.id == emp_id_num).first()
    except Exception:
        emp = None

    if not emp:
        # try lookup by employee.employee_id (code)
        emp = db.query(Employee).filter(Employee.employee_id == employee_id).first()

    if not emp:
        raise HTTPException(status_code=404, detail=f"Employee not found for identifier: {employee_id}")

    # lazy import DeepFace so missing dependency doesn't break app import
    try:
        DeepFace = _get_deepface_class()
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"DeepFace not available: {e}")

    embeddings = []
    diagnostics = []
    for f in files:
        info = {"filename": getattr(f, 'filename', None)}
        try:
            data = await f.read()
            img = _bytes_to_cv2_image(data)
            if img is None:
                info.update({"stored": False, "reason": "invalid_image"})
                diagnostics.append(info)
                # log invalid image for debugging
                _write_log(f"enroll: invalid image for file={info.get('filename')}")
                continue

            # extract ArcFace embedding
            try:
                rep = DeepFace.represent(img_path=img, model_name="ArcFace", detector_backend="retinaface", enforce_detection=True)
            except Exception as e:
                # fallback to mtcnn with less strict detection
                try:
                    rep = DeepFace.represent(img_path=img, model_name="ArcFace", detector_backend="mtcnn", enforce_detection=False)
                except Exception as e2:
                    rep = None
                    info.update({"stored": False, "reason": f"representation_error: {str(e2)}"})
                    diagnostics.append(info)
                    _write_log(f"representation_error file={info.get('filename')} error={str(e2)}\n" + traceback.format_exc())
                    continue

            if not rep:
                info.update({"stored": False, "reason": "no_face_detected"})
                diagnostics.append(info)
                continue

            embedding = rep[0]["embedding"]
            embeddings.append(embedding)

            # store in DB
            fe = FaceEmbedding(employee_id=emp.id, embedding=json.dumps(embedding))
            db.add(fe)

            info.update({"stored": True, "embedding_len": len(embedding)})
            diagnostics.append(info)
        except Exception as ex:
            info.update({"stored": False, "reason": f"exception: {str(ex)}"})
            diagnostics.append(info)
            _write_log(f"enroll exception file={info.get('filename')} error={str(ex)}\n" + traceback.format_exc())

    try:
        db.commit()
    except Exception as e:
        _write_log('db.commit failed: ' + str(e) + '\n' + traceback.format_exc())
        raise

    stored_count = len(embeddings)
    # log diagnostics server-side for easier debugging
    try:
        print(f"[biometrics.enroll] employee_id={emp.id} stored={stored_count} details={diagnostics}")
    except Exception:
        pass

    if stored_count == 0:
        # return diagnostics so frontend can show per-file reasons
        raise HTTPException(status_code=400, detail={"message": "No face embeddings extracted from uploaded images.", "details": diagnostics})

    return {"status": "success", "employee_id": emp.id, "stored": stored_count, "details": diagnostics}


def _cosine_similarity(a, b):
    a = np.array(a, dtype=np.float32)
    b = np.array(b, dtype=np.float32)
    if np.linalg.norm(a) == 0 or np.linalg.norm(b) == 0:
        return 0.0
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))


@router.post("/api/v1/biometrics/face/verify")
async def verify_face(file: UploadFile = File(...), db: Session = Depends(get_db)):
    data = await file.read()
    img = _bytes_to_cv2_image(data)
    if img is None:
        raise HTTPException(status_code=400, detail="Invalid image")

    # lazy import DeepFace to avoid import-time failures
    try:
        DeepFace = _get_deepface_class()
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"DeepFace not available: {e}")

    try:
        rep = DeepFace.represent(img_path=img, model_name="ArcFace", detector_backend="retinaface", enforce_detection=True)
    except Exception:
        try:
            rep = DeepFace.represent(img_path=img, model_name="ArcFace", detector_backend="mtcnn", enforce_detection=False)
        except Exception:
            # log representation failure
            _write_log('verify: representation failure for uploaded image\n' + traceback.format_exc())
            rep = None

    if not rep:
        raise HTTPException(status_code=400, detail="No face embedding extracted")

    embedding = rep[0]["embedding"]

    # compare against DB
    rows = db.query(FaceEmbedding).all()
    best = None
    best_score = -1.0
    best_employee = None

    for r in rows:
        try:
            stored = json.loads(r.embedding)
        except Exception:
            continue
        score = _cosine_similarity(embedding, stored)
        if score > best_score:
            best_score = score
            best = r
            best_employee = r.employee_id

    # ArcFace recommended threshold: cosine_similarity > 0.40
    threshold = 0.40
    if best_score >= threshold:
        return {"match": True, "employee_id": best_employee, "score": best_score}
    else:
        return {"match": False, "score": best_score}
