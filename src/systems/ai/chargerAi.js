import Direction from "../../utils/Direction";
import BumpAttackSystem from "../BumpAttackSystem";
import Ai from "./Ai";

const TARGET_DELTA = 10;

function collideWithPlayer(player, character, bumpAttackSystem) {
  character.setVelocity(0, 0);
  bumpAttackSystem.resolveCombat(player, character);
  Ai.changeState(character, "wait");
  character.bubble.setVisible(false);
}

function collideWithCharacter(character, second) {
  switch (character.ai.state) {
    case "charge": {
      character.setVelocity(0, 0);
      Ai.changeState(character, "wait");
      character.bubble.setVisible(false);
      break;
    }
  }
}

function collideWithMap(character) {
  switch (character.ai.state) {
    case "charge": {
      character.setVelocity(0, 0);
      Ai.changeState(character, "wait");
      character.bubble.setVisible(false);
      break;
    }
  }
}

function stateMachine(scene, character, player) {
  if (!character.ai.state) {
    character.ai.state = "wait";
  }
  switch (character.ai.state) {
    case "wait": {
      character.invulnerable = false;
      character.setVelocity(0, 0);
      if (character.stepCount > 10) {
        character.playAnimationForKey("prep-charge");
        Ai.changeState(character, "prep-charge");
      }
      break;
    }
    case "prep-charge": {
      if (!character.ai.animation) {
        scene.juice.shake(character, {
          x: 1,
          onComplete: (tween, target) => {
            character.playAnimationForKey("charge");
            Ai.changeState(character, "charge");
            character.ai.animation = false;
          },
        });
        character.ai.animation = true;
      }
      Ai.directionTowardsPlayer(character, player);
      break;
    }
    case "charge": {
      character.invulnerable = true;
      if (!character.ai.animation) {
        scene.playState.sfx.enemyCharge.play();
        character.ai.target = {
          x: player.x,
          y: player.y,
        };
        // console.log(`character target: ${character.ai.target.x}, ${character.ai.target.y}`);
        character.ai.animation = true;
        character.bubble.setVisible(true);
      }
      // console.log(`dist: ${Phaser.Math.Distance.BetweenPoints(character, character.ai.target)}`);
      if (Phaser.Math.Distance.BetweenPoints(character, character.ai.target) < TARGET_DELTA) {
        character.setVelocity(0, 0);
        character.playAnimationForDirection("idle");
        Ai.changeState(character, "wait");
        character.bubble.setVisible(false);
      } else {
        const angle = Phaser.Math.Angle.BetweenPoints(character, character.ai.target);
        const velocityX = character.walkspeed * Math.cos(angle);
        const velocityY = character.walkspeed * Math.sin(angle);

        character.setVelocity(velocityX, velocityY);
        character.direction = Direction.directionFromAngle(angle);
      }
      break;
    }
  }
}

export default {
  collideWithPlayer,
  collideWithCharacter,
  collideWithMap,
  stateMachine,
};
