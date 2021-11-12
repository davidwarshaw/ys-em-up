# Development Guide

## Enemies

Enemy Type 1

- Walks in one direction
- Turn in the direction of the player periodically
- Randomize direction on terrain hit
- Medium strength
- Character sprite

Enemy Type 2

- Turrent, static
- Fires Bullet Type 1 periodically
- Invulnerable
- 2 frame sprite: 1 frame idle, 1 frame anticipation of firing bullet

Enemy Type 3

- Vibrates, then charges towards player periodically
- High strength
- Character sprite?

Enemy Type 4

- Swoops down at player ?
- Low strength
- 3 frame sprite: 1 frame idle, 2 frames wings flapping, no directions

Boss

- Vibrates, then charges towards player periodically
- After charge, fires Bullet Type 1 pattern
- 3 phases or increasingly faster charges / more bullets
- Very high strength
- Boss sprite

## Bullets

Bullet Type 1

- Medium speed
- Medium strength

## Assets

### Maps:

Tiled maps

- 16x16px tiles
- One "screen", not including HUD, is 20x11 tiles (320x176px)

### Sprites

Character Sprites

- 16x16px
- Animation Frames
  - 1 frame of idle, directions down, up, and right
  - 2 frames of walk, directions down, up, and right
  - [Example](assets/images/characters-spritesheet.png)

Bullet Sprites

- 8x8px
- Animation Frames
  - 2 frames of move, no directions
  - 2 frames of impact/explode, no directions
  - [Example](assets/images/bullets-spritesheet.png)

Boss Sprite

- 32x32px
- Animation Frames
  - ?
