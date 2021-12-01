import Direction from "../../utils/Direction";
import BumpAttackSystem from "../BumpAttackSystem";
import Ai from "./Ai";

const COORD_DELTA = 16 * 3;
const WAVE_FACTOR = 300;

function collideWithPlayer(player, character, bumpAttackSystem) {
  bumpAttackSystem.resolveCombat(player, character);
  character.stepCount = 0;
  Ai.changeState(character, "wait");
}

function collideWithCharacter(character, second) {
  // No character collisions
}

function collideWithMap(character) {
  // No character collisions
}

function stateMachine(scene, character, player, bullets, map) {
  if (!character.ai.state) {
    character.ai.state = "wait";
  }
  switch (character.ai.state) {
    case "wait": {
      character.setVelocity(0, 0);
      if (character.stepCount > 2 && Ai.characterInView(scene, character)) {
        const xDelta = Math.abs(character.x - player.x);
        const yDelta = Math.abs(character.y - player.y);
        if (xDelta < COORD_DELTA || yDelta < COORD_DELTA) {
          const angle = Phaser.Math.Angle.BetweenPoints(character, player);
          const playerDirection = Direction.directionFromAngle(angle);
          const waveDirection = Direction.directionFromAngle(angle - Math.PI * 0.5);
          const playerDelta = Direction.deltaFromDirection(playerDirection);
          const waveDelta = Direction.deltaFromDirection(waveDirection);
          character.ai.playerDelta = playerDelta;
          character.ai.waveDelta = waveDelta;
          character.ai.passedOverMap = false;
          character.playAnimationForKey("swoop");
          if (!scene.playState.sfx.enemyFly.isPlaying) {
            scene.playState.sfx.enemyFly.play({ loop: true, rate: 5 });
          }
          Ai.changeState(character, "swoop");
        }
      }
      break;
    }
    case "swoop": {
      const velocityX =
        character.walkspeed * character.ai.playerDelta.x +
        character.ai.waveDelta.x * Math.cos(character.stepCount) * WAVE_FACTOR;
      const velocityY =
        character.walkspeed * character.ai.playerDelta.y +
        character.ai.waveDelta.y * Math.cos(character.stepCount) * WAVE_FACTOR;
      character.setVelocity(velocityX, velocityY);

      // console.log(`map.isBackgroundOrHazard(character): ${map.isBackgroundOrHazard(character)}`);
      if (map.isBackgroundOrHazard(character)) {
        character.ai.passedOverMap = true;
      }
      if (character.ai.passedOverMap && !map.isBackgroundOrHazard(character)) {
        character.stepCount = 0;
        character.playAnimationForDirection("idle");
        scene.playState.sfx.enemyFly.stop();
        Ai.changeState(character, "wait");
      }
      Ai.directionTowardsPlayer(character, player);
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
