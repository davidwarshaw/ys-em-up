import properties from "../properties";

import characterDefinitions from "../definitions/characterDefinitions.json";

export default class Characters {
  constructor(scene, map) {
    this.scene = scene;
    this.map = map;

    this.characters = [];
  }

  setCharacters(characters, player, aiSystem, bumpAttackSystem) {
    this.characters = characters;
    this.bumpAttackSystem = bumpAttackSystem;

    // Assign colliders
    this.characters.forEach((firstCharacter) => {
      // Characters collide with each other
      this.characters.forEach((secondCharacter) =>
        this.scene.physics.add.collider(
          firstCharacter,
          secondCharacter,
          (first, second) => aiSystem.collideWithCharacter(first, second),
          (first, second) => aiSystem.processCollisionWithCharacter(first, second)
        )
      );
      // Characters collide with map
      this.scene.physics.add.collider(
        firstCharacter,
        this.map.layers.collision,
        (first) => aiSystem.collideWithMap(first),
        (first) => aiSystem.processCollisionWithMap(first)
      );
      // Characters collide with hazards
      this.scene.physics.add.collider(
        firstCharacter,
        this.map.layers.hazard,
        (first) => aiSystem.collideWithMap(first),
        (first) => aiSystem.processCollisionWithMap(first)
      );
      // Characters collide with the player
      this.scene.physics.add.collider(player, firstCharacter, (player, enemy) =>
        aiSystem.collideWithPlayer(player, enemy)
      );
    });
  }

  characterAtTile(tile) {
    const candidates = this.characters.filter((character) => {
      const characterTile = this.map.tilemap.worldToTileXY(character.x, character.y);
      return characterTile.x === tile.x && characterTile.y === tile.y;
    });

    if (candidates.length > 0) {
      return candidates[0];
    }

    return null;
  }

  killCharacter(character, afterDeathCallback) {
    this.bumpAttackSystem.clearCurrentEnemy();
    character.body.stop();
    character.body.enable = false;
    character.isFlickering = true;
    const flickerTimer = this.scene.time.delayedCall(properties.flickerMillis, () => {
      this.purgeDead();
      character.destroy();
      if (afterDeathCallback) {
        afterDeathCallback();
      }
    });
  }

  purgeDead() {
    this.characters = this.characters.filter((character) => character.health > 0);
  }

  getSpeechForCharacter(character) {
    const characterDefinition = characterDefinitions[character.characterName];
    return characterDefinition.speech;
  }

  update(delta, aiSystem) {
    this.characters.forEach((character) => character.update(delta, aiSystem));
  }
}
