import {height, width} from '../main'

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
};

function getBiome(n, y) {
  if (y > 3 * height / 4 ) return "snow";
  if (y > height / 2) {
    if (n < 0.1) return "forest";
    else if (n < 0.4) return "plains";
    else return "desert";
  }
  if(y > height/2 - height/14) return "dirt";
  if (true) return "stone";
}

export { blocks, getBiome };
