import Direction from "../../utils/Direction";
import Ai from "./Ai";

const TARGET_DELTA = 10;

function collideWithCharacter(character, second) {
  switch (character.ai.state) {
    case "charge": {
      character.setVelocity(0, 0);
      Ai.changeState(character, "wait");
      break;
    }
  }
}

function collideWithMap(character) {
  switch (character.ai.state) {
    case "charge": {
      character.setVelocity(0, 0);
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
        Ai.changeState(character, "prep-charge");
      }
      break;
    }
    case "prep-charge": {
      if (!character.ai.animation) {
        scene.juice.shake(character, {
          x: 1,
          onComplete: (tween, target) => {
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
        character.ai.target = {
          x: player.x,
          y: player.y,
        };
        // console.log(`character target: ${character.ai.target.x}, ${character.ai.target.y}`);
        character.ai.animation = true;
      }
      // console.log(`dist: ${Phaser.Math.Distance.BetweenPoints(character, character.ai.target)}`);
      if (Phaser.Math.Distance.BetweenPoints(character, character.ai.target) < TARGET_DELTA) {
        character.setVelocity(0, 0);
        Ai.changeState(character, "wait");
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
  collideWithCharacter,
  collideWithMap,
  stateMachine,
};
