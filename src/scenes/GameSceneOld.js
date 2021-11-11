import properties from "../properties";

import InputMultiplexer from "../utils/InputMultiplexer";

import BumpAttackSystem from "../systems/BumpAttackSystem";

import Player from "../sprites/PlayerOld";
import Enemy from "../sprites/Enemy";

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameScene" });
  }

  init(playState) {
    this.playState = playState;
  }

  create() {
    this.createMap();
    this.createBackgroundLayers();

    const tile = this.randomSpawnableTile();
    this.player = new Player(this, this.map, tile);
    this.enemies = [];
    this.spawnEnemy();
    this.spawnEnemy();

    this.createForegroundLayer();

    this.bumpAttackSystem = new BumpAttackSystem(this);

    this.physics.add.collider(this.player, this.layers.collision, () =>
      this.player.collideWithMap()
    );

    this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    this.cameras.main.setViewport(0, 0, properties.width, properties.height - properties.hudHeight);
    this.startCameraFollow();

    this.inputMultiplexer = new InputMultiplexer(this);

    this.playState.player = this.player;
  }

  createMap() {
    this.map = this.make.tilemap({ key: "basic-map" });
    // The tile extrusion requires +1 margin and +2 spacing
    this.tileset = this.map.addTilesetImage(
      "ys_ii_tileset_extruded",
      "ys_ii_tileset_extruded",
      16,
      16,
      1,
      2
    );

    this.layers = {};
  }

  createBackgroundLayers() {
    this.layers.background = this.map.createLayer("background", this.tileset);
    this.layers.collision = this.map.createLayer("collision", this.tileset);
    this.map.setCollisionByExclusion([-1], true, true, this.layers.collision);
  }

  createForegroundLayer() {
    this.layers.foreground = this.map.createLayer("foreground", this.tileset);
  }

  randomSpawnableTile() {
    const candidates = this.layers.collision.layer.data
      .flat()
      .filter((tile) => tile.index === -1)
      .filter((tile) => this.player && this.player.x != tile.x && this.player.y != tile.y)
      .filter((tile) => this.enemies.every((enemy) => enemy.x != tile.x && enemy.y != tile.y))
      .map((tile) => ({ x: tile.x, y: tile.y, randomOrder: properties.rng.getUniform() }))
      .sort((l, r) => l.randomOrder - r.randomOrder);
    if (candidates.length === 0) {
      return { x: 10, y: 10 };
    }
    const tile = candidates[0];
    const { x, y } = tile;
    return { x, y };
  }

  spawnEnemy() {
    const tile = this.randomSpawnableTile();
    const enemy = new Enemy(this, this.map, this.player, tile);
    this.physics.add.collider(enemy, this.layers.collision, () => enemy.collideWithMap());
    this.enemies.forEach((existingEnemy) =>
      this.physics.add.collider(existingEnemy, enemy, () => enemy.collideWithMap())
    );
    this.physics.add.collider(this.player, enemy, (player, enemy) =>
      this.bumpAttackSystem.resolveCombat(player, enemy)
    );
    this.enemies.push(enemy);
  }

  startCameraFollow() {
    this.cameras.main.startFollow(this.player, true, 1, 1, 0, 0);
  }

  stopCameraFollow() {
    this.cameras.main.stopFollow();
  }

  killCharacter(character) {
    if (character.name === "enemy") {
      this.killEnemy(character);
    } else if (character.name === "player") {
      this.killPlayer();
    }
  }

  killEnemy(enemy) {
    this.enemies = this.enemies.filter((enemy) => enemy.health > 0);
    enemy.destroy();
    this.spawnEnemy();
    this.playState.currentEnemy = null;
  }

  killPlayer() {
    this.playState.currentEnemy = null;
    this.scene.restart();
  }

  update(time, delta) {
    this.inputMultiplexer.setPadButtons();

    this.player.update(this, delta, this.inputMultiplexer);
    this.enemies.forEach((enemy) => enemy.update(this, delta, this.player));
  }
}
