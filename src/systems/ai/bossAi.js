import Direction from "../../utils/Direction";
import BumpAttackSystem from "../BumpAttackSystem";
import Ai from "./Ai";

const TARGET_DELTA = 10;
const FIRE_ANGLES = [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5];

function collideWithPlayer(player, character, bumpAttackSystem) {
  console.log("character collide with player");
  character.setVelocity(0, 0);
  bumpAttackSystem.resolveCombat(player, character);
  // if (!Ai.inState(character, "wait")) {
  //   character.playAnimationForDirection("idle");
  //   Ai.changeState(character, "wait");
  // }
}

function collideWithMap(character) {
  switch (character.ai.state) {
    case "charge": {
      character.setVelocity(0, 0);
      character.ai.firingAngle = 0;
      character.playAnimationForKey("fire");
      Ai.changeState(character, "fire-01");
      break;
    }
  }
}

function collideWithCharacter(character, second) {
  console.log("This should never happen :/");
}

function stateMachine(scene, character, player, bullets, map) {
  if (!character.ai.state) {
    character.ai.state = "intro";
    character.ai.phase = 0;
  }
  switch (character.ai.state) {
    case "intro": {
      if (character.stepCount > 10) {
        character.playAnimationForKey("prep-charge");
        Ai.changeState(character, "prep-charge");
      }
      break;
    }
    case "wait": {
      character.invulnerable = false;
      character.setVelocity(0, 0);
      if (character.stepCount > 10 - 3 * character.ai.phase) {
        character.playAnimationForKey("prep-charge");
        Ai.changeState(character, "prep-charge");
      }
      break;
    }
    case "prep-charge": {
      if (!character.ai.animation) {
        scene.juice.shake(character, {
          x: 1 + 2 * character.ai.phase,
          onComplete: (tween, target) => {
            character.playAnimationForKey("charge");
            Ai.changeState(character, "charge");
            character.ai.animation = false;
          },
        });
        character.ai.animation = true;
      }
      break;
    }
    case "charge": {
      character.invulnerable = true;
      if (!character.ai.animation) {
        character.ai.target = {
          x: player.x,
          y: player.y,
        };
        // console.log(`character target: ${character.ai.target.x}, ${character.ai.target.y}`);
        character.ai.animation = true;
      }
      character.playAnimationForKey("fire");
      chargeAndChangeState(character, "fire-01");
      break;
    }
    case "fire-01": {
      character.invulnerable = false;
      character.setVelocity(0, 0);
      if (character.stepCount > 10 && Math.round(character.stepCount) % 5 == 0) {
        const playerAngle = Phaser.Math.Angle.BetweenPoints(character, character.ai.target);
        character.ai.bullets = FIRE_ANGLES.map(
          (angle) => angle + playerAngle + character.ai.firingAngle
        ).map((angle) => {
          scene.playState.sfx.enemyBullet.play();
          bullets.spawnAtAngle(character, angle, "standard");
        });
        character.ai.firingAngle += Math.PI * (0.01 * (1 + character.ai.phase));
      }
      if (character.stepCount > 20 + 5 * character.ai.phase) {
        character.stepCount = 0;
        character.playAnimationForDirection("idle");
        Ai.changeState(character, "wait");
      }
      if (character.getHealthAsPercent() < 0.66 && character.ai.phase < 1) {
        character.ai.phase = 1;
        console.log(`new character phase: ${character.ai.phase}`);
        character.playAnimationForDirection("idle");
        Ai.changeState(character, "charge-center");
      } else if (character.getHealthAsPercent() < 0.33 && character.ai.phase < 2) {
        character.ai.phase = 2;
        console.log(`new character phase: ${character.ai.phase}`);
        character.playAnimationForDirection("idle");
        Ai.changeState(character, "charge-center");
      }
      break;
    }
    case "fire-02": {
      character.invulnerable = false;
      character.setVelocity(0, 0);
      if (character.stepCount > 2) {
        if (Math.round(character.stepCount) % 2 == 0) {
          scene.playState.sfx.enemyBullet.play();
          bullets.spawnAtAngle(character, character.ai.firingAngle, "standard");
        }
        character.ai.firingAngle += Math.PI * 0.01;
      }
      if (character.stepCount > 20) {
        character.playAnimationForKey("prep-charge");
        Ai.changeState(character, "prep-charge");
      }
      break;
    }
    case "charge-center": {
      character.invulnerable = true;
      const { widthInPixels, heightInPixels } = map.tilemap;
      if (!character.ai.animation) {
        character.ai.target = {
          x: widthInPixels / 2,
          y: heightInPixels / 2,
        };
        // console.log(`character target: ${character.ai.target.x}, ${character.ai.target.y}`);
        character.ai.animation = true;
      }
      character.playAnimationForKey("fire");
      chargeAndChangeState(character, "fire-02");
      break;
    }
  }
}

function chargeAndChangeState(character, newState) {
  // console.log(`dist: ${Phaser.Math.Distance.BetweenPoints(character, character.ai.target)}`);
  if (Phaser.Math.Distance.BetweenPoints(character, character.ai.target) < TARGET_DELTA) {
    character.setVelocity(0, 0);
    character.ai.firingAngle = 0;
    Ai.changeState(character, newState);
  } else {
    const angle = Phaser.Math.Angle.BetweenPoints(character, character.ai.target);
    const velocityX = character.walkspeed * Math.cos(angle) * (1 + 0.5 * character.ai.phase);
    const velocityY = character.walkspeed * Math.sin(angle) * (1 + 0.5 * character.ai.phase);

    character.setVelocity(velocityX, velocityY);
    character.direction = Direction.directionFromAngle(angle);
  }
}

export default {
  collideWithPlayer,
  collideWithMap,
  collideWithCharacter,
  stateMachine,
};
