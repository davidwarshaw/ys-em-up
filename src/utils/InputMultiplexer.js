const BUTTONS = ["action", "jump", "up", "down", "left", "right"];

export default class InputMultiplexer {
  constructor(scene) {
    this.scene = scene;

    this.buttons = {};
    BUTTONS.forEach((button) => {
      this.buttons[button] = {
        isDown: false,
      };
    });

    this.keys = {
      action: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z),
      jump: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X),
      up: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
      down: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
      left: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
      right: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
    };

    this.pressAndRelease = {};
    BUTTONS.forEach((button) => {
      this.pressAndRelease[button] = {
        isDown: false,
        wasDown: false,
      };
    });
  }

  registerPad() {
    if (!this.pad && this.scene.input.gamepad && this.scene.input.gamepad.pad1) {
      this.pad = this.scene.input.gamepad.pad1;
    }
  }

  setPadButtons() {
    if (this.pad) {
      this.buttons.action.isDown = this.pad.buttons[3].value === 1;
      this.buttons.jump.isDown = this.pad.buttons[2].value === 1;
      this.buttons.up.isDown = this.pad.leftStick.y === -1;
      this.buttons.down.isDown = this.pad.leftStick.y === 1;
      this.buttons.left.isDown = this.pad.leftStick.x === -1;
      this.buttons.right.isDown = this.pad.leftStick.x === 1;
    }

    this.setPressAndRelease();
  }

  setPressAndRelease() {
    BUTTONS.forEach((button) => {
      this.pressAndRelease[button].wasDown = this.pressAndRelease[button].isDown;
      this.pressAndRelease[button].isDown = this.input(button);
    });
  }

  input(playerInput) {
    return this.buttons[playerInput].isDown || this.keys[playerInput].isDown;
  }

  inputPressed(playerInput) {
    return this.pressAndRelease[playerInput].isDown && !this.pressAndRelease[playerInput].wasDown;
  }

  inputReleased(playerInput) {
    return !this.pressAndRelease[playerInput].isDown && this.pressAndRelease[playerInput].wasDown;
  }

  any() {
    return BUTTONS.some((button) => this.input(button));
  }

  anyPressed() {
    return BUTTONS.some((button) => this.inputPressed(button));
  }

  anyReleased() {
    return BUTTONS.some((button) => this.inputReleased(button));
  }

  action() {
    return this.input("action");
  }
  jump() {
    return this.input("jump");
  }
  up() {
    return this.input("up");
  }
  down() {
    return this.input("down");
  }
  left() {
    return this.input("left");
  }
  right() {
    return this.input("right");
  }

  actionPressed() {
    return this.inputPressed("action");
  }
  jumpPressed() {
    return this.inputPressed("jump");
  }
  upPressed() {
    return this.inputPressed("up");
  }
  downPressed() {
    return this.inputPressed("down");
  }
  leftPressed() {
    return this.inputPressed("left");
  }
  rightPressed() {
    return this.inputPressed("right");
  }

  actionReleased() {
    return this.inputReleased("action");
  }
  jumpReleased() {
    return this.inputReleased("jump");
  }
  upReleased() {
    return this.inputReleased("up");
  }
  downReleased() {
    return this.inputReleased("down");
  }
  leftReleased() {
    return this.inputReleased("left");
  }
  rightReleased() {
    return this.inputReleased("right");
  }

  dPadVector() {
    let x = 0;
    let y = 0;
    if (this.left()) {
      x = -1;
    } else if (this.right()) {
      x = 1;
    }
    if (this.up()) {
      y = -1;
    } else if (this.down()) {
      y = 1;
    }
    return { x, y };
  }
}
