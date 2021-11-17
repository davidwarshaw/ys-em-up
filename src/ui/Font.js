export default class Font {
  constructor(scene) {
    this.scene = scene;

    this.letterWidth = 9;
    this.letterHeight = 8;

    // prettier-ignore
    const chars = [
      ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o",
        "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", " ", " ", " ", " "],
      ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O",
        "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", " ", " ", " ", " "],
      ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", ".", ":", ",", ";", "(",
        "*", "!", "?", "}", "^", ")", "#", "$", "{", "%", "^", "&", "-", "+", "@"],
    ];

    const config = {
      image: "font-small",
      width: this.letterWidth,
      height: this.letterHeight,
      chars: chars.flat().join(""),
      charsPerRow: chars[0].length,
      spacing: { x: 0, y: 0 },
    };
    this.scene.cache.bitmapFont.add(
      "font-small",
      Phaser.GameObjects.RetroFont.Parse(scene, config)
    );

    const configTwoTone = {
      image: "font-small-two-tone",
      width: this.letterWidth,
      height: this.letterHeight,
      chars: chars.flat().join(""),
      charsPerRow: chars[0].length,
      spacing: { x: 0, y: 0 },
    };
    this.scene.cache.bitmapFont.add(
      "font-small-two-tone",
      Phaser.GameObjects.RetroFont.Parse(scene, configTwoTone)
    );
  }

  render(x, y, text) {
    return this.scene.add.bitmapText(x, y, "font-small", text);
  }

  renderTwoTone(x, y, text) {
    return this.scene.add.bitmapText(x, y, "font-small", text);
  }

  offsetForText(text) {
    return -(text.length * this.letterWidth) / 2;
  }
}
