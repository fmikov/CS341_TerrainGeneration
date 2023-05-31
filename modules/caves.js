import * as THREE from 'https://unpkg.com/three@0.126.1/build/three.module.js';
import { height, size, width } from '../main';
import { simplex3, perlin3, simplex2, perlin2 } from './noise';

// Constants for FBM
var freq_multiplier = 0.87;
var ampl_multiplier = 0.2;
var num_octaves = 2;
function updateFreqMultiplier(f){
    freq_multiplier = f;
}
function updateAmplMultiplier(a){
    ampl_multiplier = a;
}
function updateNumOctaves(o){
    num_octaves = o;
}



function gradient(y){
    return (height-y)/height;
}

function translateDomainXYZ(x, y, z, offsetX, offsetY, offsetZ) {
    const translatedX = x + offsetX;
    const translatedY = y + offsetY;
    const translatedZ = z + offsetZ;
  
    return new THREE.Vector3(translatedX, translatedY, translatedZ);
  }

function translateDomain(x, y, z, s){
    const sw = s*width;
    const sh = s*height
    return new THREE.Vector3(x+sw, y+sh, z+sw);
}

function turbulence3(x, y, z, freq_multiplier = 0.2, ampl_multiplier = 0.2) {
	var turbulence = 0.0;

    //same implementation as the one we used in the textures exercice
    for (var i = 0; i < num_octaves; i++) {
        const eval_point = new THREE.Vector3(Math.pow(freq_multiplier, i), Math.pow(freq_multiplier, i), Math.pow(freq_multiplier, i));
        const point = new THREE.Vector3(x, y, z);
        const result = eval_point.multiply(point);
        
        turbulence += Math.pow(ampl_multiplier, i) * Math.abs(perlin3(result.x, result.y, result.z, 0.06));
    }
    return turbulence;
}

function fbm3(x, y, z) {
    var fbm = 0.0;

    for (var i = 0; i < num_octaves; i++) {
        const eval_point = new THREE.Vector3(Math.pow(freq_multiplier, i), Math.pow(freq_multiplier, i), Math.pow(freq_multiplier, i));
        const point = new THREE.Vector3(x, y, z);
        const result = eval_point.multiply(point);
        
        fbm += Math.pow(ampl_multiplier, i) * perlin3(result.x, result.y, result.z, 0.08);
    }
    return fbm;
}

function fbm2(x, y, scale, offset = 0, freq_multiplier = 0.17, ampl_multiplier = 0.2, num_octaves = 4) {
    var fbm = 0.0;
    for (var i = 0; i < num_octaves; i++) {
        const eval_point = new THREE.Vector2(Math.pow(freq_multiplier, i), Math.pow(freq_multiplier, i));
        const point = new THREE.Vector2(x, y);
        const result = eval_point.multiply(point);
        
        fbm += Math.pow(ampl_multiplier, i) * simplex2(result.x, result.y, scale, offset);
    }
    return fbm;
  }
  
function turbulence2(x, y, scale = 0.05, offset = 0, freq_multiplier = 0.17, ampl_multiplier = 0.2, num_octaves = 4) {
    var fbm = 0.0;
    for (var i = 0; i < num_octaves; i++) {
        const eval_point = new THREE.Vector2(Math.pow(freq_multiplier, i), Math.pow(freq_multiplier, i));
        const point = new THREE.Vector2(x, y);
        const result = eval_point.multiply(point);
        
        fbm += Math.pow(ampl_multiplier, i) * Math.abs(simplex2(result.x, result.y, scale, offset));
    }
    return fbm;
}

//any number of points, assumes first half of arguments are x axis, the rest their corresponding y axis points.
//use like this: createLinearInterpolator([1,1], [2,2], [3,3])
function createLinearInterpolator(...points) {
    // Sort the points based on the x-coordinate
    points.sort((a, b) => a[0] - b[0]);
  
    return function(x) {
      // Find the interval in which x falls
      let i = 0;
      while (i < points.length && x > points[i][0]) {
        i++;
      }
  
      // Handle boundary cases
      if (i === 0) {
        return points[0][1];
      }
      if (i === points.length) {
        return points[points.length - 1][1];
      }
  
      // Perform linear interpolation
      const [x0, y0] = points[i - 1];
      const [x1, y1] = points[i];
      const t = (x - x0) / (x1 - x0);
      return y0 + t * (y1 - y0);
    };
  }

