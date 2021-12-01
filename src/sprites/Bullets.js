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

  configure(bullet, origin, bulletName) {
    bullet.setPosition(origin.x, origin.y);
    bullet.enableBody();
    bullet.setVisible(true);
    bullet.setActive(true);

    // console.log(`bullet.anims.play: ${bulletName}_move`);
    bullet.anims.play(`${bulletName}_move`);

    return bullet;
  }

  killBullet(character, bullet) {
    bullet.disableBody();
    bullet.on(
      `${Phaser.Animations.Events.ANIMATION_COMPLETE_KEY}${bullet.bulletName}_die`,
      () => {
        this.group.killAndHide(bullet);
        this.scene.tweens.killTweensOf(bullet);
        character.ai.bullet = null;
      },
      this
    );
    bullet.anims.play(`${bullet.bulletName}_die`);
  }

  collideWithMap(character, bullet, tile) {
    this.killBullet(character, bullet);
  }

  collideWithPlayer(character, bullet, player) {
    this.scene.playState.sfx.hitBullet.play();
    this.bumpAttackSystem.resolveBulletImpact(bullet, player);
    this.killBullet(character, bullet);
  }

  spawnAtTarget(character, targetPoint, bulletName, possibleOffset) {
    const origin = this.originFromPossibleOffset(character, possibleOffset);
    const angle = Phaser.Math.Angle.BetweenPoints(origin, targetPoint);
    return this.spawnAtAngle(character, angle, bulletName, possibleOffset);
  }

  spawnAtAngle(character, angle, bulletName, possibleOffset) {
    const origin = this.originFromPossibleOffset(character, possibleOffset);

    const poolBullet = this.group.get();

    poolBullet.initialize(this.scene, bulletName);

    const bullet = this.configure(poolBullet, origin, bulletName);

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

  originFromPossibleOffset(character, possibleOffset) {
    const offset = possibleOffset || { x: 0, y: 0 };
    const origin = {
      x: character.x + offset.x,
      y: character.y + offset.y,
    };
    return origin;
  }
}
