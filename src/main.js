import "phaser";

import phaserJuice from "../../phaser3-juice-plugin/dist/phaserJuicePlugin.min.js";

import properties from "./properties";

import BootScene from "./scenes/BootScene";
import HudScene from "./scenes/HudScene";
import MapScene from "./scenes/MapScene";
import SpeechScene from "./scenes/SpeechScene";
import TitleScene from "./scenes/TitleScene";
import CreditsScene from "./scenes/CreditsScene";

const config = {
  type: Phaser.WEBGL,
  pixelArt: true,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: properties.width,
    height: properties.height,
    zoom: properties.scale,
  },
  parent: "game-container",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      // debug: {
      //   showBody: properties.debug,
      //   showStaticBody: properties.debug,
      // },
    },
  },
  plugins: {
    scene: [{ key: "phaserJuice", plugin: phaserJuice, mapping: "juice" }],
  },
  scene: [BootScene, TitleScene, HudScene, MapScene, SpeechScene, CreditsScene],
};

const game = new Phaser.Game(config); // eslint-disable-line no-unused-vars
