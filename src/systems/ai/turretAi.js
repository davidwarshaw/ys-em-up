import Direction from "../../utils/Direction";
import BumpAttackSystem from "../BumpAttackSystem";
import Ai from "./Ai";

function collideWithPlayer(player, character) {
  BumpAttackSystem.resolveCombat(player, character);
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

function stateMachine(scene, character, player, bullets) {
  if (!character.ai.state) {
    character.ai.state = "shoot";
  }
  switch (character.ai.state) {
    case "shoot": {
      const bulletActive = character.bullet && character.bullet.active;
      if (character.stepCount > 15 && !bulletActive) {
        character.ai.bullet = bullets.spawnAtTarget(character, player, "standard");
        character.stepCount = 0;
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
