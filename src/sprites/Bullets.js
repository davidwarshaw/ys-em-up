import properties from "../properties";

import bulletDefinitions from "../definitions/bulletDefinitions.json";

import Direction from "../utils/Direction";

import Bullet from "./Bullet";

export default class Bullets {
  constructor(scene, map) {
    this.scene = scene;
    this.map = map;

    this.group = this.scene.physics.add.group({ classType: Bullet });
  }

  setBumpAttackSystem(player, bumpAttackSystem) {
    this.player = player;
    this.bumpAttackSystem = bumpAttackSystem;
  }

  configure(bullet, character, bulletName) {
    bullet.setPosition(character.x, character.y);
    bullet.enableBody();
    bullet.setVisible(true);
    bullet.setActive(true);

    // console.log(`bullet.anims.play: ${bulletName}_move`);
    bullet.anims.play(`${bulletName}_move`);

    return bullet;
  }

  killBullet(character, bullet) {
    bullet.disableBody();
    this.group.killAndHide(bullet);
    this.scene.tweens.killTweensOf(bullet);
    character.ai.bullet = null;
  }

  collideWithMap(character, bullet, tile) {
    this.killBullet(character, bullet);
  }

  collideWithPlayer(character, bullet, player) {
    const direction = Direction.directionFromPositions(bullet, player);
    const force = bullet.bulletDefinition.power * 2;
    const flash = true;

    // console.log(`direction: ${direction} force: ${force} flash: ${flash}`);

    this.bumpAttackSystem.resolveCombat(bullet, player);
    // this.bumpAttackSystem.createKnockBack(player, direction, force, flash);

    this.killBullet(character, bullet);
  }

  spawnAtTarget(character, targetPoint, bulletName) {
    const angle = Phaser.Math.Angle.BetweenPoints(character, targetPoint);
    return this.spawnAtAngle(character, angle, bulletName);
  }

  spawnAtAngle(character, angle, bulletName) {
    const poolBullet = this.group.get();

    poolBullet.initialize(this.scene, bulletName);

    const bullet = this.configure(poolBullet, character, bulletName);

    // Bullets collide with map
    this.scene.physics.add.collider(bullet, this.map.layers.collision, (collidingBullet, tile) =>
      this.collideWithMap(character, collidingBullet, tile)
    );

    // Bullets collide with the player
    this.scene.physics.add.collider(bullet, this.player, (collidingBullet, player) =>
      this.collideWithPlayer(character, collidingBullet, player)
    );

    const { speed } = bullet.bulletDefinition;
    const velocityX = speed * Math.cos(angle);
    const velocityY = speed * Math.sin(angle);

    bullet.setVelocity(velocityX, velocityY);
    bullet.direction = Direction.directionFromAngle(angle);

    return bullet;
  }
}
