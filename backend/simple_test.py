from fastapi import FastAPI

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