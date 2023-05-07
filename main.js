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
const size = 20;
const gap = 0.01;

const geometry = new THREE.BoxGeometry(
  cubeSize,
  cubeSize,
  cubeSize
);
const material = new THREE.MeshBasicMaterial({color: 0xffffff, vertexColors: true});
//const material = new THREE.MeshNormalMaterial();
const cubes = new THREE.InstancedMesh(
  geometry,
  material,
  Math.pow(size, 3)
);
cubes.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

grid.add(cubes);
scene.add(grid);

const cube = new THREE.Object3D();
const center = (size + gap * (size - 1)) * -0.5;

grid.position.set(center, center, center);

camera.position.z = size * 1.5;


function animate() {
  requestAnimationFrame(animate);

  let i = 0;
  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      for (let z = 0; z < size; z++) {
        cube.position.set(x, y, z);
        const val = Perlin3D(x, y, z)*100;
        const c = new THREE.Color(val, val, val);
        const material2 = new THREE.MeshNormalMaterial();
        cubes.material = material2;
        cubes.setColorAt(i, c);
        cube.updateMatrix();
        cubes.setMatrixAt(i, cube.matrix);
        i++;
      }
    }
  }

  cubes.instanceMatrix.needsUpdate = true;
  cubes.instanceColor.needsUpdate = true;

  controls.update();
  renderer.render(scene, camera);
};
animate();