function lerp(a, b, t) {
    return a * (1 - t) + b * t;
}

const continentalness = createLinearInterpolator([0.1, 1], [0.37, 0.1], [0.4, 0.1], [0.41, 0.4], [0.53, 0.5], [0.55, 0.8], [0.7, 0.9], [1, 1]);
const erosion = createLinearInterpolator([0., 1], [0.15, 0.7], [0.29, 0.5], [0.33, 0.58], [0.45, 0.1], [0.8, 0.08], [0.82, 0.25], [0.9, 0.25], [0.91, 0.1]);
const peaks = createLinearInterpolator([0., 0.], [0.1, 0.1], [0.35, 0.33], [0.5, 0.35], [0.7, 0.85], [0.8, 1], [1, 0.9]);
const squashing = createLinearInterpolator([0., 1,], [0.3, 0.6], [0.6, 0.63], [0.7, 0.55], [0.8, 0.65], [0.87, 1], [1, 0]);



function caveFalloff(y){
    if(y > height/2) return 0.5;
    if(y < height/2 && y > height/3) return gradient(y);
    //(height-y)/height;
    return 2.0/3.0;
}

function clampDensity(value) {
    return Math.max(0, Math.min(1, value));
}

function getTerrainAndCaves(x, y, z){
    //first value is for caves, second for terrain?
    //return [1, terrain(x,y,z)]
    return [caves(x,y,z)*(1+caveFalloff(y)), terrain(x, y, z)+((caveFalloff(y)*(height/2)))];
}

function caves(x,y,z){
    return turbulence3(x,y,z, 2) - perlin3(x,y,z, 0.05);
}

function terrain(x,y,z){
    var c = (perlin2(x, z, 0.005, 0) + 1) / 2;
    var e = (perlin2(x, z, 0.01, 0) + 1) / 2;
    var p = (turbulence2(x/2, z/2, 0.0015, 0) + 1) / 2;

    // Subtract erosion from peaks, ensuring the result is not negative
    var adjustedPeaks = Math.max(0.01, peaks(p) - erosion(e));

    return Math.pow(height*continentalness(c)*peaks(p)*10, erosion(e));
  }

function returnValue(x, y, z){
    // let temp = y + 10*perlin2(x,z,0.04);
    // let terr = terrain(x,y,z);
    // if((temp) < terr ) return 1;
    // return 0;




    //this was for testing, worse results I think
    var t = getTerrainAndCaves(x,y,z);
    if(y + 10*perlin2(x,z,0.04) < t[1]+((caveFalloff(y)*(height/2))) && t[0]*(1+caveFalloff(y)) > 0.3){
        return 1;
    }
    return 0;


    const terrainHeight = terrain(x, y, z);
    const caveNoiseValue = caves(x, y, z);
    
    const scaledTerrainHeight = terrainHeight * height;

    const isCave = caveNoiseValue < 0.4 ? 1 : 0;

    var blockValue = y <= scaledTerrainHeight ? (1 - isCave) : 0;
    var squash = (terrainHeight - y) * terrainHeight*0.9;
    return caveNoiseValue +squash;
}



//Some combinations that are interesting, might have to change noise scale and stuff:
//uses simplex2 in noise.js
function overhangs(x, y, z){
    var xo = 10*fbm3(x, y, z)
    var t = translateDomainXYZ(x, y, z, xo, xo, xo);
    var temp = translateDomain(x, y, z, 0.5*fbm3(t.x, t.z, 1));
    return gradient(y + temp.y);
}
//maybe height bias, density (perlin3d output) decreased at higher levels, increased at lower.


export{returnValue, updateAmplMultiplier, updateNumOctaves, updateFreqMultiplier, fbm2, turbulence2}