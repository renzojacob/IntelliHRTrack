from fastapi import FastAPI
import uvicorn

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "API is working!"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/test")
def test_endpoint():
    return {"test": "success"}

# This allows running with: python debug_test.py
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)