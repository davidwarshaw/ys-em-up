import properties from "../properties";

import npcAi from "./ai/npcAi";
import turretAi from "./ai/turretAi";
import rambleAi from "./ai/rambleAi";
import flyerAi from "./ai/flyerAi";
import chargerAi from "./ai/chargerAi";
import bossAi from "./ai/bossAi";

export default class AiSystem {
  constructor(scene, map, player, bullets, bumpAttackSystem) {
    this.scene = scene;
    this.map = map;
    this.player = player;
    this.bullets = bullets;
    this.bumpAttackSystem = bumpAttackSystem;

    // const collisionTiles = this.map.getCollisionTileIndices();
    // console.log(`Creating raycaster with collision Tiles: ${collisionTiles}`);
    // this.raycaster = this.scene.raycasterPlugin.createRaycaster({ debug: false });
    // this.raycaster.mapGameObjects(this.player);
    // this.raycaster.mapGameObjects(this.map.layers.collision, false, { collisionTiles });
    // this.ray = this.raycaster.createRay();

    this.collideWithMap = this.collideWithMap.bind(this);
    this.collideWithCharacter = this.collideWithCharacter.bind(this);
  }

  collideWithPlayer(player, character) {
    const { ai } = character.characterDefinition;
    switch (ai.behavior) {
      case "npc": {
        npcAi.collideWithPlayer(player, character, this.bumpAttackSystem, this.scene);
        break;
      }
      case "turret": {
        turretAi.collideWithPlayer(player, character, this.bumpAttackSystem);
        break;
      }
      case "ramble": {
        rambleAi.collideWithPlayer(player, character, this.bumpAttackSystem);
        break;
      }
      case "charger": {
        chargerAi.collideWithPlayer(player, character, this.bumpAttackSystem);
        break;
      }
      case "flyer": {
        flyerAi.collideWithPlayer(player, character, this.bumpAttackSystem);
        break;
      }
      case "big-charger": {
        bossAi.collideWithPlayer(player, character, this.bumpAttackSystem);
        break;
      }
    }
  }

  processCollisionWithMap(character) {
    const { flies } = character.characterDefinition;
    return !flies;
  }

  collideWithMap(character) {
    const { ai } = character.characterDefinition;
    switch (ai.behavior) {
      case "turret": {
        turretAi.collideWithMap(character);
        break;
      }
      case "ramble": {
        rambleAi.collideWithMap(character);
        break;
      }
      case "charger": {
        chargerAi.collideWithMap(character);
        break;
      }
      case "flyer": {
        flyerAi.collideWithMap(character);
        break;
      }
      case "big-charger": {
        bossAi.collideWithMap(character);
        break;
      }
    }
  }

  processCollisionWithCharacter(first, second) {
    const firstFlies = first.characterDefinition.flies;
    const secondFlies = second.characterDefinition.flies;
    return !firstFlies && !secondFlies;
  }

  collideWithCharacter(character, second) {
    const { ai } = character.characterDefinition;
    switch (ai.behavior) {
      case "turret": {
        turretAi.collideWithCharacter(character, second);
        break;
      }
      case "ramble": {
        rambleAi.collideWithCharacter(character, second);
        break;
      }
      case "charger": {
        chargerAi.collideWithCharacter(character, second);
        break;
      }
      case "flyer": {
        flyerAi.collideWithCharacter(character, second);
        break;
      }
      case "big-charger": {
        bossAi.collideWithCharacter(character, second);
        break;
      }
    }
  }

  update(delta, character) {
    // Don't update dead characters
    if (character.health <= 0) {
      return;
    }

    const { ai } = character.characterDefinition;
    character.stepCount += 0.01 * delta;
    switch (ai.behavior) {
      case "npc": {
        npcAi.stateMachine(this.scene, character, this.player, this.bullets, this.map);
        break;
      }
      case "turret": {
        if (!this.characterInView(character)) {
          return;
        }
        turretAi.stateMachine(this.scene, character, this.player, this.bullets, this.map);
        break;
      }
      case "ramble": {
        if (!this.characterInView(character)) {
          return;
        }
        rambleAi.stateMachine(this.scene, character, this.player);
        break;
      }
      case "charger": {
        if (!this.characterInView(character)) {
          return;
        }
        chargerAi.stateMachine(this.scene, character, this.player);
        break;
      }
      case "flyer": {
        flyerAi.stateMachine(this.scene, character, this.player, this.bullets, this.map);
        break;
      }
      case "big-charger": {
        bossAi.stateMachine(this.scene, character, this.player, this.bullets, this.map);
        break;
      }
    }
  }

  characterInView(character) {
    return this.scene.cameras.main.worldView.contains(character.x, character.y);
  }
}
