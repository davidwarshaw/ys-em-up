import properties from "../properties";

import Font from "../ui/Font";

export default class HudScene extends Phaser.Scene {
  constructor() {
    super({ key: "HudScene" });
  }

  init(playState) {
    this.playState = playState;
  }

  create() {
    this.font = new Font(this);

    this.hudY = properties.height - properties.hudHeight;

    this.cameras.main.setViewport(0, this.hudY, properties.width, properties.hudHeight);

    this.background = this.add
      .rectangle(0, this.hudY, properties.width, properties.hudHeight, 0x000000)
      .setOrigin(0, 0);

    const frameX = 64;
    const barWidth = 246;
    const barHeight = 8;
    const barColor = 0x61d3e3;
    const barMaxColor = 0xb21030;

    this.add.image(0, 0, "hud").setOrigin(0, 0).setDepth(10);

    this.playerHealthBarMax = this.add
      .rectangle(frameX, 6, 0, barHeight, barMaxColor)
      .setOrigin(0, 0);
    this.playerHealthBar = this.add.rectangle(frameX, 6, 0, barHeight, barColor).setOrigin(0, 0);

    this.enemyHealthBarMax = this.add
      .rectangle(frameX, 6 + 4 + 8, 0, barHeight, barMaxColor)
      .setOrigin(0, 0);
    this.enemyHealthBar = this.add
      .rectangle(frameX, 6 + 4 + 8, 0, barHeight, barColor)
      .setOrigin(0, 0);
  }

  update(time, delta) {
    if (this.playState.player) {
      this.playerHealthBar.width = this.playState.player.health;
      this.playerHealthBarMax.width = this.playState.player.healthMax;
    } else {
      this.enemyHealthBar.width = 0;
      this.enemyHealthBarMax.width = 0;
    }

    if (this.playState.currentEnemy) {
      this.enemyHealthBar.width = this.playState.currentEnemy.health;
      this.enemyHealthBarMax.width = this.playState.currentEnemy.healthMax;
    } else {
      this.enemyHealthBar.width = 0;
      this.enemyHealthBarMax.width = 0;
    }
  }
}
