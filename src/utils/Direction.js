function directionFromPositions(from, to) {
  if (Math.abs(from.x - to.x) >= Math.abs(from.y - to.y)) {
    return from.x - to.x >= 0 ? "left" : "right";
  } else {
    return from.y - to.y >= 0 ? "up" : "down";
  }
}

function directionFromAngle(angle) {
  const x = Math.cos(angle);
  const y = Math.sin(angle);
  if (Math.abs(x) >= Math.abs(y)) {
    return x > 0 ? "right" : "left";
  } else {
    return y > 0 ? "down" : "up";
  }
}

function facingBack(from, to) {
  return from === to;
}

function facingSide(from, to) {
  return (
    ((from === "up" || from === "down") && (to === "left" || to === "right")) ||
    ((from === "left" || from === "right") && (to === "up" || to === "down"))
  );
}

function facingFront(from, to) {
  return (
    (from === "up" && to === "down") ||
    (from === "down" && to === "up") ||
    (from === "left" && to === "right") ||
    (from === "right" && to === "left")
  );
}

function relativeDirectionFromFacings(from, to) {
  if (facingBack(from, to)) {
    return "back";
  }
  if (facingSide(from, to)) {
    return "side";
  }
  return "front";
}

function opposite(direction) {
  if (direction === "up") {
    return "down";
  }
  if (direction === "down") {
    return "up";
  }
  if (direction === "left") {
    return "right";
  }
  if (direction === "right") {
    return "left";
  }
}

function percentOverlapFromPositions(from, to) {
  let percent;
  const direction = directionFromPositions(from, to);
  switch (direction) {
    case "up":
    case "down": {
      const offset = Math.abs(from.x - to.x);
      percent = 100 - Math.round(100 * (offset / from.width));
      // console.log(`percent: ${percent}`);
      break;
    }
    case "left":
    case "right": {
      const offset = Math.abs(from.y - to.y);
      percent = 100 - Math.round(100 * (offset / from.height));
      // console.log(`percent: ${percent}`);
      break;
    }
  }
  return percent;
}

export default {
  directionFromPositions,
  directionFromAngle,
  facingBack,
  facingSide,
  facingFront,
  relativeDirectionFromFacings,
  opposite,
  percentOverlapFromPositions,
};
