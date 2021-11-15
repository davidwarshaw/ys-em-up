import properties from "../../properties";

import Direction from "../../utils/Direction";

function characterInView(scene, character) {
  return scene.cameras.main.worldView.contains(character.x, character.y);
}

function changeState(character, newState) {
  console.log(`character changeState: ${character.ai.state} -> ${newState}`);
  character.ai.state = newState;
  character.stepCount = 0;
  character.ai.animation = false;
}

function directionTowardsPlayer(character, player) {
  character.direction = Direction.directionFromPositions(character, player);
}

function randomizeDirection(character) {
  character.direction = properties.rng.getItem(character.directions);
}

function targetPlayer(character, player) {
  character.ai.target = {
    x: player.x,
    y: player.y,
  };
}

export default {
  characterInView,
  changeState,
  directionTowardsPlayer,
  randomizeDirection,
  targetPlayer,
};
