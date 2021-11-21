import * as ROT from "rot-js";

ROT.RNG.setSeed(Date.now());

export default {
  debug: true,
  rng: ROT.RNG,
  width: 320,
  height: 208,
  hudHeight: 32,
  scale: 2,
  speechWindowHeight: 40,
  ninePatchDimension: {
    top: 4,
    bottom: 4,
    left: 4,
    right: 4,
  },
  tileWidth: 16,
  tileHeight: 16,
  mapWidthTiles: 100,
  mapHeightTiles: 100,
  knockbackMillis: 100,
  fadeMillis: 200,
  flickerFrames: 0.5,
  flickerMillis: 600,
  cameraPauseMillis: 2000,
  animFrameRate: 6,
};
