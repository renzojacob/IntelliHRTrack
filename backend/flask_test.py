from flask import Flask
app = Flask(__name__)

@app.route('/')
def hello():
    return {"message": "Flask is working"}

@app.route('/test')
def test():
    return {"test": "success"}

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8000, debug=True)