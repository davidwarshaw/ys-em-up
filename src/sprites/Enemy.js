import properties from "../properties";
import TileMath from "../utils/TileMath";
import Direction from "../utils/Direction";

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, map, player, tile) {
    super(scene, 0, 0, "enemies");
    this.map = map;
    this.player = player;

    this.walkspeed = 2;
    this.frameRate = properties.animFrameRate * this.walkspeed;

    this.state = "normal";
    this.knockback = {};

    this.power = 5;

    this.healthMax = 20;
    this.health = this.healthMax;

    this.directions = ["up", "down", "left", "right"];
    this.direction = "down";
    this.stepCount = 0;

    const { x, y } = TileMath.screenFromTile(tile);
    this.setPosition(x, y);

    this.setOrigin(0.5, 0.5);

    const name = "enemy";
    this.name = name;
    scene.physics.world.enable(this);
    scene.add.existing(this);

    const col = 0;
    const row = 11;
    const offset = 24 * row + col;

    scene.anims.create({
      key: "enemy_move_up",
      frames: scene.anims.generateFrameNumbers("enemies", {
        start: offset + 4,
        end: offset + 5,
        first: offset + 4,
      }),
      frameRate: this.frameRate,
      repeat: -1,
    });
    scene.anims.create({
      key: "enemy_move_down",
      frames: scene.anims.generateFrameNumbers("enemies", {
        start: offset + 0,
        end: offset + 1,
        first: offset + 0,
      }),
      frameRate: this.frameRate,
      repeat: -1,
    });
    scene.anims.create({
      key: "enemy_move_left",
      frames: scene.anims.generateFrameNumbers("enemies", {
        start: offset + 2,
        end: offset + 3,
        first: offset + 2,
      }),
      frameRate: this.frameRate,
      repeat: -1,
    });
    scene.anims.create({
      key: "enemy_move_right",
      frames: scene.anims.generateFrameNumbers("enemies", {
        start: offset + 6,
        end: offset + 7,
        first: offset + 6,
      }),
      frameRate: this.frameRate,
      repeat: -1,
    });

    this.anims.play(`enemy_move_down`, true);
    const stopFrame = this.anims.currentAnim.frames[0];
    this.anims.stopOnFrame(stopFrame);

    this.setCollideWorldBounds(true);

    this.directionTowardsPlayer();
  }

  directionTowardsPlayer() {
    this.direction = Direction.directionFromPositions(this, this.player);
  }

  randomizeDirection() {
    this.direction = properties.rng.getItem(this.directions);
  }

  isOnTile(tile) {
    const pTile = this.map.worldToTileXY(this.x, this.y);
    return pTile.x === tile.x && pTile.y === tile.y;
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

  collideWithMap() {
    this.randomizeDirection();
  }

  update(scene, delta) {
    switch (this.state) {
      case "knockback": {
        this.updateKnockback(delta);
        break;
      }
      case "normal": {
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
    this.stepCount++;
    if (this.stepCount > 100) {
      this.directionTowardsPlayer();
      this.stepCount = 0;
    }
    const deltaWalkspeed = this.walkspeed * delta;
    switch (this.direction) {
      case "up": {
        // console.log('Keys: up');
        this.anims.play("enemy_move_up", true);
        this.setVelocity(0, -deltaWalkspeed);
        break;
      }
      case "down": {
        // console.log('Keys: down');
        this.anims.play("enemy_move_down", true);
        this.setVelocity(0, deltaWalkspeed);
        break;
      }
      case "left": {
        // console.log('Keys: left');
        this.anims.play("enemy_move_left", true);
        this.setVelocity(-deltaWalkspeed, 0);
        break;
      }
      case "right": {
        // console.log('Keys: right');
        this.anims.play("enemy_move_right", true);
        this.setVelocity(deltaWalkspeed, 0);
        break;
      }
      default: {
        this.anims.stop();
        this.setVelocity(0, 0);
      }
    }
  }
}
