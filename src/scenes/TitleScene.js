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
        key: "map-overworld-village-01",
        spawn: { x: 9, y: 25, direction: "up" },
      },
      playerState: {
        health: 50,
        healthMax: 50,
        hasItem: false,
        bossDefeated: false,
      },
      currentEnemy: null,
      currentSpeechCharacter: null,
      sfx: null,
      music: null,
    };
    this.font = new Font(this);

    const centerX = properties.width / 2;
    const centerY = properties.height / 2;

    this.images = [];

    this.images.push(this.add.image(centerX, centerY, "title-big"));

    const offsetY = 70;
    const text = "Press Any Key or Button";
    const offsetX = this.font.offsetForText(text);
    // this.images.push(this.font.render(centerX + offsetX, centerY + offsetY, text));

    this.inputMultiplexer = new InputMultiplexer(this);

    this.playState.sfx = {
      newGame: this.sound.add("new-game"),
      hit: this.sound.add("hit"),
      // engine: this.sound.add("engine"),
      // stomp: this.sound.add("stomp"),
      // coin: this.sound.add("coin"),
    };

    this.playState.music = {
      overworld: this.sound.add("overworld-music"),
      dungeon: this.sound.add("dungeon-music"),
      boss: this.sound.add("boss-music"),
    };

    this.playState.music.overworld.play({ loop: true, volume: 0.5 });
  }

  update() {
    this.inputMultiplexer.setPadButtons();

    if (this.inputMultiplexer.anyPressed()) {
      this.nextScene();
    }
  }

  nextScene() {
    this.playState.sfx.newGame.play();
    this.scene.start("MapScene", this.playState);
    this.scene.start("HudScene", this.playState);
  }
}
