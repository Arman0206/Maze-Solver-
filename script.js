const rows = 20;
const cols = 20;
const grid = document.getElementById("grid");

let cells = [];
let start = null;
let end = null;
let mode = "wall";

// Grid creation
for (let r = 0; r < rows; r++) {
  cells[r] = [];
  for (let c = 0; c < cols; c++) {
    const div = document.createElement("div");
    div.className = "cell";
    div.dataset.row = r;
    div.dataset.col = c;
    div.onclick = () => handleClick(r, c);
    grid.appendChild(div);
    cells[r][c] = div;
  }
}

function setMode(m) {
  mode = m;
}

function handleClick(r, c) {
  const cell = cells[r][c];

  if (mode === "start") {
    if (start) start.classList.remove("start");
    start = cell;
    cell.classList.add("start");
  }
  else if (mode === "end") {
    if (end) end.classList.remove("end");
    end = cell;
    cell.classList.add("end");
  }
  else {
    if (!cell.classList.contains("start") && !cell.classList.contains("end")) {
      cell.classList.toggle("wall");
    }
  }
}

function solve() {
  clearPath();
  const algo = document.getElementById("algorithm").value;
  algo === "bfs" ? bfs() : dijkstra();
}

// BFS
async function bfs() {
  let queue = [start];
  let visited = new Set([start]);
  let parent = new Map();

  while (queue.length) {
    let curr = queue.shift();
    if (curr === end) break;

    for (let nb of getNeighbors(curr)) {
      if (!visited.has(nb) && !nb.classList.contains("wall")) {
        visited.add(nb);
        parent.set(nb, curr);
        queue.push(nb);
        if (nb !== end) nb.classList.add("visited");
        await sleep(20);
      }
    }
  }
  drawPath(parent);
}

// Dijkstra
async function dijkstra() {
  let dist = new Map();
  let parent = new Map();
  let pq = [];

  for (let row of cells)
    for (let cell of row)
      dist.set(cell, Infinity);

  dist.set(start, 0);
  pq.push(start);

  while (pq.length) {
    pq.sort((a, b) => dist.get(a) - dist.get(b));
    let curr = pq.shift();
    if (curr === end) break;

    for (let nb of getNeighbors(curr)) {
      if (nb.classList.contains("wall")) continue;
      let newDist = dist.get(curr) + 1;

      if (newDist < dist.get(nb)) {
        dist.set(nb, newDist);
        parent.set(nb, curr);
        pq.push(nb);
        if (nb !== end) nb.classList.add("visited");
        await sleep(20);
      }
    }
  }
  drawPath(parent);
}

// Helpers
function getNeighbors(cell) {
  const r = +cell.dataset.row;
  const c = +cell.dataset.col;
  const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
  return dirs
    .map(([dr, dc]) => [r + dr, c + dc])
    .filter(([nr, nc]) => nr >= 0 && nr < rows && nc >= 0 && nc < cols)
    .map(([nr, nc]) => cells[nr][nc]);
}

async function drawPath(parent) {
  let cur = end;
  while (parent.has(cur)) {
    cur = parent.get(cur);
    if (cur !== start) {
      cur.classList.add("path");
      await sleep(30);
    }
  }
}

function clearPath() {
  for (let row of cells)
    for (let cell of row)
      cell.classList.remove("visited", "path");
}

function resetGrid() {
  for (let row of cells)
    for (let cell of row)
      cell.className = "cell";
  start = end = null;
}

const sleep = ms => new Promise(res => setTimeout(res, ms));
