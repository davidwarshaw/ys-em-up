import Direction from "../../utils/Direction";
import BumpAttackSystem from "../BumpAttackSystem";
import Ai from "./Ai";

const TARGET_DELTA = 10;

function collideWithPlayer(player, character, bumpAttackSystem) {
  bumpAttackSystem.resolveCombat(player, character);
}

function collideWithCharacter(character, second) {
  switch (character.ai.state) {
    case "ramble": {
      Ai.randomizeDirection(character);
      break;
    }
  }
}

function collideWithMap(character) {
  switch (character.ai.state) {
    case "ramble": {
      Ai.randomizeDirection(character);
      break;
    }
  }
}

function stateMachine(scene, character, player) {
  if (!character.ai.state) {
    character.ai.state = "ramble";
  }
  switch (character.ai.state) {
    case "ramble": {
      if (character.stepCount > 20) {
        Ai.directionTowardsPlayer(character, player);
        character.stepCount = 0;
      }
      character.isMoving = true;
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
