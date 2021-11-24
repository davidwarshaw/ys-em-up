import properties from "../properties";
import TileMath from "../utils/TileMath";

import Character from "./Character";

export default class Player extends Character {
  constructor(scene, map, worldXY, direction, playerState) {
    super(scene, map, worldXY, "player", Phaser.Physics.Arcade.DYNAMIC_BODY);

    this.direction = direction;
    this.state = "normal";
    this.knockback = {
      force: null,
      direction: null,
    };
    // console.log("Setting justPortaled: true");
    this.justPortaled = true;
    this.justHeardSpeech = false;

    this.power = 10;
    this.healthRegenFactor = 0.001;

    this.health = playerState.health;
    this.healthMax = playerState.healthMax;

    this.setCollideWorldBounds(true);

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
    this.anims.stop();
    this.setVelocity(0, 0);
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

    if (inputMultiplexer.actionPressed()) {
      const tile = this.map.tilemap.worldToTileXY(this.x, this.y);
      const actionTile = TileMath.getTileNeighborByDirection(tile, this.direction);
      return actionTile;
    }

    if (!inputMultiplexer.any()) {
      this.playAnimationForDirection("idle");
      this.setVelocity(0, 0);
      this.regenerateHealth(delta);
    }

    if (inputMultiplexer.anyPressed()) {
      this.justHeardSpeech = false;
    }

    return null;
  }
}
