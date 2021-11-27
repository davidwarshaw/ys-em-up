import properties from "../properties";

import TileMath from "../utils/TileMath";
import Direction from "../utils/Direction";

import Character from "./Character";

const TARGET_DELTA = 4;
const CHARGE_TILES = 3;

export default class Player extends Character {
  constructor(scene, map, worldXY, direction, playerState) {
    super(scene, map, worldXY, "player", Phaser.Physics.Arcade.DYNAMIC_BODY);

    this.direction = direction;
    this.state = "normal";
    this.knockback = {
      force: null,
      direction: null,
    };
    this.charge = {
      charging: false,
      target: null,
      juice: null,
    };
    // console.log("Setting justPortaled: true");
    this.justPortaled = true;
    this.justHeardSpeech = false;

    this.chargeSpeed = 20;

    this.power = 10;
    this.healthRegenFactor = 0.001;

    this.health = playerState.health;
    this.healthMax = playerState.healthMax;

    this.hasItem = playerState.hasItem;

    this.body.collideWorldBounds = true;

    this.setSize(12, 12);
    this.body.setSize(12, 12);

    this.collideWithWorld = this.collideWithWorld.bind(this);

    this.scene.physics.add.collider(
      this,
      this.map.layers.collision,
      this.collideWithMap,
      null,
      this
    );
    this.scene.physics.world.on("worldbounds", this.collideWithWorld);
  }

  collideWithMap(player, tile) {
    this.sprite.anims.stop();
    this.setVelocity(0, 0);
    if (this.state === "charge") {
      this.stateChange("normal");
    }
  }

  collideWithWorld(playerBody) {
    console.log(playerBody);
  }

  update(delta, inputMultiplexer) {
    this.regeneratingHealth = false;
    switch (this.state) {
      case "knockback": {
        this.updateKnockback(delta);
        break;
      }
      case "normal": {
        this.updateNormal(delta, inputMultiplexer);
        break;
      }
      case "prep-charge": {
        this.updatePrepCharge(delta, inputMultiplexer);
        break;
      }
      case "charge": {
        this.updateCharge(delta, inputMultiplexer);
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
    const deltaWalkspeed = this.walkspeed * delta;
    if (inputMultiplexer.up()) {
      this.setVelocity(0, -deltaWalkspeed);
      this.direction = "up";
      this.playAnimationForDirection("move");
    } else if (inputMultiplexer.down()) {
      this.setVelocity(0, deltaWalkspeed);
      this.direction = "down";
      this.playAnimationForDirection("move");
    } else if (inputMultiplexer.left()) {
      this.setVelocity(-deltaWalkspeed, 0);
      this.direction = "left";
      this.playAnimationForDirection("move");
    } else if (inputMultiplexer.right()) {
      this.setVelocity(deltaWalkspeed, 0);
      this.direction = "right";
      this.playAnimationForDirection("move");
    }

    if (!inputMultiplexer.anyDPad()) {
      this.playAnimationForDirection("idle");
      this.setVelocity(0, 0);
      this.regenerateHealth(delta);
    }

    if (inputMultiplexer.anyPressed()) {
      this.justHeardSpeech = false;
    }

    if (inputMultiplexer.actionPressed() && this.hasItem) {
      this.scene.stopCameraFollow();
      this.charge.juice = this.scene.juice.shake(this, {
        x: 1,
        onComplete: (tween, target) => {
          if (this.state === "prep-charge") {
            // this.charge.juice.shakeTween.complete();
            // this.scene.juice.reset(this);
            this.stateChange("charge");
            this.playAnimationForDirection("idle");
          }
        },
      });
      this.setVelocity(0, 0);
      this.stateChange("prep-charge");
      this.chargeInDirection(this.direction);
    }

    return null;
  }

  updatePrepCharge(delta, inputMultiplexer) {
    if (inputMultiplexer.up()) {
      this.chargeInDirection("up");
    } else if (inputMultiplexer.down()) {
      this.chargeInDirection("down");
    } else if (inputMultiplexer.left()) {
      this.chargeInDirection("left");
    } else if (inputMultiplexer.right()) {
      this.chargeInDirection("right");
    }
    this.playAnimationForDirection("idle");
  }

  updateCharge(delta, inputMultiplexer) {
    const deltaChargeSpeed = this.chargeSpeed * delta;
    const distance = Phaser.Math.Distance.BetweenPoints(this, this.charge.target);
    // console.log(`distance: ${distance}`);
    if (distance < TARGET_DELTA) {
      this.setVelocity(0, 0);
      this.stateChange("normal");
    } else {
      const delta = Direction.deltaFromDirection(this.direction);
      const velocityX = deltaChargeSpeed * delta.x;
      const velocityY = deltaChargeSpeed * delta.y;
      this.setVelocity(velocityX, velocityY);
    }
  }

  chargeInDirection(direction) {
    const delta = Direction.deltaFromDirection(direction);
    this.charge.target = {
      x: this.x + delta.x * CHARGE_TILES * properties.tileWidth,
      y: this.y + delta.y * CHARGE_TILES * properties.tileHeight,
    };
    this.direction = direction;
  }

  beginCharge() {
    this.bubble.setVisible(true);
    this.charge.charging = true;
  }

  endCharge() {
    this.bubble.setVisible(false);
    this.charge.charging = false;
  }

  stateChange(newState) {
    if (this.state === newState) {
      console.log(`skipping redundant state change: ${this.state} -> ${newState}`);
      return;
    }

    console.log(`player state change: ${this.state} -> ${newState}`);

    // If we're changing from prep-charge, kill the juice
    if (this.state === "prep-charge") {
      this.charge.juice.shakeTween.remove();
      // this.scene.juice.reset(this);
    }

    // If we're coming from charge, end the charge effects
    if (this.state === "charge") {
      this.endCharge();
    }

    // Set and reset based on new state
    switch (newState) {
      case "prep-charge": {
        this.scene.stopCameraFollow();
        break;
      }
      case "charge": {
        this.scene.startCameraFollow();
        this.beginCharge();
        break;
      }
      case "knockback": {
        this.invulnerable = true;
        this.scene.stopCameraFollow();
        break;
      }
      case "normal": {
        this.charge.target = null;
        this.invulnerable = false;
        this.scene.startCameraFollow();
        break;
      }
    }

    // Actually change the state
    this.state = newState;
  }
}
