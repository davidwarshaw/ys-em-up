# Development Guide

## NPCs

Villager 1

- Gives dialog, static
- 1 frame sprite: 1 frame idle, down direction

Villager 2

- Gives dialog, static
- 1 frame sprite: 1 frame idle, down direction

## Enemies

Rambler

- Walks in one direction
- Turn in the direction of the player periodically
- Randomize direction on terrain hit
- Encountered in the forest area and the early parts of the dungeon
- Medium strength
- Character sprite

Turret

- Turrent, static
- Fires Bullet Type 1 periodically
- Encountered only inside the dungeon
- Invulnerable
- 2 frame sprite: 1 frame idle, 1 frame anticipation of firing bullet

Flyer

- Moves from outside the map to outside the map in a curve
- Flying, i.e. no collision with map, floor hazards, other enemies
- Encountered only inside the dungeon
- Low strength
- 3 frame sprite: 1 frame idle, 2 frames wings flapping, no directions

Charger

- Vibrates, then charges towards player periodically
- Encountered only inside the dungeon, mostly in the deeper parts
- High strength
- 3 frame sprite: 1 frame idle, 1 frame prepping charge, 1 frame charging, no directions

Boss - Big Charger

- Vibrates, then charges towards player periodically
- After charge, fires Bullet pattern
- 3 phases or increasingly faster charges / more bullets
- Encountered only in the boss room of the dungeon
- Very high strength
- Boss Sprite

## Bullets

Bullet

- Medium speed
- Medium strength

## Items

Dash Item

- Allows player to dash over gaps
- Player is invulnerable to enemy attacks while dashing, but not bullets
- 1 16x16px tile representing the item on the map and in the HUD as player inventory
- 1+ frame sprite, 16x16px animated overlay on player and enemies while dashing, no directions

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
  - No directions
  - 2 frames of move,
  - 2 frames of impact/explode
  - [Example](assets/images/bullets-spritesheet.png)

Boss Sprite

- 32x32px
- Animation Frames
  - No Directions
  - 1 frame idle
  - 1 frame prepping charge
  - 1 frame charging
  - 1 frame firing bullets
