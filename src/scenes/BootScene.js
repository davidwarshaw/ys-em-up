const MAP_NAMES = [
  "overworld-forest-01",
  "dungeon-ante-chamber-01",
  "dungeon-ante-chamber-02",
  "dungeon-fork",
  "dungeon-boss",
];

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: "BootScene" });
  }

  preload() {
    // Misc
    this.load.image("font-small", "assets/fonts/atari_like.png");
    this.load.image("select-frame", "assets/images/select_frame.png");
    this.load.image("window-small", "assets/images/window_small.png");
    this.load.image("window-big", "assets/images/window_big.png");
    this.load.image("window-intro", "assets/images/window_intro.png");

    // Maps
    this.load.image("ys_ii_tileset_extruded", "assets/maps/ys_ii_tileset_extruded.png");

    this.load.tilemapTiledJSON("map-overworld-01", "assets/maps/map-overworld-01.json");
    MAP_NAMES.forEach((mapName) =>
      this.load.tilemapTiledJSON(`map-${mapName}`, `assets/maps/map-${mapName}.json`)
    );
    // Sprites
    this.load.spritesheet("bosses", "assets/images/bosses-spritesheet.png", {
      frameWidth: 32,
      frameHeight: 32,
      margin: 0,
      spacing: 0,
    });
    this.load.spritesheet("characters", "assets/images/characters-spritesheet.png", {
      frameWidth: 16,
      frameHeight: 16,
      margin: 0,
      spacing: 0,
    });
    this.load.spritesheet("bullets", "assets/images/bullets-spritesheet.png", {
      frameWidth: 8,
      frameHeight: 8,
      margin: 0,
      spacing: 0,
    });

    // Audio
    this.load.audio("enter", "assets/audio/sfx_menu_select2.wav");
    this.load.audio("next-level", "assets/audio/sfx_sounds_fanfare2.wav");
    this.load.audio("game-over", "assets/audio/sfx_sounds_negative2.wav");
    this.load.audio("new-game", "assets/audio/sfx_menu_select2.wav");

    this.load.audio("walk", "assets/audio/sfx_movement_footstepsloop4_fast.wav");
    this.load.audio("jump", "assets/audio/sfx_movement_jump1.wav");

    this.load.audio("dig", "assets/audio/sfx_wpn_punch1.wav");
    this.load.audio("fill", "assets/audio/sfx_damage_hit2.wav");
    this.load.audio("hit", "assets/audio/sfx_wpn_punch3.wav");
    this.load.audio("stone", "assets/audio/sfx_wpn_punch4.wav");

    this.load.audio("dump", "assets/audio/sfx_movement_dooropen4.wav");

    this.load.audio("pestilence", "assets/audio/sfx_sound_neutral5.wav");
    this.load.audio("infection", "assets/audio/sfx_sound_neutral8.wav");
  }

  create() {
    this.scene.start("TitleScene", this.playState);
    // this.scene.start("GameScene", this.playState);
    // this.scene.start("HudScene", this.playState);
  }
}
