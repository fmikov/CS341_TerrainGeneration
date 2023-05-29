import {height, width} from '../main'
import {turbulence2, fbm2} from '../modules/caves'
import {perlin2} from "./noise.js";

var blocks = {
  desert: {
    color: 0xFBCE00,
  },
  plains: {
    color: 0x7cfc00,
  },
  forest: {
    color: 0x228b22,
  },
  stone: {
    color: 0x808080,
  },
  snow: {
    color: 0xffffff,
  },
  dirt: {
    color: 0x965E00,
  },
  wood: {
    color: 0x8b4513,
  },
  leaves: {
    color: 0x00ff00,
  },
  water: {
    color: 0x0029DF,
  },
};

function getBiome(x, yin, z) {
  let n = fbm2(x, z, 0.01);
  let n2 = perlin2(x, z, 0.04)
  let y = yin + 4*fbm2(x,z, 0.04, 0.0);
  if (y > 3 * height / 4 ) return "snow";
  if (y > height / 2 - height/10) {
    if (turbulence2(x+n2, z, 0.02) < 0.2
        && yin >height/2 && yin < height/2 +5 ) return "water";
    if (n < 0.2) return "forest";
    else if (n <0.4) return "plains";
    return "desert";
  }
  if(y > height / 2 - height / 8) return "dirt";
  if (true) return "stone";
}

export { blocks, getBiome };
