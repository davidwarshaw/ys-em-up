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
        seenCredits: false,
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

    this.images.push(this.add.image(centerX, centerY - 32, "title-big"));

    const offsetY = 70;
    const text = "PRESS Z KEY TO START";
    const offsetX = this.font.offsetForText(text);
    this.images.push(this.font.render(centerX + offsetX, centerY + offsetY, text));

    this.inputMultiplexer = new InputMultiplexer(this);

    this.playState.sfx = {
      newGame: this.sound.add("new-game"),

      hit: this.sound.add("hit"),
      hitBullet: this.sound.add("hit-bullet"),
      fallInPit: this.sound.add("fall-in-pit"),

      playerPrepCharge: this.sound.add("player-prep-charge"),
      playerCharge: this.sound.add("player-charge"),
      itemPickup: this.sound.add("item-pickup"),

      playerDeath: this.sound.add("player-death"),
      enemyDeath: this.sound.add("enemy-death"),
      bossDeath: this.sound.add("boss-death"),

      enemyFly: this.sound.add("enemy-fly"),
      enemyCharge: this.sound.add("enemy-charge"),
      enemyBullet: this.sound.add("enemy-bullet"),

      bossPrepCharge: this.sound.add("boss-prep-charge"),
      bossCharge: this.sound.add("boss-charge"),
      bossHitWall: this.sound.add("boss-hit-wall"),

      speech: this.sound.add("speech"),
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
