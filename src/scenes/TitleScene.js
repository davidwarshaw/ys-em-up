import properties from "../properties";

import Font from "../ui/Font";

import InputMultiplexer from "../utils/InputMultiplexer";

export default class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: "TitleScene" });
  }

  create() {
    this.playState = {
      currentMap: {
        key: "map-overworld-forest-01",
        spawn: { x: 9, y: 6 },
      },
      playerState: {
        health: 50,
        healthMax: 50,
      },
      currentEnemy: null,
    };
    this.font = new Font(this);

    const centerX = properties.width / 2;
    const centerY = properties.height / 2;

    this.images = [];

    this.images.push(this.add.image(centerX, centerY, "title-big"));

    const offsetY = 70;
    const text = "Press Any Key or Button";
    const offsetX = this.font.offsetForText(text);
    this.images.push(this.font.render(centerX + offsetX, centerY + offsetY, text));

    this.inputMultiplexer = new InputMultiplexer(this);

    this.sounds = {
      newGame: this.sound.add("new-game"),
    };
  }

  update() {
    this.inputMultiplexer.setPadButtons();

    if (this.inputMultiplexer.anyPressed()) {
      this.nextScene();
    }
  }

  nextScene() {
    this.sounds.newGame.play();
    // this.scene.start("GameScene", this.playState);
    this.scene.start("MapScene", this.playState);
    this.scene.start("HudScene", this.playState);
  }
}
