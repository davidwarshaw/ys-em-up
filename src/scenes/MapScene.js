import properties from "../properties";

import Map from "../sprites/Map";
import Player from "../sprites/Player";
import Portals from "../sprites/Portals";
import Characters from "../sprites/Characters";
import Bullets from "../sprites/Bullets";

import AiSystem from "../systems/AiSystem";
import BumpAttackSystem from "../systems/BumpAttackSystem";

import InputMultiplexer from "../utils/InputMultiplexer";

const CODE_WORDS = ["boss", "rambler", "charger", "flyer"];

export default class MapScene extends Phaser.Scene {
  constructor() {
    super({ key: "MapScene" });
  }

  init(playState) {
    this.playState = playState;
  }

  create() {
    // console.log(`\n\nScene created: ${this.playState.currentMap.key}`);
    const { playerState, currentMap } = this.playState;
    const { key, spawn } = currentMap;
    // console.log(`player tile spawn: ${spawn.x}, ${spawn.y}`);
    this.map = new Map(this, key);
    const { widthInPixels, heightInPixels } = this.map.tilemap;
    this.spawnXY = this.map.tilemap.tileToWorldXY(spawn.x, spawn.y);

    this.physics.world.setBounds(0, 0, widthInPixels, heightInPixels);

    this.player = new Player(this, this.map, this.spawnXY, spawn.direction, playerState);
    // console.log(`widthInPixels: ${widthInPixels} heightInPixels: ${heightInPixels}`);

    this.portals = new Portals(this, this.map);
    this.portals.setPortals(this.map.createPortals());

    this.characters = new Characters(this, this.map);

    this.bullets = new Bullets(this, this.map);

    const viewportHeight = properties.height - properties.hudHeight;
    this.cameras.main.setViewport(0, 0, properties.width, viewportHeight);
    const centerOn = true;
    this.cameras.main.setBounds(0, 0, widthInPixels, heightInPixels, centerOn);
    this.cameras.main.startFollow(this.player, true, 1, 1, 0, 0);

    this.bumpAttackSystem = new BumpAttackSystem(this);

    this.aiSystem = new AiSystem(this, this.map, this.player, this.bullets, this.bumpAttackSystem);

    this.inputMultiplexer = new InputMultiplexer(this);

    this.characters.setCharacters(
      this.map.createCharacters(this.player),
      this.player,
      this.aiSystem,
      this.bumpAttackSystem
    );

    this.bullets.setBumpAttackSystem(this.player, this.bumpAttackSystem);

    this.startSpeech = this.startSpeech.bind(this);

    this.playState.player = this.player;

    this.sounds = {
      gameOver: this.sound.add("game-over"),
      nextLevel: this.sound.add("next-level"),
    };

    this.comboKeyCodes = {};
    CODE_WORDS.forEach((codeWord) => {
      const combo = this.input.keyboard.createCombo(codeWord, { resetOnMatch: true });
      const keyCode = combo.keyCodes.join("");
      this.comboKeyCodes[keyCode] = codeWord;
    });
    this.input.keyboard.on("keycombomatch", (event) => {
      const keyCode = event.keyCodes.join("");
      const codeWord = this.comboKeyCodes[keyCode];
      switch (codeWord) {
        case "health": {
          this.player.refillHealth();
          break;
        }
        case "boss": {
          this.player.refillHealth();
          this.changeMap({ toMapKey: "map-dungeon-fork", toX: 6, toY: 2 });
          break;
        }
        case "rambler": {
          this.player.refillHealth();
          this.changeMap({ toMapKey: "map-dungeon-ante-chamber-01", toX: 14, toY: 9 });
          break;
        }
        case "charger": {
          this.player.refillHealth();
          this.changeMap({ toMapKey: "map-dungeon-fork", toX: 31, toY: 31 });
          break;
        }
        case "flyer": {
          this.player.refillHealth();
          this.changeMap({ toMapKey: "map-dungeon-ante-chamber-02", toX: 13, toY: 22 });
          break;
        }
      }
    });

    this.cameras.main.fadeIn(properties.fadeMillis);
  }

  update(time, delta) {
    this.inputMultiplexer.setPadButtons();

    const actionTile = this.player.update(delta, this.inputMultiplexer);
    if (actionTile) {
      this.startConfrontation("sheriff");
      // const character = this.characters.characterAtTile(actionTile);
      // if (character) {
      //   const speechId = this.characters.getSpeechForCharacter(character);
      //   this.startSpeech(speechId);
      // }
    }

    const portal = this.portals.playerOnPortal(this.player);
    if (portal) {
      // console.log(`this.player.justPortaled: ${this.player.justPortaled}`);
      if (!this.player.justPortaled) {
        this.changeMap(portal);
      }
    } else {
      this.player.justPortaled = false;
    }

    const pit = this.map.checkPits(this.player);
    if (pit) {
      this.fallInPit();
    }

    this.characters.update(delta, this.aiSystem);

    this.syncPlayerState();
  }

  startCameraFollow() {
    this.cameras.main.startFollow(this.player, true, 1, 1, 0, 0);
  }

  stopCameraFollow() {
    this.cameras.main.stopFollow();
  }

  syncPlayerState() {
    this.playState.playerState = {
      health: this.player.health,
      healthMax: this.player.healthMax,
    };
  }

  startConfrontation(confrontation) {
    this.playState.confrontation = confrontation;
    this.scene.pause("MapScene", this.playState);
    this.scene.run("ConfrontationScene", this.playState);
  }

  changeMap(portal) {
    // Just in case we change maps in the middle of an update loop
    this.syncPlayerState();

    console.log(`Changing map to: ${portal.toMapKey}`);
    const { toMapKey, toX, toY } = portal;
    this.playState.currentMap = {
      key: toMapKey,
      // NOTE: Why Tiled y values always one off?
      spawn: { x: toX, y: toY + 1, direction: this.player.direction },
    };
    this.cameras.main.fadeOut(properties.fadeMillis);
    this.scene.restart(this.playState);
  }

  fallInPit() {
    this.cameras.main.fadeOut(properties.fadeMillis);
    this.player.x = this.spawnXY.x;
    this.player.y = this.spawnXY.y;
    this.cameras.main.fadeIn(properties.fadeMillis);
  }

  killCharacter(character) {
    if (character.isPlayer()) {
      this.killPlayer();
    } else {
      this.killEnemy(character);
    }
  }

  killEnemy(enemy) {
    console.log("enemy killed");
    this.characters.killCharacter(enemy);
  }

  killPlayer() {
    console.log("player killed");
    // this.player.destroy();
    this.playState.currentEnemy = null;
    this.player.refillHealth();
    this.scene.restart();
  }

  startSpeech(speechId) {
    this.playState.speechId = speechId;
    this.scene.pause("MapScene", this.playState);
    this.scene.run("SpeechScene", this.playState);
  }
}
