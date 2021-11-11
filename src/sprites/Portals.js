import characterDefinitions from "../definitions/characterDefinitions.json";

export default class Portals {
  constructor(scene, map) {
    this.scene = scene;
    this.map = map;

    this.portals = [];
  }

  setPortals(portals) {
    this.portals = portals;
  }

  playerOnPortal(player) {
    const playerTile = this.map.tilemap.worldToTileXY(player.x, player.y);
    const candidates = this.portals.filter((portal) => {
      const portalTile = this.map.tilemap.worldToTileXY(portal.x, portal.y);
      // console.log(
      //   `portalTile: ${portalTile.x}, ${portalTile.y} playerTile: ${playerTile.x}, ${playerTile.y}`
      // );
      // NOTE: why do we have to subtract 1 from the tile y?
      return portalTile.x === playerTile.x && portalTile.y - 1 === playerTile.y;
    });

    if (candidates.length > 0) {
      return candidates[0];
    }

    return null;
  }
}
