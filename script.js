//preview: python -m http.server

let grid;
let cols;
let rows;
let resolution = 15; // Size of each cell
let hexMode = false;
let color = [0, 0, 0];
let hexInput = "";
let hexIteration = 0;
let timeAdvances = true
let speed = 4;

function setup() {
  createCanvas(windowWidth, windowHeight - 50);
  //note, rows are cols and cols are rows
  cols = Math.floor(width / resolution) - 3;
  rows = Math.floor(height / resolution);

  grid = make2DArray(rows, cols);
  randomizeGrid();
  console.log(grid);
}

function draw() {
  background(240); // Light gray background
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (grid[i][j]) {
        fill(color);
      } else {
        fill(255);
      }
      noStroke();
      square(j * resolution, i * resolution, resolution);
    }
  }
  if (frameCount % speed == 0 & timeAdvances) {
    advanceTime();
  }

  // 1. Draw the grid
  // 2. Compute next state (if not paused)

}

// --- INTERACTIVE CONTROLS ---

// 1. Click or Drag to Draw
function mousePressed() {
  toggleCell();
}

/*function mouseDragged() {
  toggleCell();
}
*/

function toggleCell() {
  let squareX = Math.floor(mouseX / resolution);
  let squareY = Math.floor(mouseY / resolution);
  if(((inRange(squareY, 0, grid.length))&&(inRange(squareX, 0, grid[1].length))) && !timeAdvances) {
    grid[squareY][squareX] = !grid[squareY][squareX];
  }
}

// 2. Keyboard Controls
function keyPressed() {
  if (key == 'ArrowRight') {
    speed--;
    if (speed < 0) {
      speed = 0;
    }
  }

  if (key == 'ArrowLeft') {
    speed++;
    if (speed > 30) {
      speed = 30;
    }
  }
  console.log(key);
  if (key == ' ') {
    timeAdvances = !timeAdvances;
  }
  if (key == "h") {
    hexMode = true;
    hexInput = "";
  }
  if (key == ".") {
    advanceTime();
  } 
  if (hexMode) {
    validValues = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
    if (validValues.includes(key)) {
      input = key.toUpperCase();
      hexInput = hexInput + input;
      if (hexInput.length == 2) {
        color[hexIteration] = unhex(hexInput);
        hexIteration++;
        hexInput = "";
        if (hexIteration == 3) {
          hexIteration = 0;
          hexMode = false;
        }
      }
    }
  } else if (key == 'c' && !timeAdvances) {
    grid = make2DArray(rows, cols);
  }
}

function advanceTime() {
  let newGrid = make2DArray(rows, cols);
  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      //if((y == 0 || y == rows) || (x == 0 || x == cols)) {}
      let cellNeighbors = countNeighbors(grid, x, y);
      let alive = grid[y][x] == 1;
      if (alive && cellNeighbors < 2) {
        newGrid[y][x] = 0;
      }
      if (alive && (cellNeighbors == 2 || cellNeighbors == 3)) {
        newGrid[y][x] = 1;
      }
      if (alive && cellNeighbors > 3) {
        newGrid[y][x] = 0;
      }
      if (!alive && cellNeighbors == 3) {
        newGrid[y][x] = 1;
      }
    }
  }
  grid = newGrid;
}

// --- HELPER FUNCTIONS ---

function make2DArray(cols, rows) {
  let arr = new Array(cols);
  for (let i = 0; i < arr.length; i++) {
    arr[i] = new Array(rows).fill(0);
  }
  return arr;
}

function randomizeGrid() {
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      grid[i][j] = floor(random(2));
    }
  }
}

function countNeighbors(grid, x, y) {
  //grid[y][x] = position

  colStart = x - 1;
  rowStart = y - 1
  runningCount = -grid[y][x];
  for (let p = 0; p < 9; p++) {
    getCol = colStart + (p % 3);
    getRow = rowStart + Math.floor(p / 3)
    if (((getRow < 0) || (getRow >= grid.length)) || ((getCol < 0) || (getCol >= grid[1].length))) {
      runningCount += 0;
    } else {
      runningCount += grid[getRow][getCol];
    }
  }
  return runningCount;
}

function inRange(value, lower, upper) {
  let greater = false;
  let lesser = false;
  if (value > lower) {
    greater = true;
  }
  if (value < upper) {
    lesser = true;
  }
  return lesser && greater;
}