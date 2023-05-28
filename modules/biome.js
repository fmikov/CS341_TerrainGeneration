var blocks = {
  desert: {
    color: 0xf4a460,
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
  wood: {
    color: 0x8b4513,
  },
  leaves: {
    color: 0x00ff00,
  },
};

function getBiome(n, depth) {
  if (depth < 20) {
    if (n < 0.1) return "forest";
    else if (n < 0.4) return "plains";
    else return "desert";
  } else return "stone";
}

export { blocks, getBiome };
