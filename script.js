const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
const GRID_SIZE = 30;
const ROWS = canvas.height / GRID_SIZE;
const COLS = canvas.width / GRID_SIZE;

const PASTEL_COLORS = [
    '#7a7ad8', '#4874bf', '#6fcb9f', '#ff7863', '#ffe28a', '#ffc663'
];

const SHAPES = [
    [[1, 1, 1, 1]], // I shape
    [[1, 1], [1, 1]], // O shape
    [[1, 1, 0], [0, 1, 1]], // Z shape
    [[0, 1, 1], [1, 1, 0]], // S shape
    [[0, 1, 0], [1, 1, 1]], // T shape
    [[1, 1, 1], [1, 0, 0]], // L shape
    [[1, 1, 1], [0, 0, 1]]  // J shape
];

const shapes = [
    [SHAPES[0], PASTEL_COLORS[0]],
    [SHAPES[1], PASTEL_COLORS[1]],
    [SHAPES[2], PASTEL_COLORS[2]],
    [SHAPES[3], PASTEL_COLORS[3]],
    [SHAPES[4], PASTEL_COLORS[4]],
    [SHAPES[5], PASTEL_COLORS[5]],
    [SHAPES[6], PASTEL_COLORS[6]]
];

let board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
let currentShape, currentShapeColor, currentX, currentY;
let score = 0;
let highscore = localStorage.getItem('tetrisHighscore') || 0;
let gameInterval;
const backgroundMusic = document.getElementById('background-music');

const startScreen = document.getElementById('start-screen');
const gameContainer = document.getElementById('game-container');
const gameOverScreen = document.getElementById('game-over');
const scoreValue = document.getElementById('score-value');
const finalScore = document.getElementById('final-score');
const highscoreValue = document.getElementById('highscore-value');
const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');

function drawBoard() {
    context.fillStyle = '#f5f5f5';
    context.fillRect(0, 0, canvas.width, canvas.height);

    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (board[row][col]) {
                context.fillStyle = board[row][col];
                context.fillRect(col * GRID_SIZE, row * GRID_SIZE, GRID_SIZE, GRID_SIZE);
                context.strokeStyle = '#262626';
                context.strokeRect(col * GRID_SIZE, row * GRID_SIZE, GRID_SIZE, GRID_SIZE);
            }
        }
    }
}

function drawShape(shape, x, y, color) {
    context.fillStyle = color;
    shape.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
            if (cell) {
                context.fillRect((x + colIndex) * GRID_SIZE, (y + rowIndex) * GRID_SIZE, GRID_SIZE, GRID_SIZE);
                context.strokeStyle = '#262626';
                context.strokeRect((x + colIndex) * GRID_SIZE, (y + rowIndex) * GRID_SIZE, GRID_SIZE, GRID_SIZE);
            }
        });
    });
}

function moveShape(dx, dy) {
    currentX += dx;
    currentY += dy;
    if (collides()) {
        currentX -= dx;
        currentY -= dy;
        if (dy > 0) {
            mergeShape();
            resetShape();
            if (collides()) {
                gameOver();
                return;
            }
        }
    }
}

function collides() {
    return currentShape.some((row, rowIndex) => {
        return row.some((cell, colIndex) => {
            if (cell) {
                const newX = currentX + colIndex;
                const newY = currentY + rowIndex;
                return newX < 0 || newX >= COLS || newY >= ROWS || (newY >= 0 && board[newY][newX]);
            }
            return false;
        });
    });
}

function mergeShape() {
    currentShape.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
            if (cell) {
                const newY = currentY + rowIndex;
                const newX = currentX + colIndex;
                if (newY >= 0 && newY < ROWS && newX >= 0 && newX < COLS) {
                    board[newY][newX] = currentShapeColor;
                }
            }
        });
    });
    checkForLines();
}

function checkForLines() {
    for (let row = ROWS - 1; row >= 0; row--) {
        if (board[row].every(cell => cell)) {
            board.splice(row, 1);
            board.unshift(Array(COLS).fill(0));
            score += 100;
            scoreValue.textContent = score;
        }
    }
}

function resetShape() {
    [currentShape, currentShapeColor] = shapes[Math.floor(Math.random() * shapes.length)];
    currentX = Math.floor(COLS / 2) - Math.floor(currentShape[0].length / 2);
    currentY = 0;
}

function draw() {
    drawBoard();
    drawShape(currentShape, currentX, currentY, currentShapeColor);
}

function gameLoop() {
    draw();
    moveShape(0, 1);
}

function startGame() {
    startScreen.style.display="none"
    gameContainer.classList.remove('hidden');
    resetShape();
    gameInterval = setInterval(gameLoop, 250); // Set game speed
    backgroundMusic.play(); // Start background music
}

function gameOver() {
    clearInterval(gameInterval);
    gameContainer.classList.add('hidden');
    gameOverScreen.classList.remove('hidden');
    finalScore.textContent = score;
    backgroundMusic.pause(); // Pause background music
    if (score > highscore) {
        highscore = score;
        highscoreValue.textContent = highscore;
        localStorage.setItem('tetrisHighscore', highscore);
    }
}

function restartGame() {
    score = 0;
    scoreValue.textContent = score;
    board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    gameOverScreen.classList.add('hidden');
    gameContainer.classList.remove('hidden');
    resetShape();
    gameInterval = setInterval(gameLoop, 500); // Reset game speed
    backgroundMusic.play(); // Restart background music
}

function rotateShape() {
    const rotatedShape = currentShape[0].map((_, i) =>
        currentShape.map(row => row[i]).reverse()
    );

    // Simpan bentuk dan posisi sementara
    const tempShape = currentShape;
    const tempX = currentX;
    const tempY = currentY;

    // Update bentuk
    currentShape = rotatedShape;

    // Cek apakah bentuk yang dirotasi menabrak
    if (collides()) {
        currentShape = tempShape;
        currentX = tempX;
        currentY = tempY;
    } else {
        // Sesuaikan posisi jika melebihi batas horizontal
        while (collides()) {
            currentX -= 1;
            if (!collides()) return;
            currentX += 2;
            if (!collides()) return;
            currentX -= 1;
        }
    }
}

startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', restartGame);

document.addEventListener('keydown', (e) => {
    if (!gameContainer.classList.contains('hidden')) {
        switch (e.code) {
            case 'ArrowLeft':
                moveShape(-1, 0);
                break;
            case 'ArrowRight':
                moveShape(1, 0);
                break;
            case 'ArrowDown':
                moveShape(0, 1);
                break;
            case 'ArrowUp':
                rotateShape();
                break;
        }
    }
});

// Mobile controls
document.getElementById('left').addEventListener('click', () => moveShape(-1, 0));
document.getElementById('right').addEventListener('click', () => moveShape(1, 0));
document.getElementById('down').addEventListener('click', () => moveShape(0, 1));
document.getElementById('rotate').addEventListener('click', () => rotateShape());

let popupPanduan = document.getElementById('popupPanduan')

function showPanduan() {
    popupPanduan.style.display="flex"
}

function hapusPopup() {
    popupPanduan.style.display='none'
}