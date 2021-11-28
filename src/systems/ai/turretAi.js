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
    case "idle": {
      const bulletActive = character.bullet && character.bullet.active;
      if (character.stepCount > 10 && !bulletActive) {
        character.playAnimationForKey("open");
        Ai.changeState(character, "prep-shoot");
      }
      break;
    }
    case "prep-shoot": {
      if (character.stepCount > 5) {
        Ai.changeState(character, "shoot");
      }
      break;
    }
    case "shoot": {
      const offset = { x: 0, y: -4 };
      character.ai.bullet = bullets.spawnAtTarget(character, player, "standard", offset);
      character.stepCount = 0;
      character.playAnimationForDirection("idle");
      Ai.changeState(character, "idle");
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
