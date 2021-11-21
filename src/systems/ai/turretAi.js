import Direction from "../../utils/Direction";
import BumpAttackSystem from "../BumpAttackSystem";
import Ai from "./Ai";

function collideWithPlayer(player, character, bumpAttackSystem) {
  bumpAttackSystem.resolveCombat(player, character);
}

function collideWithCharacter(character, second) {
  switch (character.ai.state) {
    case "shoot": {
      break;
    }
  }
}

function collideWithMap(character) {
  switch (character.ai.state) {
    case "shoot": {
      break;
    }
  }
}

function stateMachine(scene, character, player, bullets, map, ray) {
  if (!character.ai.state) {
    character.ai.state = "shoot";
  }
  switch (character.ai.state) {
    case "shoot": {
      const bulletActive = character.bullet && character.bullet.active;
      if (character.stepCount > 15 && !bulletActive) {
        // const angle = Phaser.Math.Angle.BetweenPoints(character, player);
        // console.log(`character: ${character.x}, ${character.y} angle: ${angle}`);
        // ray.setRay(character.x, character.y, angle);
        // const intersection = ray.cast({ target: player });
        // console.log(ray);
        // console.log(intersection);
        // if (intersection.object && intersection.object.characterName === "player") {
        // console.log(intersection);
        // console.log(`player: ${player.x}, ${player.y}`);
        character.ai.bullet = bullets.spawnAtTarget(character, player, "standard");
        character.stepCount = 0;
        // }
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
