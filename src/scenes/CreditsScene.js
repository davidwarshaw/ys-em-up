import properties from "../properties";

import Font from "../ui/Font";

import InputMultiplexer from "../utils/InputMultiplexer";

export default class CreditsScene extends Phaser.Scene {
  constructor() {
    super({ key: "CreditsScene" });
  }

  init(playState) {
    this.playState = playState;
  }

  create() {
    this.font = new Font(this);

    const centerX = properties.width / 2;
    const centerY = properties.height / 2;

    this.add.image(centerX, centerY - 66, "title-big");

    this.texts = [
      ["", "Thanks for Playing!"],
      ["Design and Code", "never-k"],
      ["Art and Story", "helpcomputer0"],
      ["Music", "Bruno Almeida"],
      ["", "PRESS Z KEY TO CONTINUE"],
    ];

    const offsetY = -40;

    this.images = this.texts.map((pair, i) =>
      pair.map((text, j) => {
        const offsetX = this.font.offsetForText(text);
        const rowOffset = 28 * i + 12 * j;
        const textImage = this.font.render(centerX + offsetX, centerY + offsetY + rowOffset, text);
        return textImage;
      })
    );

    this.inputMultiplexer = new InputMultiplexer(this);
  }

  update() {
    this.inputMultiplexer.setPadButtons();

    if (this.inputMultiplexer.actionPressed()) {
      this.resumePlay();
    }
  }

  resumePlay() {
    this.playState.sfx.newGame.play();
    this.scene.stop("CreditsScene", this.playState);
    this.scene.resume("MapScene", this.playState);
    this.scene.setVisible(true, "MapScene");
    this.scene.setVisible(true, "HudScene");
  }
}
