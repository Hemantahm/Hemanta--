const serverUrl = 'https://your-websocket-service.onrender.com'; // Replace with your Render WebSocket URL
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const startButton = document.getElementById('startGame');

canvas.width = 800;
canvas.height = 600;

let gameRunning = false;
let score = 0;
let player = { x: canvas.width / 2, y: canvas.height - 30, size: 20 };
let bullets = [];
let enemies = [];
const enemySpeed = 2;

// WebSocket setup
const socket = new WebSocket(serverUrl);
socket.addEventListener('open', () => console.log('Connected to WebSocket server'));

// Send score to server
function sendScore() {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type: 'score', value: score }));
  }
}

// Draw player
function drawPlayer() {
  ctx.fillStyle = '#0ff';
  ctx.fillRect(player.x - player.size / 2, player.y - player.size / 2, player.size, player.size);
}

// Draw bullets
function drawBullets() {
  ctx.fillStyle = '#f00';
  bullets.forEach((bullet, index) => {
    ctx.fillRect(bullet.x - 2, bullet.y - 10, 4, 10);
    bullet.y -= 5;
    if (bullet.y < 0) bullets.splice(index, 1);
  });
}

// Draw enemies
function drawEnemies() {
  ctx.fillStyle = '#ff0';
  enemies.forEach((enemy, index) => {
    ctx.fillRect(enemy.x - 10, enemy.y - 10, 20, 20);
    enemy.y += enemySpeed;
    if (enemy.y > canvas.height) {
      enemies.splice(index, 1);
      score -= 10; // Penalty for letting enemies pass
    }
  });
}

// Collision detection
function detectCollisions() {
  bullets.forEach((bullet, bulletIndex) => {
    enemies.forEach((enemy, enemyIndex) => {
      if (
        bullet.x > enemy.x - 10 &&
        bullet.x < enemy.x + 10 &&
        bullet.y > enemy.y - 10 &&
        bullet.y < enemy.y + 10
      ) {
        bullets.splice(bulletIndex, 1);
        enemies.splice(enemyIndex, 1);
        score += 10;
        sendScore();
      }
    });
  });
}

// Game loop
function gameLoop() {
  if (!gameRunning) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPlayer();
  drawBullets();
  drawEnemies();
  detectCollisions();
  scoreDisplay.textContent = score;
  requestAnimationFrame(gameLoop);
}

// Spawn enemies
function spawnEnemy() {
  if (gameRunning) {
    enemies.push({ x: Math.random() * canvas.width, y: 0 });
    setTimeout(spawnEnemy, 2000);
  }
}

// Start game
startButton.addEventListener('click', () => {
  gameRunning = true;
  score = 0;
  bullets = [];
  enemies = [];
  spawnEnemy();
  gameLoop();
});

// Move player
document.addEventListener('mousemove', (event) => {
  const rect = canvas.getBoundingClientRect();
  player.x = event.clientX - rect.left;
});

// Shoot bullets
document.addEventListener('click', () => {
  if (gameRunning) {
    bullets.push({ x: player.x, y: player.y });
  }
});
