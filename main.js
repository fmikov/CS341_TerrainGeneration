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

const simplex = new SimplexNoise();
const gridSize = 40;
const cubeSize2 = 1;
const noiseScale = 0.5;
function getColorFromNoise(x, y, z) {
  const noise = Perlin3D(x * noiseScale, y * noiseScale, z * noiseScale);
  const hue = (noise + 1) / 2; // Normalize noise to range [0, 1]
  return new THREE.Color().setHSL(hue, 1, 0.5); // Convert HSL color
}
for (let x = 0; x < gridSize; x++) {
  for (let y = 0; y < gridSize; y++) {
    for (let z = 0; z < gridSize; z++){
      const val = getNoiseValue(x, y, z);
      const cubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
      console.log(getNoiseValue(x, y, z));
      //const color = new THREE.Color(val, val, val);
      const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0xaaaaaa });
      const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);

      // Position the cube within the grid
      cube.position.x = (x - gridSize / 2) * cubeSize;
      cube.position.y = (y - gridSize / 2) * cubeSize;
      cube.position.z = (z - gridSize / 2) * cubeSize;

      if(val > 0.3){
        scene.add(cube);
      }
    }
  }
}


function animate() {
  requestAnimationFrame(animate);

  // let i = 0;
  // for (let x = 0; x < size; x++) {
  //   for (let y = 0; y < size; y++) {
  //     for (let z = 0; z < size; z++) {
  //       cube.position.set(x, y, z);
  //       const val = Perlin3D(x, y, z)*100;
  //       const c = new THREE.Color(val, val, val);
  //       const material2 = new THREE.MeshNormalMaterial();
  //       cubes.material = material2;
  //       cubes.setColorAt(i, c);
  //       cube.updateMatrix();
  //       cubes.setMatrixAt(i, cube.matrix);
  //       i++;
  //     }
  //   }
  // }

  // cubes.instanceMatrix.needsUpdate = true;
  // cubes.instanceColor.needsUpdate = true;

  controls.update();
  renderer.render(scene, camera);
};
animate();
