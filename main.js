import * as THREE from 'three'
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/controls/OrbitControls.js";
//import * as P5 from "https://cdn.jsdelivr.net/npm/p5@1.6.0/lib/p5.js";
import './style.css'


const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const controls = new OrbitControls(camera, renderer.domElement);

const grid = new THREE.Group();

const cubeSize = 0.9;
const size = 50;
const gap = 0.01;

const geometry = new THREE.BoxGeometry(
  cubeSize,
  cubeSize,
  cubeSize
);
const material = new THREE.MeshPhongMaterial({color: 0xaaaaaa});
const cubes_instance = new THREE.InstancedMesh(
  geometry,
  material,
  Math.pow(size, 3)
);
//cubes_instance.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

grid.add(cubes_instance);
scene.add(grid);

//used as a "positioner" for every individual instance of the cube grid,
//we change any transforms of this variable, copy it to a cube instance in the grid,
//then we can overwrite it and go to the next cube instance
const cube = new THREE.Object3D();
const center = (size + gap * (size - 1)) * -0.5;

grid.position.set(center, center, center);

camera.position.z = size * 1.5;

let i = 0;
  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      for (let z = 0; z < size; z++) {
        const val = getNoiseValue(x, y, z);
        if(val > 0.3){
          cube.position.set(x, y, z);
          cube.updateMatrix();
          cubes_instance.setMatrixAt(i, cube.matrix);
          i++;
        }
      }
    }
  }



  //lighting
  const ambient = new THREE.AmbientLight(0x404040);
  const directional = new THREE.DirectionalLight(0x404040, 5);
  
  scene.add(ambient, directional);




function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
};
animate();
