import * as THREE from "https://unpkg.com/three@0.126.1/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/controls/OrbitControls.js";
//import * as P5 from "https://cdn.jsdelivr.net/npm/p5@1.6.0/lib/p5.js";
import { getNoiseValue, getNoiseValue2d } from "./modules/noise";
import { returnValue } from "./modules/caves";
import { blocks, getBiome } from "./modules/biome";
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

const cubeSize = 1;
const size = 80;
const gap = 0.01;

var cutoff = 0.3;

const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
const material = new THREE.MeshPhongMaterial({ color: 0xaaaaaa });
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

function updateTerrain() {
  let i = 0;
  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      for (let z = 0; z < size; z++) {
        var biome = getBiome(getNoiseValue(x, y, z), size - y);
        const val = returnValue(x, y, z);
        if (val > cutoff) {
          cube.position.set(x, y, z);
          cube.updateMatrix();
          cubes_instance.setMatrixAt(i, cube.matrix);
        }
        cubes_instance.setColorAt(i, new THREE.Color(blocks[biome].color));
        cubes_instance.instanceMatrix.needsUpdate = true;

        if (biome == "forest" && val > cutoff && y == size - 1) {
          //tree generation
          if (Math.random() < 0.05) {
            const tree_height = 2;
            const tree = new THREE.Group();
            const trunk = new THREE.Mesh(
              new THREE.CylinderGeometry(0.2, 0.2, tree_height, 5),
              new THREE.MeshPhongMaterial({ color: 0x8b4513 })
            );
            const leaves = new THREE.Mesh(
              new THREE.SphereGeometry(1, 8, 8),
              new THREE.MeshPhongMaterial({ color: 0x00ff00 })
            );
            leaves.position.set(0, tree_height, 0);
            tree.add(trunk, leaves);
            tree.position.set(x, y + tree_height, z);
            cubes_instance.add(tree);
          }
        }
        i++;
      }
    }
  }
}
updateTerrain();

//lighting
const ambient = new THREE.AmbientLight(0x404040);
const directional_up = new THREE.DirectionalLight(0x404040, 1);
const directional_down = new THREE.DirectionalLight(0x404040, 1);
directional_down.position.set(0, -1, 0);

scene.add(ambient, directional_up, directional_down);

var update_flag = true;
function setUpdateFlag(bool) {
  update_flag = bool;
}
function updateCutoff(cut) {
  cutoff = cut;
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  if (update_flag) {
    updateTerrain();
    update_flag = false;
  }
  renderer.render(scene, camera);
}
animate();

//exporting for use in other scripts
export { updateTerrain, setUpdateFlag, size, updateCutoff };
