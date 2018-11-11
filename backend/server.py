from flask import Flask, render_template, request, jsonify, make_response
from api.get_prediction.new_obj import run_prediction

app = Flask(__name__)


@app.route("/", methods=['GET'])
def home():
    return("Server is running.")

@app.route("/image", methods=['GET'])
def get_image():
    return "this is image"


@app.route("/api/get_prediction", methods=['POST'])
def get_pred():

    print("Post recieved.")
    image_b64 = request.json['image']
    # print(image_b64)
    # prediction = run_prediction(image_b64)
    # res = {'prediction': str(prediction)}
    # print(res)
    # return jsonify(res), 201
    return image_b64

@app.errorhandler(404)
def not_found(error):
    return make_response(jsonify({'error': 'Not found'}), 404)

if __name__ == '__main__':
    app.run(debug=False)
