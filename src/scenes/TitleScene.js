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
        key: "map-dungeon-ante-chamber-02",
        spawn: { x: 5, y: 25 },
      },
      currentEnemy: null,
    };

    this.font = new Font(this);

    const centerX = properties.width / 2;
    const centerY = properties.height / 2;

    this.images = [];

    this.images.push(this.add.image(centerX, centerY, "title-big"));

    const offsetY = 70;
    const text = "press any key or button";
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
