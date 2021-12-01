import properties from "../properties";

import characterDefinitions from "../definitions/characterDefinitions.json";

export default class Character extends Phaser.GameObjects.Container {
  constructor(scene, map, world, characterName, bodyType) {
    super(scene, 0, 0);

    const spriteSheetKey = characterDefinitions[characterName].spritesheet.key;
    this.sprite = scene.add.sprite(0, 0, spriteSheetKey);
    this.add(this.sprite);
    this.setSize(this.sprite.width, this.sprite.height);

    if (this.sprite.width <= 16) {
      this.bubble = scene.add.sprite(0, 0, "bubble");
    } else {
      this.bubble = scene.add.sprite(0, 0, "bubble-big");
    }

    this.bubble.setVisible(false);
    this.add(this.bubble);

    this.map = map;
    this.characterName = characterName;

    this.spriteSheetKey = spriteSheetKey;

    this.characterDefinition = characterDefinitions[characterName];
    this.spritesheetNumColumns = 10;

    this.ai = {};

    this.walkspeed = this.characterDefinition.speed;
    this.frameRate = properties.animFrameRate * this.walkspeed;

    this.stepCount = 100;

    this.flickerCount = 0;
    this.isFlickering = false;

    this.state = "normal";
    this.knockback = {
      force: null,
      direction: null,
    };

    this.power = this.characterDefinition.power;

    this.healthRegenFactor = 0.001;
    this.regeneratingHealth = false;

    this.invulnerable = false;

    this.healthMax = this.characterDefinition.healthMax;
    this.health = this.healthMax;

    this.directions = ["up", "down", "left", "right"];
    this.direction = "down";
    this.isMoving = false;
    this.stepCount = 0;

    // const world = map.tilemap.tileToWorldXY(tile.x, tile.y);
    const { tileWidth, tileHeight } = this.map.tilemap;
    // this.setPosition(world.x + tileWidth * 0.5, world.y + tileHeight * 0.5);
    this.setPosition(world.x + tileWidth * 0.5, world.y - tileHeight * 0.5);
    const depth = this.characterDefinition.flies ? 40 : 20;
    this.setDepth(depth);
    // this.setOrigin(0.5, 0.5);

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
        frameRate: properties.animFrameRate,
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
        frameRate: properties.animFrameRate,
        repeat: -1,
      });
    });
    // Non-Direction animations
    this.characterDefinition.spritesheet.anims.forEach((anim) => {
      const start = offset + anim.start;
      const end = offset + anim.end;
      scene.anims.create({
        key: `${characterName}_${anim.key}`,
        frames: scene.anims.generateFrameNumbers(spriteSheetKey, { start, end }),
        frameRate: properties.animFrameRate,
        repeat: -1,
      });
    });

    this.sprite.anims.play(`${characterName}_idle_down`);

    const stopFrame = this.sprite.anims.currentAnim.frames[0];
    this.sprite.anims.stopOnFrame(stopFrame);
  }

  // Shadow sprite methods below
  setVelocity(x, y) {
    if (!this.body) {
      return;
    }
    this.body.setVelocity(x, y);
  }

  setImmovable(value) {
    if (!this.body) {
      return;
    }
    this.body.setImmovable(value);
  }

  setTintFill(value) {
    this.sprite.setTintFill(value);
  }
  clearTint() {
    this.sprite.clearTint();
  }
  // Shadow sprite methods above

  refillHealth() {
    this.health = this.healthMax;
  }

  flicker(delta) {
    this.flickerCount += 0.01 * delta;
    if (this.flickerCount >= properties.flickerFrames) {
      this.setVisible(!this.visible);
      this.flickerCount = 0;
    }
  }

  isHostile() {
    return this.characterDefinition.hostile;
  }

  isPlayer() {
    return this.characterName === "player";
  }

  canSetCurrentEnemy() {
    return true;
  }

  playAnimationForDirection(action) {
    if (!this.sprite || !this.sprite.anims) {
      return;
    }
    this.sprite.flipX = this.direction === "left" ? true : false;
    const animationDirection = this.direction === "left" ? "right" : this.direction;

    this.sprite.anims.play(`${this.characterName}_${action}_${animationDirection}`, true);
  }

  playAnimationForKey(key) {
    if (!this.sprite || !this.sprite.anims) {
      return;
    }
    this.sprite.anims.play(`${this.characterName}_${key}`, true);
  }

  playAnimationForDirection(action) {
    this.sprite.flipX = this.direction === "left" ? true : false;
    const animationDirection = this.direction === "left" ? "right" : this.direction;

    this.sprite.anims.play(`${this.characterName}_${action}_${animationDirection}`, true);
  }

  stateChange(newState) {
    if (this.state === "normal") {
      if (newState === "knockback") {
        this.state = "knockback";
        this.invulnerable = true;
      }
    } else if (this.state === "knockback") {
      if (newState === "normal") {
        this.state = "normal";
        this.invulnerable = false;
      }
    }
  }

  isOnTile(tile) {
    const pTile = this.map.tilemap.worldToTileXY(this.x, this.y);
    return pTile.x === tile.x && pTile.y === tile.y;
  }

  getHealthAsPercent() {
    return this.health / this.healthMax;
  }

  regenerateHealth(delta) {
    const healthRegenAmount = this.healthRegenFactor * delta;
    this.health = Phaser.Math.Clamp(this.health + healthRegenAmount, 0, this.healthMax);
    this.regeneratingHealth = true;
  }

  update(delta, aiSystem) {
    if (this.isFlickering) {
      this.flicker(delta);
      return;
    }
    this.regeneratingHealth = false;
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
        this.sprite.anims.stop();
        this.setVelocity(0, 0);
        this.playAnimationForDirection("idle");
      }
    }
  }
}
