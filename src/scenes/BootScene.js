const MAP_NAMES = [
  "overworld-village-01",
  "overworld-forest-01",
  "overworld-forest-02",
  "overworld-forest-dungeon-exit",
  "dungeon-ante-chamber-01",
  "dungeon-ante-chamber-02",
  "dungeon-fork",
  "dungeon-before-item",
  "dungeon-item",
  "dungeon-before-boss",
  "dungeon-boss",
  "dungeon-boss-after-killed",
  "dungeon-before-exit",
];

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: "BootScene" });
  }

  preload() {
    // Misc
    this.load.image("font-small", "assets/fonts/Altered_Chrome_Bold.png");
    this.load.image("font-small-two-tone", "assets/fonts/Altered_Chrome_Bold-two-tone.png");
    this.load.image("hud", "assets/images/hud.png");
    this.load.image("hud-dash", "assets/images/hud-dash.png");
    this.load.image("speech", "assets/images/speech.png");
    this.load.image("title-big", "assets/images/title-plate.png");

    // Maps
    this.load.image("tileset", "assets/maps/tileset.png");
    MAP_NAMES.forEach((mapName) =>
      this.load.tilemapTiledJSON(`map-${mapName}`, `assets/maps/map-${mapName}.json`)
    );

    // Sprites
    this.load.image("bubble", "assets/images/bubble.png");
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
    this.load.audio("overworld-music", "assets/audio/overworld-music.mp3");
    this.load.audio("dungeon-music", "assets/audio/dungeon-music.mp3");
    this.load.audio("boss-music", "assets/audio/boss-music.mp3");

    this.load.audio("new-game", "assets/audio/sfx_menu_select2.wav");

    this.load.audio("hit", "assets/audio/sfx_wpn_punch3.wav");
    this.load.audio("hit-bullet", "assets/audio/sfx_sounds_impact4.wav");
    this.load.audio("fall-in-pit", "assets/audio/sfx_sounds_falling7.wav");

    this.load.audio("player-prep-charge", "assets/audio/sfx_sound_mechanicalnoise4.wav");
    this.load.audio("player-charge", "assets/audio/sfx_sound_mechanicalnoise3.wav");
    this.load.audio("item-pickup", "assets/audio/sfx_sound_depressurizing.wav");

    this.load.audio("player-death", "assets/audio/sfx_sounds_falling10.wav");
    this.load.audio("enemy-death", "assets/audio/sfx_sound_neutral7.wav");
    this.load.audio("boss-death", "assets/audio/sfx_sound_mechanicalnoise6.wav");

    this.load.audio("enemy-fly", "assets/audio/sfx_movement_footstepsloop4_fast.wav");
    this.load.audio("enemy-charge", "assets/audio/sfx_sounds_interaction21.wav");
    this.load.audio("enemy-bullet", "assets/audio/sfx_sound_neutral8.wav");

    this.load.audio("speech", "assets/audio/sfx_sounds_interaction24.wav");
  }

  create() {
    this.scene.start("TitleScene", this.playState);
  }
}
