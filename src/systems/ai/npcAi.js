import Direction from "../../utils/Direction";
import BumpAttackSystem from "../BumpAttackSystem";
import Ai from "./Ai";

function collideWithPlayer(player, character, bumpAttackSystem, scene) {
  const { speech } = character.characterDefinition.ai;
  if (!player.justHeardSpeech) {
    player.setVelocity(0, 0);
    character.setVelocity(0, 0);
    scene.startSpeech(speech, character);
    player.justHeardSpeech = true;
  }
}

function collideWithCharacter(character, second) {}

function collideWithMap(character) {}

function stateMachine(scene, character, player) {
  if (character) {
    character.setImmovable(true);
  }
}

export default {
  collideWithPlayer,
  collideWithCharacter,
  collideWithMap,
  stateMachine,
};
