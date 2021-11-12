import Direction from "../utils/Direction";

const TARGET_DELTA = 10;
const FIRE_ANGLES = [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5];

function collideWithMap(boss) {
  switch (boss.ai.state) {
    case "charge": {
      boss.setVelocity(0, 0);
      boss.ai.firingAngle = 0;
      changeState(boss, "fire-01");
      break;
    }
  }
}

function stateMachine(scene, boss, player, bullets) {
  if (!boss.ai.state) {
    boss.ai.state = "intro";
  }
  switch (boss.ai.state) {
    case "intro": {
      if (boss.stepCount > 10) {
        changeState(boss, "prep-charge");
      }
      break;
    }
    case "wait": {
      boss.setVelocity(0, 0);
      if (boss.stepCount > 10) {
        changeState(boss, "prep-charge");
      }
      break;
    }
    case "prep-charge": {
      if (!boss.ai.animation) {
        scene.juice.shake(boss, {
          x: 1,
          onComplete: (tween, target) => {
            changeState(boss, "charge");
            boss.ai.animation = false;
          },
        });
        boss.ai.animation = true;
      }
      break;
    }
    case "charge": {
      if (!boss.ai.animation) {
        boss.ai.target = {
          x: player.x,
          y: player.y,
        };
        // console.log(`boss target: ${boss.ai.target.x}, ${boss.ai.target.y}`);
        boss.ai.animation = true;
      }
      // console.log(`dist: ${Phaser.Math.Distance.BetweenPoints(boss, boss.ai.target)}`);
      if (Phaser.Math.Distance.BetweenPoints(boss, boss.ai.target) < TARGET_DELTA) {
        boss.setVelocity(0, 0);
        boss.ai.firingAngle = 0;
        changeState(boss, "fire-01");
      } else {
        const angle = Phaser.Math.Angle.BetweenPoints(boss, boss.ai.target);
        const velocityX = boss.walkspeed * Math.cos(angle);
        const velocityY = boss.walkspeed * Math.sin(angle);

        boss.setVelocity(velocityX, velocityY);
        boss.direction = Direction.directionFromAngle(angle);
      }
      break;
    }
    case "fire-01": {
      boss.setVelocity(0, 0);
      if (boss.stepCount > 10 && Math.round(boss.stepCount) % 5 == 0) {
        boss.ai.bullets = FIRE_ANGLES.map((angle) => angle + boss.ai.firingAngle).map((angle) =>
          bullets.spawnAtAngle(boss, angle, "standard")
        );
        boss.ai.firingAngle += Math.PI * 0.02;
      }
      if (boss.stepCount > 20) {
        changeState(boss, "wait");
      }
      break;
    }
  }
}

function changeState(boss, newState) {
  console.log(`boss changeState: ${boss.ai.state} -> ${newState}`);
  boss.ai.state = newState;
  boss.stepCount = 0;
  boss.ai.animation = false;
}

export default {
  collideWithMap,
  stateMachine,
};
