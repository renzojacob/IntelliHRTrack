import importlib, traceback, json
out = {}
try:
    mod = importlib.import_module('deepface')
    out['mod_dir'] = dir(mod)
    out['mod_repr'] = repr(mod)
except Exception as e:
    out['import_error'] = str(e)
    out['import_tb'] = traceback.format_exc()

try:
    from deepface import DeepFace
    out['from_ok'] = True
except Exception as e:
    out['from_error'] = str(e)
    out['from_tb'] = traceback.format_exc()

with open('deepface_probe_result.json', 'w', encoding='utf-8') as f:
    json.dump(out, f, indent=2)

print('probe written')
