import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Expo, { AR } from 'expo'
import ExpoTHREE, { AR as ThreeAR, THREE } from 'expo-three'
import { View as GraphicsView } from 'expo-graphics'

import * as ARUtils from './ar-utils'
import TouchableView from './TouchableView'

export default class App extends React.Component {
  touch = new THREE.Vector2()
  raycaster = new THREE.Raycaster()

  updateTouch = ({ x, y }) => {
    // console.log('inside update', this.cube)
    // const { width, height } = this.scene.geometries[0]
    // this.touch.x = x / 0.1 * 2 - 1
    // this.touch.y = -(y / 0.1) * 2 + 1
    if (x / 100 >= this.touch.x) {
      this.touch.x = x / 100
    } else {
      this.touch.x = -x / 100
    }
    if (y / 100 >= this.touch.y) {
      this.touch.y = y / 100
    } else {
      this.touch.y = -y / 100
    }
    // this.runHitTest()
    console.log('TOUCH', this.touch)
    const newX = this.cube.position.x + (this.touch.x / 375)
    const newY = this.cube.position.y - (this.touch.y / 667)
    // this.cube.position.set(newX, newY, -0.4)
    this.scene.remove(this.cube)
    this.setupCube(newX, newY)
    this.cube.position.set(newX, newY, -0.4)
    this.cube.visible = true
  }

  runHitTest = () => {
    this.raycaster.setFromCamera(this.touch, this.camera)
    const intersects = this.raycaster.intersectObjects(this.planes.children)
    console.log('IN RUN HIT TEST--------->', this.cube.position)
    console.log('planes', this.planes)
    for (const intersect of intersects) {
      const { distance, face, faceIndex, object, point, uv } = intersect
      // this.cube.position.set(point.x, point.y, point.z)
      this.cube.visible = true
    }
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <TouchableView
          style={{ flex: 1 }}
          onTouchesBegan={({ locationX, locationY }) => this.updateTouch({ x: locationX, y: locationY })}
          onTouchesMoved={({ locationX, locationY }) => this.updateTouch({ x: locationX, y: locationY })}
        // onTouchesEnded={() => (this.cube.visible = false)}
        >

          <GraphicsView
            style={{ flex: 2 }}
            onContextCreate={this.onContextCreate}
            onRender={this.onRender}
            onResize={this.onResize}
            isArEnabled
            isArRunningStateEnabled
            isArCameraStateEnabled
            arTrackingConfiguration={AR.TrackingConfigurations.World}
          />
        </TouchableView>
      </View>
    );
  }

  componentDidMount() {
    // Turn off extra warnings
    THREE.suppressExpoWarnings(true);
    ThreeAR.suppressWarnings();
  }

  componentWillUnmount() {
    THREE.supressExpoWarnings(false)
  }

  onContextCreate = props => {
    AR.setPlaneDetection(AR.PlaneDetectionTypes.Horizontal);
    this.commonSetup(props);
  };

  commonSetup = async ({ gl, canvas, width, height, scale: pixelRatio, arSession }) => {
    this.renderer = new ExpoTHREE.Renderer({
      gl,
      pixelRatio,
      width,
      height,
    });
    console.log('width', width)
    console.log('height', height)
    this.scene = new THREE.Scene();
    this.scene.background = new ThreeAR.BackgroundTexture(this.renderer);
    this.camera = new ThreeAR.Camera(width, height, 0.01, 1000);
    //i want to make setupcube take in the new position, screen width, height
    this.setupARUtils();
    this.setupCube(0, 0)


    this.scene.add(new THREE.AmbientLight(0xffffff));
  };

  setupARUtils = () => {
    this.points = new ARUtils.Points();
    this.scene.add(this.points);
    this.planes = new ARUtils.Planes();
    this.scene.add(this.planes);
  };

  setupCube = (x, y) => {
    console.log("CREATING A CUBE!")
    const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);


    const material = new THREE.MeshPhongMaterial({ color: 0xff00ff })

    // Combine our geometry and material
    const cube = new THREE.Mesh(geometry, material);
    // Place the box 0.4 meters in front of us.
    cube.position.z = -0.4;
    // cube.position.set(x, y)
    // cube.visible = false
    // Add the cube to the scene
    this.scene.add(cube);
    this.cube = cube
    console.log('created cube', this.cube)
  }

  onResize = ({ x, y, scale, width, height }) => {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(scale);
    this.renderer.setSize(width, height);
  };

  onRender = () => {
    if (this.arSession) {
      this.points.updateWithSession(this.arSession);
      this.planes.updateWithSession(this.arSession);
    }
    this.renderer.render(this.scene, this.camera);
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
