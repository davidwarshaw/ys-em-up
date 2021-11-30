const CODE_WORDS = [
  "health",
  "item",
  "fork",
  "itemroom",
  "grove",
  "exit",
  "village",
  "boss",
  "rambler",
  "charger",
  "flyer",
];

function setup(scene) {
  scene.comboKeyCodes = {};
  CODE_WORDS.forEach((codeWord) => {
    const combo = scene.input.keyboard.createCombo(codeWord, { resetOnMatch: true });
    const keyCode = combo.keyCodes.join("");
    scene.comboKeyCodes[keyCode] = codeWord;
  });
  scene.input.keyboard.on("keycombomatch", (event) => {
    const keyCode = event.keyCodes.join("");
    const codeWord = scene.comboKeyCodes[keyCode];
    switch (codeWord) {
      case "health": {
        scene.player.refillHealth();
        break;
      }
      case "item": {
        scene.player.hasItem = !scene.player.hasItem;
        break;
      }
      case "fork": {
        scene.player.refillHealth();
        scene.changeMap({ toMapKey: "map-dungeon-fork", toX: 7, toY: 12 });
        break;
      }
      case "itemroom": {
        scene.player.refillHealth();
        scene.changeMap({ toMapKey: "map-dungeon-item", toX: 14, toY: 10 });
        break;
      }
      case "grove": {
        scene.player.refillHealth();
        scene.changeMap({ toMapKey: "map-dungeon-before-item", toX: 9, toY: 17 });
        break;
      }
      case "exit": {
        scene.player.refillHealth();
        scene.changeMap({ toMapKey: "map-overworld-forest-dungeon-exit", toX: 10, toY: 2 });
        break;
      }
      case "village": {
        scene.player.refillHealth();
        scene.changeMap({ toMapKey: "map-overworld-village-01", toX: 16, toY: 16 });
        break;
      }
      case "boss": {
        scene.player.refillHealth();
        scene.changeMap({ toMapKey: "map-dungeon-before-boss", toX: 16, toY: 5 });
        break;
      }
      case "rambler": {
        scene.player.refillHealth();
        scene.changeMap({ toMapKey: "map-dungeon-ante-chamber-01", toX: 14, toY: 9 });
        break;
      }
      case "charger": {
        scene.player.refillHealth();
        scene.changeMap({ toMapKey: "map-dungeon-fork", toX: 31, toY: 31 });
        break;
      }
      case "flyer": {
        scene.player.refillHealth();
        scene.changeMap({ toMapKey: "map-dungeon-ante-chamber-02", toX: 13, toY: 22 });
        break;
      }
    }
  });
}
export default {
  setup,
};
