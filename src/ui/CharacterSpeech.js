import properties from "../properties";

import speechDefinitions from "../definitions/speechDefinitions.json";

import Font from "./Font";

export default class CharacterSpeech {
  constructor(scene, speechId, finishCallBack) {
    this.scene = scene;
    this.speechId = speechId;
    this.finishCallBack = finishCallBack;

    this.definition = speechDefinitions[speechId];
    this.textBlocks = [];

    this.font = new Font(scene);

    this.centerX = properties.width / 2;
    this.centerY = properties.height / 2;

    this.speechPanelY = properties.height - properties.speechWindowHeight;

    this.numberLines = 4;
    this.maxLineLength = Math.floor(
      (properties.width - 2 * properties.ninePatchDimension.left) / 9
    );

    this.speechPanel = scene.add.image(0, this.speechPanelY, "speech");
    this.speechPanel.setOrigin(0, 0);
    this.speechPanel.visible = false;

    const panelBounds = this.speechPanel.getBounds();
    this.text = this.font.render(
      panelBounds.left + properties.ninePatchDimension.left,
      panelBounds.top + properties.ninePatchDimension.top,
      ""
    );
    this.text.setOrigin(0, 0);

    this.textBlockPointer = -1;
    this.letterPointer = -1;
    this.textBlockChangeTimer = null;
    this.textBlockIntervalId = null;

    this.renderSpeechesToTextBlock();

    this.getCurrentTextBlock = this.getCurrentTextBlock.bind(this);
    this.getCurrentText = this.getCurrentText.bind(this);
    this.showNextLetter = this.showNextLetter.bind(this);
    this.showNextTexBlock = this.showNextTexBlock.bind(this);
    this.endSpeech = this.endSpeech.bind(this);
  }

  renderSpeechesToTextBlock() {
    this.definition.speech.forEach((speech) => {
      // The current block
      let textBlock = [];
      // The current line
      let textLine = [""];
      speech.text.split(" ").forEach((word) => {
        const candidateLine = [...textLine, word].join(" ");
        const candidateLength = candidateLine.length;
        // console.log(`candidateLine: ${candidateLine} candidateLength: ${candidateLength}`);
        if (candidateLength <= this.maxLineLength) {
          // Continue the current line
          textLine.push(word);
        } else if (textBlock.length < this.numberLines - 1) {
          // Start a new line
          textBlock.push(textLine.join(" "));
          textLine = [word];
        } else {
          // Start a new line and a new block
          textBlock.push(textLine.join(" "));
          this.textBlocks.push(textBlock.join("\n"));
          textBlock = [];
          textLine = [word];
        }
      });
      // Flush last line and block
      textBlock.push(textLine.join(" "));
      this.textBlocks.push(textBlock.join("\n"));
    });
  }

  getCurrentTextBlock() {
    return this.textBlocks[this.textBlockPointer];
  }

  getCurrentText() {
    const text = this.getCurrentTextBlock()
      .split("")
      .slice(0, this.letterPointer + 1)
      .join("");
    return text;
  }

  showNextLetter() {
    this.letterPointer++;
    if (this.letterPointer >= this.getCurrentTextBlock().length) {
      clearInterval(this.textBlockIntervalId);
      this.textBlockIntervalId = null;
      return;
    }

    const text = this.getCurrentText();
    this.text.setText(text);
  }

  showNextTexBlock() {
    this.letterPointer = -1;
    this.textBlockPointer++;
    if (this.textBlockPointer >= this.textBlocks.length) {
      this.textBlockPointer = 0;
      this.endSpeech();
      return;
    }

    this.text.setText("");

    this.speechPanel.visible = true;

    this.textBlockIntervalId = setInterval(this.showNextLetter, properties.letterRateMillis);
  }

  showThisTexBlock() {
    this.letterPointer = this.getCurrentTextBlock().length - 2;
  }

  textBlockIsOver() {
    return !this.textBlockIntervalId;
  }

  endSpeech() {
    this.finishCallBack();
  }
}
