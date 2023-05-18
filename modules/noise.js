import * as THREE from 'https://unpkg.com/three@0.126.1/build/three.module.js';
import { size } from '../main';

const r = Math;

function Grad(x, y, z) {
  this.x = x; this.y = y; this.z = z;
}

Grad.prototype.dot2 = function(x, y) {
  return this.x*x + this.y*y;
};

Grad.prototype.dot3 = function(x, y, z) {
  return this.x*x + this.y*y + this.z*z;
};

var grad3 = [new Grad(1,1,0),new Grad(-1,1,0),new Grad(1,-1,0),new Grad(-1,-1,0),
              new Grad(1,0,1),new Grad(-1,0,1),new Grad(1,0,-1),new Grad(-1,0,-1),
              new Grad(0,1,1),new Grad(0,-1,1),new Grad(0,1,-1),new Grad(0,-1,-1)];
  
//constant for now, for testing
var p = [151,160,137,91,90,15,
  131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,
  190, 6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,
  88,237,149,56,87,174,20,125,136,171,168, 68,175,74,165,71,134,139,48,27,166,
  77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,
  102,143,54, 65,25,63,161, 1,216,80,73,209,76,132,187,208, 89,18,169,200,196,
  135,130,116,188,159,86,164,100,109,198,173,186, 3,64,52,217,226,250,124,123,
  5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,
  223,183,170,213,119,248,152, 2,44,154,163, 70,221,153,101,155,167, 43,172,9,
  129,22,39,253, 19,98,108,110,79,113,224,232,178,185, 112,104,218,246,97,228,
  251,34,242,193,238,210,144,12,191,179,162,241, 81,51,145,235,249,14,239,107,
  49,192,214, 31,181,199,106,157,184, 84,204,176,115,121,50,45,127, 4,150,254,
  138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];
// To remove the need for index wrapping, double the permutation table length 
var perm = new Array(512); 
var gradP = new Array(512);
for(var i=0; i<512; i++) {
    perm[i]=p[i & 255];
    gradP[i] = gradP[i + 256] = grad3[perm[i] % 12];
}

function dot(g, x, y, z) { 
    return g[0]*x + g[1]*y + g[2]*z; 
};

function dot2(g, x, y) {
  return g[0]*x + g[1]*y;
}

function mix(a, b, t) { 
    return (1.0-t)*a + t*b; 
};

function fade(t) { 
    return t*t*t*(t*(t*6.0-15.0)+10.0); 
};

//linear interpolate
function lerp(a, b, t) {
  return (1-t)*a + t*b;
}



var noiseOffset = 10;
var noiseScale = 0.05;

// Skewing and unskewing factors for 2, 3, and 4 dimensions
var F2 = 0.5*(Math.sqrt(3)-1);
var G2 = (3-Math.sqrt(3))/6;

var F3 = 1/3;
var G3 = 1/6;

function getNoiseValue(x, y, z) {
    x = x * noiseScale + noiseOffset;
    z = z * noiseScale + noiseOffset;
    y = y * noiseScale + noiseOffset;
    return perlin3(x, y, z);
  }
function updateNoiseScale(noise_scale) {
  noiseScale = noise_scale;
}
function updateNoiseOffset(noise_offset) {
  noiseOffset = noise_offset;
}

function perlin3 (x, y, z) {
  // Find unit grid cell containing point
  var X = Math.floor(x), Y = Math.floor(y), Z = Math.floor(z);
  // Get relative xyz coordinates of point within that cell
  x = x - X; y = y - Y; z = z - Z;
  // Wrap the integer cells at 255 (smaller integer period can be introduced here)
  X = X & 255; Y = Y & 255; Z = Z & 255;

  // Calculate noise contributions from each of the eight corners
  var n000 = gradP[X+  perm[Y+  perm[Z  ]]].dot3(x,   y,     z);
  var n001 = gradP[X+  perm[Y+  perm[Z+1]]].dot3(x,   y,   z-1);
  var n010 = gradP[X+  perm[Y+1+perm[Z  ]]].dot3(x,   y-1,   z);
  var n011 = gradP[X+  perm[Y+1+perm[Z+1]]].dot3(x,   y-1, z-1);
  var n100 = gradP[X+1+perm[Y+  perm[Z  ]]].dot3(x-1,   y,   z);
  var n101 = gradP[X+1+perm[Y+  perm[Z+1]]].dot3(x-1,   y, z-1);
  var n110 = gradP[X+1+perm[Y+1+perm[Z  ]]].dot3(x-1, y-1,   z);
  var n111 = gradP[X+1+perm[Y+1+perm[Z+1]]].dot3(x-1, y-1, z-1);

  // Compute the fade curve value for x, y, z
  var u = fade(x);
  var v = fade(y);
  var w = fade(z);

  // Interpolate
  return lerp(
      lerp(
        lerp(n000, n100, u),
        lerp(n001, n101, u), w),
      lerp(
        lerp(n010, n110, u),
        lerp(n011, n111, u), w),
     v);
};


