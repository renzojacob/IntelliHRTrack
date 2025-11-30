from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def hello():
    return {"message": "Hello World - It's working!"}

@app.get("/test")
def test():
    return {"status": "ok", "message": "Test endpoint working"}