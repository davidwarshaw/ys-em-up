import properties from "../properties";
import TileMath from "../utils/TileMath";

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, map, tile) {
    super(scene, 0, 0, "player");
    this.map = map;

    this.buttonPressed = false;

    this.walkspeed = 9;
    this.frameRate = properties.animFrameRate * this.walkspeed;

    this.state = "normal";
    this.knockback = {
      force: null,
      direction: null,
    };

    this.power = 10;

    this.healthMax = 50;
    this.health = this.healthMax;
    this.healthRegenFactor = 0.01;

    this.direction = "down";

    const { x, y } = TileMath.screenFromTile(tile);
    this.setPosition(x, y);

    this.setOrigin(0.5, 0.5);

    const name = "player";
    this.name = name;
    scene.physics.world.enable(this);
    scene.add.existing(this);

    scene.anims.create({
      key: "player_move_up",
      frames: scene.anims.generateFrameNumbers("player", { start: 0, end: 1, first: 0 }),
      frameRate: this.frameRate,
      repeat: -1,
    });
    scene.anims.create({
      key: "player_move_down",
      frames: scene.anims.generateFrameNumbers("player", { start: 2, end: 3, first: 2 }),
      frameRate: this.frameRate,
      repeat: -1,
    });
    scene.anims.create({
      key: "player_move_left",
      frames: scene.anims.generateFrameNumbers("player", { start: 4, end: 5, first: 4 }),
      frameRate: this.frameRate,
      repeat: -1,
    });
    scene.anims.create({
      key: "player_move_right",
      frames: scene.anims.generateFrameNumbers("player", { start: 6, end: 7, first: 6 }),
      frameRate: this.frameRate,
      repeat: -1,
    });

    this.anims.play(`player_move_down`, true);
    const stopFrame = this.anims.currentAnim.frames[0];
    this.anims.stopOnFrame(stopFrame);

    this.setCollideWorldBounds(true);
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
    this.anims.stop();
    this.setVelocity(0, 0);
  }

  regenerateHealth(delta) {
    const healthRegenAmount = this.healthRegenFactor * delta;
    Phaser.Math.Clamp(healthRegenAmount, 0, this.health);
    this.healthRegenFactor;
  }

  update(scene, delta, inputMultiplexer) {
    switch (this.state) {
      case "knockback": {
        this.updateKnockback(delta);
        break;
      }
      case "normal": {
        this.updateNormal(delta, inputMultiplexer);
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

  updateNormal(delta, inputMultiplexer) {
    this.buttonPressed = true;
    const deltaWalkspeed = this.walkspeed * delta;
    if (inputMultiplexer.up()) {
      // console.log('Keys: up');
      this.anims.play("player_move_up", true);
      this.setVelocity(0, -deltaWalkspeed);
      this.direction = "up";
    } else if (inputMultiplexer.down()) {
      // console.log('Keys: down');
      this.anims.play("player_move_down", true);
      this.setVelocity(0, deltaWalkspeed);
      this.direction = "down";
    } else if (inputMultiplexer.left()) {
      // console.log('Keys: left');
      this.anims.play("player_move_left", true);
      this.setVelocity(-deltaWalkspeed, 0);
      this.direction = "left";
    } else if (inputMultiplexer.right()) {
      // console.log('Keys: right');
      this.anims.play("player_move_right", true);
      this.setVelocity(deltaWalkspeed, 0);
      this.direction = "right";
    } else {
      this.anims.stop();
      this.setVelocity(0, 0);
      this.buttonPressed = false;

      this.regenerateHealth(delta);
    }
  }
}
