let maze;
let tileSize = 25;
let player;
let walls = [];
let startX, startY;
let startRotation = 0;

function preload() {
  maze = loadStrings('maze.txt');
}

function setup() {
  createCanvas(maze[0].length * tileSize, maze.length * tileSize);
  loadMaze();
  player = createSprite(startX, startY, tileSize / 2, tileSize / 2);
  player.shapeColor = color(255, 0, 0);
  player.rotation = startRotation;
}

function draw() {
  background(220);
  drawSprites();
  handleInput(); //handle player movement
  checkGoal();
}

function loadMaze() {
  for (let y = 0; y < maze.length; y++) {
    for (let x = 0; x < maze[y].length; x++) {
      let tile = maze[y][x]; //get the tile type ('1', '2', '3', or '0')
      let posX = x * tileSize + tileSize / 2; 
      let posY = y * tileSize + tileSize / 2;

      if (tile === '1') { //create wall sprite for '1'
        let wall = createSprite(posX, posY, tileSize, tileSize);
        wall.shapeColor = color(0);
        walls[walls.length] = wall;
      } else if (tile === '2') { //create starting position for the player
        startX = posX;
        startY = posY;
      } else if (tile === '3') { //create goal sprite for '3'
        goal = createSprite(posX, posY, tileSize / 2, tileSize / 2);
        goal.shapeColor = color(0, 255, 0);
      }
    }
  }
}

function handleInput() {
    let moveX = 0;
    let moveY = 0;
    let speed = 2;
  
    if (keyIsDown(LEFT_ARROW)) {
      moveX = -speed;
      player.rotation = 270;
    } else if (keyIsDown(RIGHT_ARROW)) {
      moveX = speed;
      player.rotation = 90;
    }
  
    if (keyIsDown(UP_ARROW)) {
      moveY = -speed;
      player.rotation = 0;
    } else if (keyIsDown(DOWN_ARROW)) {
      moveY = speed;
      player.rotation = 180;
    }
  
    //save old position before moving
    let oldX = player.position.x;
    let oldY = player.position.y;
  
    //move player
    player.position.x += moveX;
    player.position.y += moveY;
  
    //if collided, bounce back slightly
    for (let i = 0; i < walls.length; i++) {
        if (player.overlap(walls[i])) {
            player.position.x = oldX - moveX / 2;
            player.position.y = oldY - moveY / 2;
            break; //no need to check other walls
        }
    }
}

function checkGoal() {
    let col = floor(player.position.x / tileSize); //convert player position to maze grid column and row
    let row = floor(player.position.y / tileSize); 
    if (maze[row][col] === '3') {
      player.position.x = startX; //reset player to start position
      player.position.y = startY;
      player.rotation = startRotation; //reset player’s rotation (facing direction)
    }
}