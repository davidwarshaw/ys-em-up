import properties from "../properties.js";

import mapDefinitions from "../definitions/mapDefinitions.json";

import Character from "./Character.js";

export default class Map {
  constructor(scene, currentMapKey) {
    this.scene = scene;
    this.currentMapKey = currentMapKey;

    const tileset = "ys_ii_tileset_extruded";

    this.tilemap = scene.make.tilemap({ key: currentMapKey });
    this.tileset = this.tilemap.addTilesetImage(tileset, tileset);

    this.layers = {
      foreground: null,
      portals: null,
      collision: null,
      hazard: null,
      background: null,
    };
    this.layers.background = this.tilemap.createLayer("background", this.tileset, 0, 0);
    this.layers.background.setDepth(10);

    this.layers.hazard = this.tilemap.createLayer("hazard", this.tileset, 0, 0);
    this.layers.hazard.setDepth(15);
    this.tilemap.setCollisionByProperty({ collides: true }, true, true, "hazard");

    this.layers.foreground = this.tilemap.createLayer("foreground", this.tileset, 0, 0);
    this.layers.foreground.setDepth(30);

    this.layers.collision = this.tilemap.createLayer("collision", this.tileset, 0, 0);
    this.layers.collision.setDepth(15);
    this.layers.collision.visible = properties.debug;
    this.tilemap.setCollisionByProperty({ collides: true }, true, true, "collision");
  }

  arrayToProps(arr) {
    const props = {};
    arr.forEach((element) => {
      props[element["name"]] = element["value"];
    });
    return props;
  }

  createPortals() {
    return this.tilemap.getObjectLayer("portals").objects.map((object) => {
      const { x, y, properties } = object;
      const { toMapKey, toX, toY } = this.arrayToProps(properties);
      return { x, y, toMapKey, toX, toY };
    });
  }

  createCharacters(player) {
    return this.tilemap.getObjectLayer("characters").objects.map((object) => {
      const { x, y, name } = object;
      const character = new Character(
        this.scene,
        this,
        { x, y },
        name,
        Phaser.Physics.Arcade.DYNAMIC_BODY
      );
      return character;
    });
  }

  checkPits(player) {
    const playerTile = this.tilemap.worldToTileXY(player.x, player.y);
    const tile = this.layers.hazard.getTileAt(playerTile.x, playerTile.y);
    if (tile && tile.properties.pit) {
      return tile;
    }
    return null;
  }
}