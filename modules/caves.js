import * as THREE from 'https://unpkg.com/three@0.126.1/build/three.module.js';
import { size } from '../main';
import { getNoiseValue } from './noise';

/**
 * This file returns the final noise value to main.js in the returnValue function 
 * We get the noise function from noise.js, with the function getNoiseValue(). 
 * At the moment you have to change the function you want to use inside getNoiseValue() itself.
 * The turbulence and FBM functions use the noise function of getNoiseValue();
 */


// Constants for FBM
var freq_multiplier = 0.17;
var ampl_multiplier = 0.2;
var num_octaves = 4;
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
    return (size-y)/size;
}

function translateDomainXYZ(x, y, z, offsetX, offsetY, offsetZ) {
    const translatedX = x + offsetX;
    const translatedY = y + offsetY;
    const translatedZ = z + offsetZ;
  
    return new THREE.Vector3(translatedX, translatedY, translatedZ);
  }

function translateDomain(x, y, z, s){
    var sc = s*size;
    return new THREE.Vector3(x+sc, y+sc, z+sc);
}

function turbulence(x, y, z) {
	var turbulence = 0.0;

    //same implementation as the one we used in the textures exercice
    for (var i = 0; i < num_octaves; i++) {
        const eval_point = new THREE.Vector2(Math.pow(freq_multiplier, i), Math.pow(freq_multiplier, i));
        const point = new THREE.Vector2(x, y);
        const result = eval_point.multiply(point);
        
        turbulence += Math.pow(ampl_multiplier, i) * Math.abs(getNoiseValue(result.x, result.y, z));
    }
    return turbulence;
}


function fbm3(x, y, z) {
    var fbm = 0.0;

    for (var i = 0; i < num_octaves; i++) {
        const eval_point = new THREE.Vector2(Math.pow(freq_multiplier, i), Math.pow(freq_multiplier, i));
        const point = new THREE.Vector2(x, y);
        const result = eval_point.multiply(point);
        
        fbm += Math.pow(ampl_multiplier, i) * getNoiseValue(result.x, result.y, z);
    }
    return fbm;
}

function fbm2(x, y, z) {
    var fbm = 0.0;

    for (var i = 0; i < num_octaves; i++) {
        const eval_point = new THREE.Vector2(Math.pow(freq_multiplier, i), Math.pow(freq_multiplier, i));
        const point = new THREE.Vector2(x, y);
        const result = eval_point.multiply(point);
        
        fbm += Math.pow(ampl_multiplier, i) * getNoiseValue(result.x, result.y);
    }
    return fbm;
}

function regularNoise(x, y, z){
    return getNoiseValue(x, y, z);
}

function returnValue(x, y, z){
    //return gradient(y);
    //return gradient(y) * turbulence(x, y, z);
    //return fbm3(x, y, z);
    //return overhangs(x,y,z);
    return regularNoise(x,y,z);
    return Math.abs(turbulence(x,y,z));
    var temp = translateDomain(x, y, z, 0.8*turbulence(x, y, z));
    return regularNoise(temp.x, temp.y, temp.z);
    return gradient(y + temp.y);
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


export{returnValue, updateAmplMultiplier, updateNumOctaves, updateFreqMultiplier}