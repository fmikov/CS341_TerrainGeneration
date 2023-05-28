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
const size =100;
const height = 100;
const width = 80;
const gap = 0.01;

var cutoff = 0.5;

const geometry = new THREE.BoxGeometry(
  cubeSize,
  cubeSize,
  cubeSize
);
const material = new THREE.MeshPhongMaterial({color: 0xaaaaaa});
const cubes_instance = new THREE.InstancedMesh(
  geometry,
  material,
  Math.pow(width, 2)*height
);
//cubes_instance.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

grid.add(cubes_instance);
scene.add(grid);

//used as a "positioner" for every individual instance of the cube grid,
//we change any transforms of this variable, copy it to a cube instance in the grid,
//then we can overwrite it and go to the next cube instance
const cube = new THREE.Object3D();
const center = (width + gap * (width - 1)) * -0.5;

grid.position.set(center, center, center);

camera.position.z = width * 1.5;

function updateTerrain() {
  let i = 0;
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      for (let z = 0; z < width; z++) {
        const v = returnValue(x, y, z);
        //console.log(val + " " + y);
        if(v>= cutoff){
        //if(height >y && density > cutoff*(y/height)){
  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      for (let z = 0; z < size; z++) {
        var biome = getBiome(getNoiseValue2d(x, z), size - y);
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



//generation of new terrain on arrow presses
var leftTerrains = 0; // represented as 0
var rightTerrains = 0; // represented as 1
var upTerrains = 0; // represented as 2
var downTerrains = 0; // represented as 3

function generateExtraTerrain(direction){
  var xs = 0;
  var zs = 0;
  var xe = 0;
  var ze = 0;

  var chunks = 0;
  switch (direction) {
    case 0 :
      leftTerrains+=1;
      xs = -width*leftTerrains;
      zs = -width*downTerrains;
      xe = -width*(leftTerrains-1);
      ze = width*(upTerrains+1);
      chunks = downTerrains + upTerrains + 1;
    break;
    case 1 :
      rightTerrains+=1;
      xs = width*rightTerrains;
      zs = -width*downTerrains;
      xe = width*(rightTerrains+1);
      ze = width*(upTerrains+1);
      chunks = downTerrains + upTerrains + 1;
    break;
    case 2 :
      upTerrains+=1
      xs = -width*leftTerrains;
      zs = width*upTerrains;
      xe = width*(rightTerrains+1);
      ze = width*(upTerrains+1);
      chunks = rightTerrains + leftTerrains + 1;
    break;
    case 3 :
      downTerrains+=1;
      xs = -width*leftTerrains;
      zs = -width*downTerrains;
      xe = width*(rightTerrains+1);
      ze = -width*(downTerrains-1);
      chunks = rightTerrains + leftTerrains + 1
    break;
  }

  const geometry = new THREE.BoxGeometry(
    cubeSize,
    cubeSize,
    cubeSize
  );
  const material = new THREE.MeshPhongMaterial({color: 0xaaaaaa});
  const cubes_instance = new THREE.InstancedMesh(
    geometry,
    material,
    Math.pow(width, 2)*height*chunks
  );
  //cubes_instance.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

  grid.add(cubes_instance);
  scene.add(grid);

  //used as a "positioner" for every individual instance of the cube grid,
  //we change any transforms of this variable, copy it to a cube instance in the grid,
  //then we can overwrite it and go to the next cube instance
  const cube = new THREE.Object3D();
  const center = (width + gap * (width - 1)) * -0.5;

  grid.position.set(center, center, center);

  camera.position.z = width * 1.5;

  function updateTerrain(){
    let i = 0;
    for (let x = xs; x < xe; x++) {
      for (let y = 0; y < height; y++) {
        for (let z = zs; z < ze; z++) {
          const v = returnValue(x, y, z);
          if(v>= cutoff){
          //if(height >y && density > cutoff*(y/height)){
            cube.position.set(x, y, z);
            cube.updateMatrix();
            cubes_instance.setMatrixAt(i, cube.matrix);
          }
          cubes_instance.instanceMatrix.needsUpdate = true;
          i++;
        }
      }
    }
  }
  updateTerrain();

}

document.addEventListener('keydown', function(event) {
  const key = event.key.toLowerCase();

  if (key === 'w') {
    // Code to handle 'w' key press
    console.log('The "w" key was pressed.');
    generateExtraTerrain(2);
  } else if (key === 'a') {
    // Code to handle 'a' key press
    console.log('The "a" key was pressed.');
    generateExtraTerrain(0);
  } else if (key === 's') {
    // Code to handle 's' key press
    console.log('The "s" key was pressed.');
    generateExtraTerrain(3);
  } else if (key === 'd') {
    // Code to handle 'd' key press
    console.log('The "d" key was pressed.');
    generateExtraTerrain(1);
  }
});





//exporting for use in other scripts
export {updateTerrain, setUpdateFlag, size , width, height, updateCutoff};
export { updateTerrain, setUpdateFlag, size, updateCutoff };
