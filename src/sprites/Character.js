import properties from "../properties";

import characterDefinitions from "../definitions/characterDefinitions.json";

export default class Character extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, map, world, characterName, bodyType) {
    const spriteSheetKey = characterDefinitions[characterName].spritesheet.key;
    super(scene, 0, 0, spriteSheetKey);
    this.map = map;
    this.characterName = characterName;

    this.spriteSheetKey = spriteSheetKey;

    this.characterDefinition = characterDefinitions[characterName];
    this.spritesheetNumColumns = 10;

    this.ai = {};

    this.walkspeed = 2;
    this.frameRate = properties.animFrameRate * this.walkspeed;

    this.stepCount = 100;

    this.state = "normal";
    this.knockback = {};

    this.power = 5;

    this.healthMax = 20;
    this.health = this.healthMax;

    this.directions = ["up", "down", "left", "right"];
    this.direction = "down";
    this.isMoving = false;
    this.stepCount = 0;

    // const world = map.tilemap.tileToWorldXY(tile.x, tile.y);
    const { tileWidth, tileHeight } = this.map.tilemap;
    // this.setPosition(world.x + tileWidth * 0.5, world.y + tileHeight * 0.5);
    this.setPosition(world.x + tileWidth * 0.5, world.y - tileHeight * 0.5);
    this.setDepth(20);
    this.setOrigin(0.5, 0.5);

    scene.physics.world.enable(this, bodyType);
    scene.add.existing(this);

    const idles = ["idle_down", "idle_up", "idle_right"];
    const moves = ["move_down", "move_up", "move_right"];

    // console.log(this.characterDefinition.spritesheet);
    const { row } = this.characterDefinition.spritesheet;
    const offset = row * this.spritesheetNumColumns;
    idles.forEach((idle, i) => {
      const start = offset + i;
      const end = offset + i;
      // console.log(`${characterName}_${idle}: start: ${start} end: ${end}`);
      scene.anims.create({
        key: `${characterName}_${idle}`,
        frames: scene.anims.generateFrameNumbers(spriteSheetKey, { start, end }),
        frameRate: this.frameRate,
        repeat: -1,
      });
    });
    moves.forEach((move, i) => {
      const start = offset + i * 2 + 4;
      const end = offset + i * 2 + 5;
      // console.log(`${characterName}_${move}: start: ${start} end: ${end}`);
      scene.anims.create({
        key: `${characterName}_${move}`,
        frames: scene.anims.generateFrameNumbers(spriteSheetKey, { start, end }),
        frameRate: this.frameRate,
        repeat: -1,
      });
    });

    this.anims.play(`${characterName}_idle_down`);

    const stopFrame = this.anims.currentAnim.frames[0];
    this.anims.stopOnFrame(stopFrame);
  }

  isType(type) {
    return this.characterName.startsWith(type);
  }

  playAnimationForDirection(action) {
    this.flipX = this.direction === "left" ? true : false;
    const animationDirection = this.direction === "left" ? "right" : this.direction;

    this.anims.play(`${this.characterName}_${action}_${animationDirection}`, true);
  }

  stateChange(newState) {
    if (this.state === "normal") {
      if (newState === "knockback") {
        this.state = "knockback";
      }
    } else if (this.state === "knockback") {
      if (newState === "normal") {
        this.state = "normal";
      }
    }
  }

  isOnTile(tile) {
    const pTile = this.map.worldToTileXY(this.x, this.y);
    return pTile.x === tile.x && pTile.y === tile.y;
  }

  update(delta, aiSystem) {
    switch (this.state) {
      case "knockback": {
        this.updateKnockback(delta);
        break;
      }
      case "normal": {
        aiSystem.update(delta, this);
        this.updateNormal(delta);
        break;
      }
    }
  }

  updateKnockback(delta) {
    const deltaKnockbackForce = this.knockback.force * delta;
    switch (this.knockback.direction) {
      case "up": {
        this.setVelocity(0, -deltaKnockbackForce);
        break;
      }
      case "down": {
        this.setVelocity(0, deltaKnockbackForce);
        break;
      }
      case "left": {
        this.setVelocity(-deltaKnockbackForce, 0);
        break;
      }
      case "right": {
        this.setVelocity(deltaKnockbackForce, 0);
        break;
      }
    }
  }

  updateNormal(delta) {
    if (!this.isMoving) {
      return;
    }
    const deltaWalkspeed = this.walkspeed * delta;
    switch (this.direction) {
      case "up": {
        this.setVelocity(0, -deltaWalkspeed);
        this.playAnimationForDirection("move");
        break;
      }
      case "down": {
        this.setVelocity(0, deltaWalkspeed);
        this.playAnimationForDirection("move");
        break;
      }
      case "left": {
        this.setVelocity(-deltaWalkspeed, 0);
        this.playAnimationForDirection("move");
        break;
      }
      case "right": {
        this.setVelocity(deltaWalkspeed, 0);
        this.playAnimationForDirection("move");
        break;
      }
      default: {
        this.anims.stop();
        this.setVelocity(0, 0);
        this.playAnimationForDirection("idle");
      }
    }
  }
}
