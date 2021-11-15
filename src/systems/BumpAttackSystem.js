import properties from "../properties";

import Direction from "../utils/Direction";

const HIGH_FORCE = 4;
const LOW_FORCE = 2;

export default class BumpAttackSystem {
  constructor(scene) {
    this.scene = scene;
  }

  clearCurrentEnemy() {
    this.scene.playState.currentEnemy = null;
  }

  setCurrentEnemy(enemy) {
    if (enemy.canSetCurrentEnemy()) {
      this.scene.playState.currentEnemy = enemy;
    }
  }

  createKnockBack(character, direction, force, flash) {
    character.stateChange("knockback");
    character.knockback = { direction, force };
    if (flash) {
      character.setTintFill(0xffffff);
    }
    // Stop the camera follow if we knock back the player, to avoid too much shaking
    if (character.isPlayer()) {
      this.scene.stopCameraFollow();
    }
    // If there's already a knockback timer, remove it before adding another one
    if (character.knockback.timer) {
      character.knockback.timer.remove();
    }
    character.knockback.timer = this.scene.time.delayedCall(properties.knockbackMillis, () => {
      character.stateChange("normal");
      character.clearTint();
      // When the knockback is over, start the camera again
      if (character.isPlayer()) {
        this.scene.startCameraFollow();
      }
    });
  }

  resolveAttack(attacker, attackerFacing, defender, defenderFacing) {
    if (attacker.isPlayer() && defender.isHostile()) {
      const relativeDirection = Direction.directionFromPositions(attacker, defender);
      //console.log(`Player facing: ${attackerFacing} attacks enemy to: ${relativeDirection}`);
      this.setCurrentEnemy(defender);
    } else if (attacker.isHostile() && defender.isPlayer()) {
      this.setCurrentEnemy(attacker);
    }

    // console.log(`attackerFacing: ${attackerFacing} defenderFacing: ${defenderFacing}`);
    const relativeDirection = Direction.relativeDirectionFromFacings(
      attackerFacing,
      defenderFacing
    );

    // Attacks subtract the attackers power from the defenders health
    let attackPower = attacker.power;
    let attackForce = HIGH_FORCE;
    // Enemy attack powerin frontal attacks against the players is reduced by
    // the overlap being incomplete
    // console.log(`relativeDirection: ${relativeDirection}`);
    if (relativeDirection === "front" && attacker.isHostile() && defender.isPlayer()) {
      const percentOverlap = Direction.percentOverlapFromPositions(attacker, defender);
      const reduction = percentOverlap / 100;
      attackPower = attackPower * reduction;
      // console.log(`reduction: ${reduction} attackPower: ${attackPower}`);
    }

    if (relativeDirection === "back") {
      // Increase attacks to the back by 100%
      attackPower = attackPower * 2;
      attackForce = attackForce * 2;
    } else if (relativeDirection === "front") {
      // Decrease attacks to the front by 50%
      attackPower = attackPower * 0.5;
      attackForce = attackForce * 0.5;
    }

    // console.log(`Final attackPower: ${attackPower}`);
    defender.health = Math.round(defender.health - attackPower);
    if (defender.health <= 0) {
      defender.health = 0;
      this.scene.killCharacter(defender);
    }

    this.createKnockBack(defender, attackerFacing, attackForce, true);
    this.createKnockBack(attacker, Direction.opposite(attackerFacing), LOW_FORCE, false);
  }

  resolveCombat(first, second) {
    // First, get the facing for each character
    const firstFacing = first.direction;
    const secondFacing = second.direction;

    // Then, get the relative direction to the other character
    const firstDirectionToSecond = Direction.directionFromPositions(first, second);
    const secondDirectionToFirst = Direction.directionFromPositions(second, first);

    console.log(`firstFacing: ${firstFacing} secondFacing: ${secondFacing}`);
    console.log(
      `firstDirectionToSecond: ${firstDirectionToSecond} secondDirectionToFirst: ${secondDirectionToFirst}`
    );

    // If a characters facing matches the direction to the other character, then they're attacking
    if (firstFacing === firstDirectionToSecond) {
      // The player can only attack if a button is pressed
      if (!first.isPlayer() || (first.isPlayer() && this.scene.inputMultiplexer.any())) {
        this.resolveAttack(first, firstFacing, second, secondFacing);
      } else {
        // console.log("Player attack skipped. No button pressed.");
      }
    }
    if (secondFacing === secondDirectionToFirst) {
      // The player can only attack if a button is pressed
      if (!second.isPlayer() || (second.isPlayer() && this.scene.inputMultiplexer.any())) {
        this.resolveAttack(second, secondFacing, first, firstFacing);
      } else {
        // console.log("Player attack skipped. No button pressed.");
      }
    }
  }
}
