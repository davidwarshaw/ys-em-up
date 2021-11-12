import properties from "../properties";

import Direction from "../utils/Direction";

import bossAi from "./bossAi";

export default class AiSystem {
  constructor(scene, map, player, bullets) {
    this.scene = scene;
    this.map = map;
    this.player = player;
    this.bullets = bullets;

    this.collideWithMap = this.collideWithMap.bind(this);
    this.collideWithCharacter = this.collideWithCharacter.bind(this);
  }

  collideWithMap(character) {
    const { ai } = character.characterDefinition;
    switch (ai.behavior) {
      case "": {
        break;
      }
      case "bounce-around": {
        this.randomizeDirection(character);
        break;
      }
      case "charger": {
        break;
      }
      case "big-charger": {
        bossAi.collideWithMap(character);
        break;
      }
    }
  }

  collideWithCharacter(character, second) {
    const { ai } = character.characterDefinition;
    switch (ai.behavior) {
      case "": {
        break;
      }
      case "bounce-around": {
        this.randomizeDirection(character);
        break;
      }
    }
  }

  update(delta, character) {
    const { ai } = character.characterDefinition;
    switch (ai.behavior) {
      case "turret": {
        if (!this.characterInView(character)) {
          return;
        }
        const bulletActive = character.bullet && character.bullet.active;
        character.stepCount += 0.01 * delta;
        if (character.stepCount > 10 && !bulletActive) {
          character.ai.bullet = this.bullets.spawnAtTarget(character, this.player, "standard");
          character.stepCount = 0;
        }
        break;
      }
      case "bounce-around": {
        if (!this.characterInView(character)) {
          return;
        }
        character.stepCount += 0.01 * delta;
        if (character.stepCount > 20) {
          this.directionTowardsPlayer(character);
          character.stepCount = 0;
        }
        character.isMoving = true;
        break;
      }
      case "charger": {
        if (!this.characterInView(character)) {
          return;
        }
        character.stepCount += 0.01 * delta;
        if (!character.ai.animation && character.stepCount > 20) {
          this.scene.juice.shake(character, {
            x: 1,
            onComplete: (tween, target) => {
              character.ai.animation = false;
              targetPlayer(character, this.player);
            },
          });
          character.ai.animation = true;
        }
        this.directionTowardsPlayer(character);
        break;
      }
      case "big-charger": {
        if (!this.characterInView(character)) {
          return;
        }
        character.stepCount += 0.01 * delta;
        bossAi.stateMachine(this.scene, character, this.player, this.bullets);
        this.directionTowardsPlayer(character);
        break;
      }
    }
  }

  directionTowardsPlayer(character) {
    character.direction = Direction.directionFromPositions(character, this.player);
  }

  randomizeDirection(character) {
    character.direction = properties.rng.getItem(character.directions);
  }

  targetPlayer(character, player) {
    character.ai.target = {
      x: player.x,
      y: player.y,
    };
  }

  characterInView(character) {
    return this.scene.cameras.main.worldView.contains(character.x, character.y);
  }
}
