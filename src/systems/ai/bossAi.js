import Direction from "../../utils/Direction";
import BumpAttackSystem from "../BumpAttackSystem";
import Ai from "./Ai";

const TARGET_DELTA = 10;
const FIRE_ANGLES = [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5];

function collideWithPlayer(player, boss) {
  boss.setVelocity(0, 0);
  BumpAttackSystem.resolveCombat(player, boss);
  boss.stepCount = 0;
  Ai.changeState(boss, "wait");
}

function collideWithMap(boss) {
  switch (boss.ai.state) {
    case "charge": {
      boss.setVelocity(0, 0);
      boss.ai.firingAngle = 0;
      Ai.changeState(boss, "fire-01");
      break;
    }
  }
}

function collideWithCharacter(boss, second) {
  console.log("This should never happen :/");
}

function stateMachine(scene, boss, player, bullets, map) {
  if (!boss.ai.state) {
    boss.ai.state = "intro";
    boss.ai.phase = 0;
  }
  switch (boss.ai.state) {
    case "intro": {
      if (boss.stepCount > 10) {
        Ai.changeState(boss, "prep-charge");
      }
      break;
    }
    case "wait": {
      boss.invulnerable = false;
      boss.setVelocity(0, 0);
      if (boss.stepCount > 10 - 3 * boss.ai.phase) {
        Ai.changeState(boss, "prep-charge");
      }
      break;
    }
    case "prep-charge": {
      if (!boss.ai.animation) {
        scene.juice.shake(boss, {
          x: 1 + 2 * boss.ai.phase,
          onComplete: (tween, target) => {
            Ai.changeState(boss, "charge");
            boss.ai.animation = false;
          },
        });
        boss.ai.animation = true;
      }
      break;
    }
    case "charge": {
      boss.invulnerable = true;
      if (!boss.ai.animation) {
        boss.ai.target = {
          x: player.x,
          y: player.y,
        };
        // console.log(`boss target: ${boss.ai.target.x}, ${boss.ai.target.y}`);
        boss.ai.animation = true;
      }
      chargeAndChangeState(boss, "fire-01");
      break;
    }
    case "fire-01": {
      boss.invulnerable = false;
      boss.setVelocity(0, 0);
      if (boss.stepCount > 10 && Math.round(boss.stepCount) % 5 == 0) {
        const playerAngle = Phaser.Math.Angle.BetweenPoints(boss, boss.ai.target);
        boss.ai.bullets = FIRE_ANGLES.map((angle) => angle + playerAngle + boss.ai.firingAngle).map(
          (angle) => bullets.spawnAtAngle(boss, angle, "standard")
        );
        boss.ai.firingAngle += Math.PI * (0.01 * (1 + boss.ai.phase));
      }
      if (boss.stepCount > 20 + 5 * boss.ai.phase) {
        boss.stepCount = 0;
        Ai.changeState(boss, "wait");
      }
      if (boss.getHealthAsPercent() < 0.66 && boss.ai.phase < 1) {
        boss.ai.phase = 1;
        console.log(`new boss phase: ${boss.ai.phase}`);
        Ai.changeState(boss, "charge-center");
      } else if (boss.getHealthAsPercent() < 0.33 && boss.ai.phase < 2) {
        boss.ai.phase = 2;
        console.log(`new boss phase: ${boss.ai.phase}`);
        Ai.changeState(boss, "charge-center");
      }
      break;
    }
    case "fire-02": {
      boss.invulnerable = false;
      boss.setVelocity(0, 0);
      if (boss.stepCount > 2) {
        if (Math.round(boss.stepCount) % 2 == 0) {
          bullets.spawnAtAngle(boss, boss.ai.firingAngle, "standard");
        }
        boss.ai.firingAngle += Math.PI * 0.01;
      }
      if (boss.stepCount > 20) {
        Ai.changeState(boss, "prep-charge");
      }
      break;
    }
    case "charge-center": {
      boss.invulnerable = true;
      const { widthInPixels, heightInPixels } = map.tilemap;
      if (!boss.ai.animation) {
        boss.ai.target = {
          x: widthInPixels / 2,
          y: heightInPixels / 2,
        };
        // console.log(`boss target: ${boss.ai.target.x}, ${boss.ai.target.y}`);
        boss.ai.animation = true;
      }
      chargeAndChangeState(boss, "fire-02");
      break;
    }
  }
}

function chargeAndChangeState(boss, newState) {
  // console.log(`dist: ${Phaser.Math.Distance.BetweenPoints(boss, boss.ai.target)}`);
  if (Phaser.Math.Distance.BetweenPoints(boss, boss.ai.target) < TARGET_DELTA) {
    boss.setVelocity(0, 0);
    boss.ai.firingAngle = 0;
    Ai.changeState(boss, newState);
  } else {
    const angle = Phaser.Math.Angle.BetweenPoints(boss, boss.ai.target);
    const velocityX = boss.walkspeed * Math.cos(angle) * (1 + 0.5 * boss.ai.phase);
    const velocityY = boss.walkspeed * Math.sin(angle) * (1 + 0.5 * boss.ai.phase);

    boss.setVelocity(velocityX, velocityY);
    boss.direction = Direction.directionFromAngle(angle);
  }
}

export default {
  collideWithPlayer,
  collideWithMap,
  collideWithCharacter,
  stateMachine,
};
