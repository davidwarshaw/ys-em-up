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
      this.playState.music.dungeon.play({ loop: true, volume: 0.5 });
    } else if (key.startsWith("map-overworld") && this.playState.music.dungeon.isPlaying) {
      this.playState.music.dungeon.stop();
      this.playState.music.overworld.play({ loop: true, volume: 0.5 });
    }

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
    if (pit && !this.player.charge.charging) {
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
      hasItem: this.player.hasItem,
      bossDefeated: this.player.bossDefeated,
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
      spawn: { x: toX, y: toY, direction: this.player.direction },
    };
    this.cameras.main.fadeOut(properties.fadeMillis);
    this.scene.restart(this.playState);
  }

  fallInPit() {
    this.player.isFlickering = true;
    this.player.setVelocity(0, 0);
    this.player.direction = "down";
    this.player.sprite.flipY = true;
    this.player.playAnimationForDirection("idle");
    const flickerTimer = this.time.delayedCall(properties.flickerMillis, () => {
      this.cameras.main.fadeOut(properties.fadeMillis);
      this.player.setPosition(
        this.spawnXY.x + properties.tileWidth * 0.5,
        this.spawnXY.y - properties.tileHeight * 0.5
      );
      // We have to set this
      this.player.justPortaled = true;
      this.player.isFlickering = false;
      this.player.sprite.setVisible(true);
      this.player.sprite.flipY = false;
      this.cameras.main.fadeIn(properties.fadeMillis);
    });
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
    if (enemy.characterName !== "boss-01") {
      this.characters.killCharacter(enemy);
    } else {
      this.characters.killCharacter(enemy, () => this.bossDied());
    }
  }

  killPlayer() {
    console.log("player killed");
    // this.player.destroy();
    this.playState.currentEnemy = null;
    this.player.refillHealth();
    this.scene.restart();
  }

  bossDied() {
    const tile = this.map.tilemap.worldToTileXY(this.player.x, this.player.y);
    this.player.bossDefeated = true;
    this.cameras.main.flash(3 * properties.fadeMillis);
    this.playState.music.boss.stop();
    this.playState.music.dungeon.play({ loop: true, volume: 0.5 });
    this.changeMap({ toMapKey: "map-dungeon-boss-after-killed", toX: tile.x, toY: tile.y });
  }

  startSpeech(speechId, character) {
    if (character.characterName === "item-pickup") {
      this.player.hasItem = true;
      this.characters.killCharacter(character);
      this.cameras.main.flash(properties.fadeMillis);
    }
    this.player.stateChange("normal");
    this.playState.speechId = speechId;
    this.scene.pause("MapScene", this.playState);
    this.scene.run("SpeechScene", this.playState);
  }
}
