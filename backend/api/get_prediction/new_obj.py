import cv2 as cv
import sys
import numpy as np
import os.path
from PIL import Image
import base64
from io import BytesIO


# Get the names of the output layers
def getOutputsNames(net):
    # Get the names of all the layers in the network
    layersNames = net.getLayerNames()
    # Get the names of the output layers, i.e. the layers with unconnected outputs
    return [layersNames[i[0] - 1] for i in net.getUnconnectedOutLayers()]


# Draw the predicted bounding box
def drawPred(classId, conf, left, top, right, bottom):

    # Load names of classes
    classesFile = "coco.names";
    classes = None
    with open(classesFile, 'rt') as f:
        classes = f.read().rstrip('\n').split('\n')

    label = '%.2f' % conf

    # Get the label for the class name and its confidence
    if classes:
        assert(classId < len(classes))
        label = (classes[classId], label)
    return label

# Remove the bounding boxes with low confidence using non-maxima suppression
def postprocess(frame, outs):
    confThreshold = 0.5  #Confidence threshold
    nmsThreshold = 0.4   #Non-maximum suppression threshold

    frameHeight = frame.shape[0]
    frameWidth = frame.shape[1]

    classIds = []
    confidences = []
    boxes = []
    # Scan through all the bounding boxes output from the network and keep only the
    # ones with high confidence scores. Assign the box's class label as the class with the highest score.
    classIds = []
    confidences = []
    boxes = []
    for out in outs:
        for detection in out:
            scores = detection[5:]
            classId = np.argmax(scores)
            confidence = scores[classId]
            if confidence > confThreshold:
                center_x = int(detection[0] * frameWidth)
                center_y = int(detection[1] * frameHeight)
                width = int(detection[2] * frameWidth)
                height = int(detection[3] * frameHeight)
                left = int(center_x - width / 2)
                top = int(center_y - height / 2)
                classIds.append(classId)
                confidences.append(float(confidence))
                boxes.append([left, top, width, height])

    # Perform non maximum suppression to eliminate redundant overlapping boxes with
    # lower confidences.
    indices = cv.dnn.NMSBoxes(boxes, confidences, confThreshold, nmsThreshold)
    prediction_list = []
    for i in indices:
        i = i[0]
        box = boxes[i]
        left = box[0]
        top = box[1]
        width = box[2]
        height = box[3]
        prediction_list.append(drawPred(classIds[i], confidences[i], left, top, left + width, top + height))

    return prediction_list


def run_prediction(img_b64):
    # Initialize the parameter.
    inpWidth = 416       #Width of network's input image
    inpHeight = 416      #Height of network's input image

    # Load names of classes
    classesFile = "coco.names";
    classes = None
    with open(classesFile, 'rt') as f:
        classes = f.read().rstrip('\n').split('\n')

    # Give the configuration and weight files for the model and load the network using them.
    modelConfiguration = "yolov3.cfg";
    modelWeights = "yolov3.weights";

    net = cv.dnn.readNetFromDarknet(modelConfiguration, modelWeights)
    net.setPreferableBackend(cv.dnn.DNN_BACKEND_OPENCV)
    net.setPreferableTarget(cv.dnn.DNN_TARGET_CPU)

    # convert the base64 image.
    encoded_image = img_b64.split(",")[1]
    decoded_image = base64.b64decode(encoded_image)

    # read the decoded image
    pil_img = Image.open(BytesIO(decoded_image))
    open_cv_image = np.array(pil_img)

    # Create a 4D blob from a frame.
    blob = cv.dnn.blobFromImage(open_cv_image, 1/255, (inpWidth, inpHeight), [0,0,0], 1, crop=False)

    # Sets the input to the network
    net.setInput(blob)

    # Runs the forward pass to get output of the output layers
    outs = net.forward(getOutputsNames(net))

    # Remove the bounding boxes with low confidence
    pred = postprocess(img, outs)

    return pred

if __name__ == "__main__":
    run_prediction(image)
