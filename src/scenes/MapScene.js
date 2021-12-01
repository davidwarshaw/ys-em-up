import properties from "../properties";

import Map from "../sprites/Map";
import Player from "../sprites/Player";
import Portals from "../sprites/Portals";
import Characters from "../sprites/Characters";
import Bullets from "../sprites/Bullets";

import AiSystem from "../systems/AiSystem";
import BumpAttackSystem from "../systems/BumpAttackSystem";

import KeyCombos from "../ui/KeyCombos";
import InputMultiplexer from "../utils/InputMultiplexer";

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
    this.spawnXY = this.map.tilemap.tileToWorldXY(spawn.x, spawn.y + 1);

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

    KeyCombos.setup(this);

    if (key.startsWith("map-dungeon") && this.playState.music.overworld.isPlaying) {
      this.playState.music.overworld.stop();
      this.playState.music.dungeon.play({ loop: true, volume: 1.0 });
    } else if (key.startsWith("map-overworld") && this.playState.music.dungeon.isPlaying) {
      this.playState.music.dungeon.stop();
      this.playState.music.overworld.play({ loop: true, volume: 0.5 });
    }

    this.playState.sfx.fallInPit.on(
      "complete",
      (sound) => {
        this.cameras.main.fadeOut(properties.fadeMillis);
        this.player.resetFromPit(this.spawnXY);
        this.cameras.main.fadeIn(properties.fadeMillis);
      },
      this
    );
    this.playState.sfx.playerDeath.on(
      "complete",
      (sound) => {
        this.killPlayer();
      },
      this
    );

    this.cameras.main.fadeIn(properties.fadeMillis);
  }

  update(time, delta) {
    this.inputMultiplexer.setPadButtons();

    const { bossDefeated } = this.playState.playerState;
    const { key, spawn } = this.playState.currentMap;
    if (!bossDefeated && key === "map-dungeon-boss-after-killed") {
      this.playState.music.dungeon.stop();
      this.playState.music.boss.play({ loop: true, volume: 0.5 });
      this.changeMap({ toMapKey: "map-dungeon-boss", toX: spawn.x, toY: spawn.y });
    }

    this.player.update(delta, this.inputMultiplexer);

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
    if (pit && !this.player.charge.charging && !this.player.justFellInPit) {
      this.fallInPit();
      this.player.justFellInPit = true;
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
      hasItem: this.player.hasItem,
      bossDefeated: this.player.bossDefeated,
    };
  }

  changeMap(portal, candidateFadeTime) {
    const fadeTime = candidateFadeTime || properties.fadeMillis;
    // Just in case we change maps in the middle of an update loop
    this.syncPlayerState();

    this.playState.sfx.enemyFly.stop();

    // console.log(`Changing map to: ${portal.toMapKey}`);
    const { toMapKey, toX, toY } = portal;
    this.playState.currentMap = {
      key: toMapKey,
      spawn: { x: toX, y: toY, direction: this.player.direction },
    };
    this.cameras.main.fadeOut(fadeTime);
    this.scene.restart(this.playState);
  }

  fallInPit() {
    this.playState.sfx.fallInPit.play();
    this.player.fallInPit();
  }

  killCharacter(character) {
    if (character.isPlayer()) {
      this.playState.sfx.playerDeath.play();
      this.player.die();
    } else {
      this.killEnemy(character);
    }
  }

  killEnemy(enemy) {
    // console.log("enemy killed");
    if (enemy.characterName !== "boss-01") {
      this.playState.sfx.enemyDeath.play();
      this.characters.killCharacter(enemy);
    } else {
      this.playState.sfx.bossDeath.on(
        "complete",
        (sound) => {
          this.characters.killCharacter(enemy, () => this.bossDied());
        },
        this
      );
      this.cameras.main.flash(5 * properties.fadeMillis);
      this.playState.sfx.bossDeath.play();
    }
    if (enemy.characterName === "flyer") {
      this.playState.sfx.enemyFly.stop();
    }
  }

  killPlayer() {
    // console.log("player killed");
    this.playState.currentEnemy = null;
    this.player.refillHealth();
    this.syncPlayerState();
    this.scene.restart();
  }

  bossDied() {
    const tile = this.map.tilemap.worldToTileXY(this.player.x, this.player.y);
    this.player.bossDefeated = true;
    this.playState.music.boss.stop();
    this.playState.music.dungeon.play({ loop: true, volume: 0.5 });
    this.changeMap(
      { toMapKey: "map-dungeon-boss-after-killed", toX: tile.x, toY: tile.y },
      5 * properties.fadeMillis
    );
  }

  startSpeech(speechId, character) {
    if (character.characterName === "item-pickup") {
      this.playState.sfx.itemPickup.on(
        "complete",
        (sound) => {
          this.player.acceptInput = true;
          this.player.hasItem = true;
          this.characters.killCharacter(character);
          this.player.stateChange("normal");
          this.playState.speechId = speechId;
          this.scene.pause("MapScene", this.playState);
          this.scene.run("SpeechScene", this.playState);
        },
        this
      );
      this.player.acceptInput = false;
      this.player.playAnimationForDirection("idle");
      this.playState.sfx.itemPickup.play();
      this.cameras.main.flash(3 * properties.fadeMillis);
    } else {
      this.player.stateChange("normal");
      this.playState.speechId = speechId;
      this.scene.pause("MapScene", this.playState);
      this.scene.run("SpeechScene", this.playState);
    }
  }
}
