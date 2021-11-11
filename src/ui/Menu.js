import properties from "../properties";

import Font from "./Font";

export default class Menu {
  constructor(scene, items) {
    this.scene = scene;
    this.items = items;

    this.font = new Font(scene);

    const centerX = properties.width / 2;
    const centerY = properties.height / 2;

    this.speechPanel = scene.add.ninePatch(
      centerX,
      properties.height - Math.round(properties.speechWindowHeight / 2),
      properties.width,
      properties.speechWindowHeight,
      'speech-frame-ninepatch-light',
      null,
      properties.ninePatchDimension
    );

    const panelBounds = this.speechPanel.getBounds();
    this.topRow = panelBounds.top + properties.ninePatchDimension.top;

    this.rowLeft = properties.ninePatchDimension.top + (8 * 5);

    this.pointer = 0;
    this.itemTexts = items.map((item, i) => {
      const text = this.font.render(
        this.rowLeft,
        this.topRow + this.offsetForPointer(i),
        item
      );
      return text;
    });
    this.pointerImage = this.font.render(0, 0, ">");
    this.renderPointer(this.pointer);
  }

  up() {
    this.pointer--;
    if (this.pointer < 0) {
      this.pointer = this.items.length - 1;
    }
    this.renderPointer(this.pointer);
  }

  down() {
    this.pointer++;
    if (this.pointer >= this.items.length) {
      this.pointer = 0;
    }
    this.renderPointer(this.pointer);
  }

  select() {
    return this.pointer;
  }

  offsetForText(text) {
    return -(text.length * 8) / 2;
  }

  offsetForPointer(pointer) {
    return pointer * 8;
  }

  renderPointer(pointer) {
    this.pointerImage.x = this.rowLeft - (1 * 8);
    this.pointerImage.y = this.topRow + this.offsetForPointer(pointer);
  }
}