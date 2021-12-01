import properties from "../properties";

import CharacterSpeech from "../ui/CharacterSpeech";

import InputMultiplexer from "../utils/InputMultiplexer";

export default class SpeechScene extends Phaser.Scene {
  constructor() {
    super({ key: "SpeechScene" });
  }

  init(playState) {
    this.playState = playState;
  }

  create() {
    const { speechId } = this.playState;

    this.stopSpeech = this.stopSpeech.bind(this);
    this.characterSpeech = new CharacterSpeech(this, speechId, this.stopSpeech);
    console.log(this.characterSpeech);

    this.inputMultiplexer = new InputMultiplexer(this);

    this.playState.sfx.speech.play();
    this.characterSpeech.showNextTexBlock();
  }

  update(time, delta) {
    this.inputMultiplexer.setPadButtons();

    if (this.inputMultiplexer.actionPressed() || this.inputMultiplexer.jumpPressed()) {
      if (this.characterSpeech.textBlockIsOver()) {
        this.playState.sfx.speech.play();
        this.characterSpeech.showNextTexBlock();
      } else {
        this.characterSpeech.showThisTexBlock();
      }
    }
  }

  stopSpeech() {
    this.scene.stop("SpeechScene", this.playState);
    this.scene.resume("MapScene", this.playState);
  }
}
