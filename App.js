
import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Switch,
  TouchableOpacity,
  Image
} from "react-native";
import { Camera, Permissions } from "expo";


export default class App extends React.Component {
  state = {
    switchValue: false,
    hasCameraPermission: null,
    type: Camera.Constants.Type.back,
    imageuri: "",
    imageBase64 : "",
    url: ""
  };

  async componentWillMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    Permissions.askAsync(Permissions.AUDIO_RECORDING);
    this.setState({ hasCameraPermission: status === "granted" });

  }

  cameraChange = () => {
    this.setState({
      imageuri: "",
      url: "",
      type:
        this.state.type === Camera.Constants.Type.back
          ? Camera.Constants.Type.front
          : Camera.Constants.Type.back
    });
  };

  snap = async () => {
    if (this.camera) {
      let photo = await this.camera.takePictureAsync();
      if (photo) {
        this.setState({imageBase64 : data.base64})
      }
    }
  };


  upload = async () => {
    //
    let url = "https://hack-princeton.herokuapp.com/api/get_prediction";
    // return fetch(url, {
    //     method: "POST", // *GET, POST, PUT, DELETE, etc.
    //
    //     headers: {
    //         "Content-Type": "application/json; charset=utf-8",
    //         // "Content-Type": "application/x-www-form-urlencoded",
    //     },
    //     body: {"image" : this.state.imageBase64}, // body data type must match "Content-Type" header
    // })
    // .then(response => response.json()); // parses response to JSON

    var data = {
     image : this.state.imageBase64
    };

    try {
     let response = await fetch(
      url,
      {
        method: "POST",
        headers: {
         "Accept": "application/json",
         "Content-Type": "application/json"
        },
       body: JSON.stringify(data)
     }
    );
     if (response.status >= 200 && response.status < 300) {
        console.log(response["_bodyText"]);
     }
   } catch (errors) {

     alert(errors);
    }

  };



  render() {
    const { hasCameraPermission } = this.state;
    if (hasCameraPermission === null) {
      return <View />;
    } else if (hasCameraPermission === false) {
      return (
        <View>
          <Text>No access to camera</Text>
        </View>
      );
    } else {
      return (
        <View style={styles.container}>
          <View style={styles.switchview}>
            <Text>Show camera</Text>
            <Switch
              onValueChange={value => {
                this.setState({ switchValue: value });
              }}
              value={this.state.switchValue}
              style={styles.switch}
            />
          </View>
          {this.state.switchValue ? (
            <View style={styles.cameraview}>
              {this.state.imageuri != "" ? (
                <Image
                  source={{
                    uri: this.state.imageuri
                  }}
                  style={styles.uploadedImage}
                  resizeMode="contain"
                />
              ) : (
                <Camera
                  style={styles.camera}
                  type={this.state.type}
                  ref={ref => {
                    this.camera = ref;
                  }}
                >
                  <View style={styles.camerabuttonview}>
                    <TouchableOpacity
                      style={styles.cameraButtons}
                      onPress={this.cameraChange}
                    >
                      <Text
                        style={{
                          fontSize: 18,
                          marginBottom: 10,
                          color: "white"
                        }}
                      >
                        Flip
                      </Text>
                    </TouchableOpacity>
                  </View>
                </Camera>
              )}
            </View>
          ) : (
            <View style={styles.cameraview}>
              {this.state.url != "" ? (
                <Text>Uploaded url : {"https://hack-princeton.herokuapp.com"}</Text>
              ) : null}
              <Text>Camera off</Text>
            </View>
          )}
          {this.state.switchValue ? (
            <View style={styles.buttonsView}>
              {this.state.imageuri == "" ? (
                <View style={styles.captureButtonView}>

                  <TouchableOpacity
                    style={styles.cameraButtons}
                    onPress={this.snap}
                  >
                    <Text
                      style={{ fontSize: 18, marginBottom: 10, color: "white" }}
                    >
                      Capture
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : null}
              <View style={styles.captureButtonView}>
                <TouchableOpacity
                  style={styles.cameraButtons}
                  onPress={this.upload}
                >
                  <Text
                    style={{ fontSize: 18, marginBottom: 10, color: "white" }}
                  >
                    Upload
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}
        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1dd1a1",
    alignItems: "center",
    justifyContent: "flex-start"
  },
  switchview: {
    marginTop: 50,
    backgroundColor: "white",
    padding: 10,
    alignItems: "center",
    borderRadius: 5,
    marginBottom: 5
  },
  switch: {
    padding: 5
  },
  cameraview: {
    height: "70%",
    width: "100%",
    backgroundColor: "green",
    borderRadius: 2,
    justifyContent: "center",
    alignItems: "center"
  },
  camera: {
    height: "95%",
    width: "95%",
    backgroundColor: "white",
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center"
  },
  camerabuttonview: {
    height: "100%",
    backgroundColor: "transparent"
  },
  cameraButtons: {
    borderColor: "#fff",
    backgroundColor: "black",
    borderWidth: 2,
    padding: 10,
    borderRadius: 5,
    margin: 5
  },
  captureButtonView: {
    height: 200
  },
  buttonsView: {
    height: 200,
    width: "100%",
    flexDirection: "row",
    justifyContent: "center"
  },
  uploadedImage: {
    height: "90%",
    width: "90%",
    padding: 10
  }
});
