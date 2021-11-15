import Direction from "../../utils/Direction";
import Ai from "./Ai";

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
      if (character.stepCount > 10 && !bulletActive) {
        character.ai.bullet = bullets.spawnAtTarget(character, player, "standard");
        character.stepCount = 0;
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