function simplex2(xin, yin) {
  var n0, n1, n2; // Noise contributions from the three corners
  // Skew the input space to determine which simplex cell we're in
  var s = (xin+yin)*F2; // Hairy factor for 2D
  var i = Math.floor(xin+s);
  var j = Math.floor(yin+s);
  var t = (i+j)*G2;
  var x0 = xin-i+t; // The x,y distances from the cell origin, unskewed.
  var y0 = yin-j+t;
  // For the 2D case, the simplex shape is an equilateral triangle.
  // Determine which simplex we are in.
  var i1, j1; // Offsets for second (middle) corner of simplex in (i,j) coords
  if(x0>y0) { // lower triangle, XY order: (0,0)->(1,0)->(1,1)
    i1=1; j1=0;
  } else {    // upper triangle, YX order: (0,0)->(0,1)->(1,1)
    i1=0; j1=1;
  }
  // A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and
  // a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where
  // c = (3-sqrt(3))/6
  var x1 = x0 - i1 + G2; // Offsets for middle corner in (x,y) unskewed coords
  var y1 = y0 - j1 + G2;
  var x2 = x0 - 1 + 2 * G2; // Offsets for last corner in (x,y) unskewed coords
  var y2 = y0 - 1 + 2 * G2;
  // Work out the hashed gradient indices of the three simplex corners
  i &= 255;
  j &= 255;
  var gi0 = gradP[i+perm[j]];
  var gi1 = gradP[i+i1+perm[j+j1]];
  var gi2 = gradP[i+1+perm[j+1]];
  // Calculate the contribution from the three corners
  var t0 = 0.5 - x0*x0-y0*y0;
  if(t0<0) {
    n0 = 0;
  } else {
    t0 *= t0;
    n0 = t0 * t0 * gi0.dot2( x0, y0);  // (x,y) of grad3 used for 2D gradient
  }
  var t1 = 0.5 - x1*x1-y1*y1;
  if(t1<0) {
    n1 = 0;
  } else {
    t1 *= t1;
    n1 = t1 * t1 * gi1.dot2( x1, y1);
  }
  var t2 = 0.5 - x2*x2-y2*y2;
  if(t2<0) {
    n2 = 0;
  } else {
    t2 *= t2;
    n2 = t2 * t2 * gi2.dot2( x2, y2);
  }
  // Add contributions from each corner to get the final noise value.
  // The result is scaled to return values in the interval [-1,1].
  return 70 * (n0 + n1 + n2);
};

export {updateNoiseScale, getNoiseValue, updateNoiseOffset};















//thisis from lecture slides:
// public final class ImprovedNoise {
//     static public double noise(double x, double y, double z) {
//        int X = (int)Math.floor(x) & 255,                  // FIND UNIT CUBE THAT
//            Y = (int)Math.floor(y) & 255,                  // CONTAINS POINT.
//            Z = (int)Math.floor(z) & 255;
//        x -= Math.floor(x);                                // FIND RELATIVE X,Y,Z
//        y -= Math.floor(y);                                // OF POINT IN CUBE.
//        z -= Math.floor(z);
//        double u = fade(x),                                // COMPUTE FADE CURVES
//               v = fade(y),                                // FOR EACH OF X,Y,Z.
//               w = fade(z);
//        int A = p[X  ]+Y, AA_ = p[A]+Z, AB_ = p[A+1]+Z,      // HASH COORDINATES OF
//            B = p[X+1]+Y, BA_ = p[B]+Z, BB_ = p[B+1]+Z;      // THE 8 CUBE CORNERS,
 
//        return lerp(w, lerp(v, lerp(u, grad(p[AA_  ], x  , y  , z   ),  // AND ADD
//                                       grad(p[BA_  ], x-1, y  , z   )), // BLENDED
//                               lerp(u, grad(p[AB_  ], x  , y-1, z   ),  // RESULTS
//                                       grad(p[BB_  ], x-1, y-1, z   ))),// FROM  8
//                       lerp(v, lerp(u, grad(p[AA_+1], x  , y  , z-1 ),  // CORNERS
//                                       grad(p[BA_+1], x-1, y  , z-1 )), // OF CUBE
//                               lerp(u, grad(p[AB_+1], x  , y-1, z-1 ),
//                                       grad(p[BB_+1], x-1, y-1, z-1 ))));
//     }
//     static double fade(double t) { return t * t * t * (t * (t * 6 - 15) + 10); }
//     static double lerp(double t, double a, double b) { return a + t * (b - a); }
//     static double grad(int hash, double x, double y, double z) {
//        int h = hash & 15;                      // CONVERT LO 4 BITS OF HASH CODE_
//        double u = h<8 ? x : y,                 // INTO 12 GRADIENT DIRECTIONS.
//               v = h<4 ? y : h==12||h==14 ? x : z;
//        return ((h&1) == 0 ? u : -u) + ((h&2) == 0 ? v : -v);
//     }
// }