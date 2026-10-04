/**
 * levelManager.js
 * Keeps the level data separate from the update loop so you can add more
 * stages without rewriting the engine.
 */
import { Platform } from './platform.js';
import { Fruit, Cherry } from './collectible.js';
import { Enemy } from './enemy.js';
import { PowerUp } from './powerup.js';
import { Boss } from './boss.js';

export class LevelManager {
  constructor() {
    this.levels = [
      {
        id: 1,
        scoreGoal: 5,
        platforms: [
          new Platform(0, 680, 720, 40),
          new Platform(430, 600, 120, 20, '1'),
          new Platform(520, 520, 120, 20, '2'),
          new Platform(600, 440, 110, 20, '3'),
          new Platform(340, 500, 110, 20, '4'),
          new Platform(210, 560, 110, 20, '5')
        ],
        playerStart: { x: 60, y: 638 },
        fruit: new Fruit(650, 400, 5),
        enemies: [
          new Enemy(120, 656, 80, 250, 1.0)
        ]
      },
      {
        id: 2,
        scoreGoal: 5,
        platforms: [
          new Platform(0, 680, 720, 40),
          new Platform(145, 610, 120, 20),
          new Platform(260, 560, 120, 20),
          new Platform(420, 500, 130, 20),
          new Platform(560, 430, 120, 20),
          new Platform(310, 430, 110, 20),
          new Platform(180, 340, 110, 20)
        ],
        playerStart: { x: 40, y: 638 },
        fruit: new Fruit(610, 390, 5),
        enemies: [
          new Enemy(170, 656, 90, 220, 1.2),
          new Enemy(500, 470, 470, 640, 1.1)
        ]
      },
      {
        id: 3,
        scoreGoal: 5,
        platforms: [
          new Platform(0, 680, 720, 40),
          new Platform(140, 620, 120, 20),
          new Platform(250, 560, 120, 20),
          new Platform(410, 500, 110, 20),
          new Platform(540, 430, 110, 20),
          new Platform(390, 350, 110, 20),
          new Platform(220, 280, 110, 20),
          new Platform(120, 210, 90, 20)
        ],
        playerStart: { x: 40, y: 638 },
        fruit: new Fruit(600, 390, 5),
        enemies: [
          new Enemy(160, 656, 90, 220, 1.4),
          new Enemy(470, 450, 420, 600, 1.3),
          new Enemy(260, 256, 220, 315, 1.0)
        ]
      },
      {
        id: 4,
        scoreGoal: 10,
        platforms: [
          new Platform(0, 680, 720, 40),
          new Platform(100, 610, 120, 20),
          new Platform(270, 540, 120, 20),
          new Platform(430, 470, 120, 20),
          new Platform(550, 390, 120, 20),
          new Platform(360, 320, 120, 20),
          new Platform(170, 260, 120, 20)
        ],
        playerStart: { x: 40, y: 638 },
        fruits: [
          new Fruit(600, 360, 5),
          new Fruit(220, 230, 5)
        ],
        enemies: [
          new Enemy(150, 656, 100, 260, 1.2),
          new Enemy(315, 516, 280, 370, 1.1),
          new Enemy(475, 446, 440, 530, 1.2),
          new Enemy(400, 296, 370, 470, 1.0)
        ]
      },
      {
        id: 5,
        scoreGoal: 15,
        platforms: [
          new Platform(0, 680, 720, 40, '', 'ruins'),
          new Platform(80, 620, 150, 18, '', 'ruins'),
          new Platform(260, 560, 140, 18, '', 'ruins'),
          new Platform(450, 500, 150, 18, '', 'ruins'),
          new Platform(600, 430, 100, 18, '', 'ruins'),
          new Platform(470, 350, 140, 18, '', 'ruins'),
          new Platform(250, 290, 140, 18, '', 'ruins'),
          new Platform(120, 220, 120, 18, '', 'ruins'),
          new Platform(520, 150, 120, 18, '', 'ruins')
        ],
        playerStart: { x: 40, y: 638 },
        fruits: [
          new Fruit(330, 530, 5),
          new Fruit(650, 400, 5),
          new Fruit(570, 120, 5)
        ],
        enemies: [
          new Enemy(120, 656, 80, 220, 1.1),
          new Enemy(320, 470, 260, 420, 0.9),
          new Enemy(540, 390, 520, 610, 0.95),
          new Enemy(400, 320, 350, 500, 0.85)
        ]
      },
      {
        id: 6,
        scoreGoal: 15,
        platforms: [
          new Platform(0, 680, 720, 40, '', 'ruins'),
          new Platform(80, 610, 130, 18, '', 'ruins'),
          new Platform(220, 535, 120, 18, '', 'ruins', {
            axis: 'x',
            min: 200,
            max: 390,
            speed: 1.2
          }),
          new Platform(430, 465, 130, 18, '', 'ruins'),
          new Platform(480, 370, 110, 18, '', 'ruins', {
            axis: 'y',
            min: 335,
            max: 410,
            speed: 1.5
          }),
          new Platform(300, 305, 120, 18, '', 'ruins'),
          new Platform(520, 220, 120, 18, '', 'ruins'),
          new Platform(180, 220, 110, 18, '', 'ruins')
        ],
        playerStart: { x: 40, y: 638 },
        fruits: [
          new Fruit(570, 190, 5),
          new Cherry(230, 190, 10)
        ],
        enemies: [
          new Enemy(120, 656, 80, 220, 1.2),
          new Enemy(460, 435, 440, 540, 1.1),
          new Enemy(330, 275, 305, 400, 1.0)
        ]
      },
      {
        id: 7,
        scoreGoal: 25,
        platforms: [
          new Platform(0, 680, 720, 40, '', 'ruins'),
          new Platform(70, 610, 100, 18, '', 'ruins'),
          new Platform(255, 525, 90, 18, '', 'ruins', {
            axis: 'x',
            min: 180,
            max: 330,
            speed: 2.8
          }),
          new Platform(360, 455, 95, 18, '', 'ruins'),
          new Platform(485, 380, 90, 18, '', 'ruins', {
            axis: 'y',
            min: 335,
            max: 425,
            speed: 2.6
          }),
          new Platform(365, 290, 85, 18, '', 'ruins'),
          new Platform(255, 220, 85, 18, '', 'ruins', {
            axis: 'x',
            min: 160,
            max: 350,
            speed: 3.0
          }),
          new Platform(480, 150, 90, 18, '', 'ruins'),
          new Platform(330, 90, 80, 18, '', 'ruins')
        ],
        playerStart: { x: 40, y: 638 },
        fruits: [
          new Fruit(120, 580, 5),
          new Fruit(400, 425, 5),
          new Fruit(400, 260, 5),
          new Fruit(520, 115, 5),
          new Cherry(370, 55, 10)
        ],
        enemies: [
          new Enemy(390, 413, 365, 420, 1.4)
        ]
      },
      {
        id: 8,
        scoreGoal: 25,
        platforms: [
          new Platform(0, 680, 720, 40, '', 'ruins'),
          new Platform(110, 610, 120, 18, '', 'ruins'),
          new Platform(260, 540, 135, 18, '', 'ruins'),
          new Platform(430, 470, 120, 18, '', 'ruins'),
          new Platform(560, 400, 110, 18, '', 'ruins'),
          new Platform(350, 320, 120, 18, '', 'ruins'),
          new Platform(180, 250, 110, 18, '', 'ruins'),
          new Platform(430, 180, 110, 18, '', 'ruins'),
          new Platform(570, 110, 110, 18, '', 'ruins')
        ],
        playerStart: { x: 40, y: 638 },
        fruits: [
          new Fruit(610, 80, 5),
          new Cherry(220, 215, 10),
          new Fruit(400, 285, 5)
        ],
        powerUps: [
          new PowerUp(470, 145, 'doubleJump'),
          new PowerUp(260, 205, 'shield'),
          new PowerUp(600, 360, 'speedBoost')
        ],
        enemies: [
          new Enemy(150, 656, 90, 240, 1.2),
          new Enemy(500, 440, 470, 580, 1.1),
          new Enemy(360, 290, 330, 420, 0.9)
        ]
      },
      {
        id: 9,
        scoreGoal: 35,
        title: 'The Crumbling Orchard',
        platforms: [
          new Platform(0, 680, 720, 40, '', 'ruins'),
          new Platform(80, 610, 120, 18, '', 'ruins'),
          new Platform(245, 540, 120, 18, '', 'ruins'),
          new Platform(430, 470, 120, 18, '', 'ruins'),
          new Platform(545, 385, 110, 18, '', 'ruins'),
          new Platform(355, 315, 125, 18, '', 'ruins', {
            axis: 'x',
            min: 240,
            max: 540,
            speed: 1.8
          }),
          new Platform(180, 250, 110, 18, '', 'ruins'),
          new Platform(430, 180, 110, 18, '', 'ruins'),
          new Platform(560, 120, 120, 18, '', 'ruins'),
          new Platform(610, 220, 70, 18, 'S', 'ruins', null, 'spring'),
          new Platform(350, 430, 70, 18, 'C', 'ruins', null, 'crumbling')
        ],
        playerStart: { x: 40, y: 638 },
        fruits: [
          new Fruit(120, 580, 5),
          new Cherry(300, 245, 10),
          new Fruit(470, 135, 5),
          new Fruit(610, 90, 5)
        ],
        powerUps: [
          new PowerUp(230, 220, 'shield'),
          new PowerUp(620, 350, 'speedBoost')
        ],
        enemies: [
          new Enemy(120, 656, 90, 220, 1.4),
          new Enemy(485, 440, 450, 600, 1.2),
          new Enemy(220, 228, 190, 300, 1.0),
          new Enemy(555, 95, 500, 680, 0.8, 'flying')
        ]
      },
      {
        id: 10,
        title: 'The Giant Pineapple / Rotten King',
        scoreGoal: 0,
        platforms: [
          new Platform(0, 680, 720, 40, '', 'ruins'),
          new Platform(80, 590, 560, 22, 'BOSS ARENA', 'ruins'),
          new Platform(90, 610, 140, 18, '', 'ruins'),
          new Platform(220, 560, 110, 18, '', 'ruins'),
          new Platform(360, 500, 110, 18, '', 'ruins'),
          new Platform(510, 440, 110, 18, '', 'ruins'),
          new Platform(610, 360, 85, 18, '', 'ruins'),
          new Platform(470, 300, 110, 18, '', 'ruins'),
          new Platform(310, 240, 110, 18, '', 'ruins'),
          new Platform(170, 180, 110, 18, '', 'ruins'),
          new Platform(410, 120, 100, 18, '', 'ruins')
        ],
        playerStart: { x: 40, y: 638 },
        fruits: [
          new Fruit(240, 530, 5),
          new Fruit(405, 470, 5),
          new Cherry(620, 325, 10),
          new Fruit(450, 270, 5),
          new Fruit(200, 150, 5)
        ],
        powerUps: [
          new PowerUp(170, 145, 'doubleJump'),
          new PowerUp(595, 320, 'shield'),
          new PowerUp(535, 165, 'speedBoost')
        ],
        boss: {
          x: 325,
          y: 528,
          patrolMin: 80,
          patrolMax: 710,
          speed: 1.5,
          health: 5,
          name: 'The Giant Pineapple / Rotten King'
        },
        enemies: [
          new Enemy(110, 656, 90, 220, 1.5),
          new Enemy(575, 410, 550, 660, 1.4)
        ]
      }
    ];
  }

  hasLevel(number) {
    return Number.isInteger(number) && number >= 1 && number <= this.levels.length;
  }

  getLevel(number) {
    return this.hasLevel(number) ? this.levels[number - 1] : null;
  }
}
