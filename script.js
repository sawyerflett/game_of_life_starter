//preview: python -m http.server

let rules = "B3/S23";
let grid;
let cols;
let rows;
let resolution = 10; // Size of each cell //cannot be more than 20
let hexMode = false;
let color = [0, 0, 0];
let hexInput = "";
let hexIteration = 0;
let timeAdvances = true
let speed = clamp(21-resolution, 2, 20);
let born = [];
let survives = [];

function setup() {
  if (!(rules[0] == "B" && rules.includes("/S"))) {
    rules = "B3/S23";
  }
  let survivesIndex = 1;
  while (rules[survivesIndex] != "S") {
    let validNumbers = "012345678";
    if (validNumbers.includes(rules[survivesIndex])) {
      born.push(rules[survivesIndex]);
    } else if (rules[survivesIndex] != "/") {
      survivesIndex = 0;
      rules = "B3/S23";
    }
    survivesIndex++;
  }
  while (survivesIndex < rules.length) {
    let validNumbers = "012345678";
    if (validNumbers.includes(rules[survivesIndex])) {
      survives.push(rules[survivesIndex]);
    }
    survivesIndex++;
  }
  console.log(born + ", " + survives);
  createCanvas(windowWidth-10, windowHeight - 20);
  //note, rows are cols and cols are rows
  console.log(width+", "+height);
  //1884, 801
  cols = Math.floor((width*0.98) / resolution) - 1;
  rows = Math.floor((height*0.925) / resolution)-1;

  grid = make2DArray(rows, cols);
  ageGrid = make2DArray(rows, cols);
  randomizeGrid();
}

function draw() {
  background(240); // Light gray background
  for (let i = 0; i < rows; i++) {
    let widthOffset = Math.round(0.005*width);
    let heightOffset = Math.round(0.075* height)
    for (let j = 0; j < cols; j++) {
      if (grid[i][j]) {
        colorMode(HSB);
        age = ageGrid[i][j];
        h = Math.abs(256 - (((age * 5) + 256) % 512));
        if (age > 10) {
          h = Math.abs(256 - ((age + 296) % 512));
        }
        fill(h, 100, 100);
      } else {
        colorMode(RGB);
        fill(255);
      }
      noStroke();
      square((j * resolution)+widthOffset, (i * resolution)+heightOffset, resolution);
    }
  }
  if (frameCount % speed == 0 & timeAdvances) {
    advanceTime();
  }

  // 1. Draw the grid
  // 2. Compute next state (if not paused)
  // BUTTONS


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
//(j * resolution)+(0.005*width), (i * resolution)+(0.075*height)
//x * res -> x/res
//x * res + (0.005*width)
//x -()

function toggleCell() {
  let squareX = Math.floor((mouseX-(0.005*width)) / resolution);
  let squareY = Math.floor((mouseY-(0.075*height)) / resolution);
  if (((inRange(squareY, 0, grid.length)) && (inRange(squareX, 0, grid[1].length))) && !timeAdvances) {
    grid[squareY][squareX] = !grid[squareY][squareX];
    ageGrid[squareY][squareX] = 0;
  }
}

// 2. Keyboard Controls
function keyPressed() {
  if (key == 'ArrowRight') {
    speed--;
    speed = clamp(speed,2,30);
  }

  if (key == 'ArrowLeft') {
    speed++;
    speed = clamp(speed,2,30);
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
      let neighbors = "" + cellNeighbors;
      if ((alive && survives.includes(neighbors)) || (!alive && born.includes(neighbors))) {
        newGrid[y][x] = 1;
      } else {
        newGrid[y][x] = 0;
      }
      if (grid[y][x] == newGrid[y][x]) {
        ageGrid[y][x]++;
      } else {
        ageGrid[y][x] = 0;
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

function clamp(value, lower, upper) {
  if(value < lower) {
    value = lower;
  }
  if(value > upper) {
    value = upper;
  }
  return value;
}

