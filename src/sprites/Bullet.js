import properties from "../properties";

import bulletDefinitions from "../definitions/bulletDefinitions.json";

export default class Bullet extends Phaser.Physics.Arcade.Sprite {
  constructor(scene) {
    super(scene, 0, 0, "bullets");
  }

  initialize(scene, bulletName) {
    this.scene = scene;
    this.bulletName = bulletName;

    scene.physics.world.enable(this, Phaser.Physics.Arcade.DYNAMIC_BODY);
    scene.add.existing(this);

    this.setDepth(20);
    this.setOrigin(0.5, 0.5);
    this.setCircle(4);
    this.setDrag(0);
    this.setFriction(0);

    this.bulletDefinition = bulletDefinitions[bulletName];
    this.power = this.bulletDefinition.power;

    const spritesheetNumColumns = 4;

    const { row } = this.bulletDefinition.spritesheet;
    const offset = row * spritesheetNumColumns;

    let start = offset;
    let end = offset + 1;
    // console.log(`${bulletName}_move: start: ${start} end: ${end}`);
    scene.anims.create({
      key: `${bulletName}_move`,
      frames: scene.anims.generateFrameNumbers("bullets", { start, end }),
      frameRate: properties.animFrameRate,
      repeat: -1,
    });

    start = offset + 2;
    end = offset + 3;
    // console.log(`${bulletName}_die: start: ${start} end: ${end}`);
    scene.anims.create({
      key: `${bulletName}_die`,
      frames: scene.anims.generateFrameNumbers("bullets", { start, end }),
      frameRate: properties.animFrameRate,
      repeat: 0,
    });
  }

  // All bullets are enemy bullets (for now)
  isHostile() {
    return true;
  }

  isPlayer() {
    return false;
  }

  stateChange() {}
}
