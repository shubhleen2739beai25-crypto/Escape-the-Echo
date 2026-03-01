const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let gameState = "start"; // start | playing | win
let player, score, orbs, exitGate, traps=[];
let startTime;

const scoreDisplay = document.getElementById("score");
const timerDisplay = document.getElementById("timer");

let keys = {};

document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

function initGame() {
    gameState = "playing";

    player = { x: 50, y: 50, size: 20, speed: 3 };

    score = 0;
    scoreDisplay.textContent = score;

    orbs = [
        {x:100,y:100},
        {x:500,y:80},
        {x:300,y:200},
        {x:150,y:300},
        {x:450,y:350}
    ];

    exitGate = { x: 550, y: 350, size: 30, unlocked: false };

    traps = [
        { x: 200, y: 150, size: 20, dx: 2, dy: 0 },
        { x: 400, y: 50, size: 20, dx: 0, dy: 2 },
        { x: 300, y: 250, size: 20, dx: 2, dy: 2 }
    ];

    startTime = Date.now();
}

function update() {
    if (gameState !== "playing") return;

    let currentTime = Math.floor((Date.now() - startTime) / 1000);
    timerDisplay.textContent = currentTime;

    if (keys["ArrowUp"]) player.y -= player.speed;
    if (keys["ArrowDown"]) player.y += player.speed;
    if (keys["ArrowLeft"]) player.x -= player.speed;
    if (keys["ArrowRight"]) player.x += player.speed;

    player.x = Math.max(0, Math.min(canvas.width - player.size, player.x));
    player.y = Math.max(0, Math.min(canvas.height - player.size, player.y));

    traps.forEach(trap => {
        trap.x += trap.dx;
        trap.y += trap.dy;

        if (trap.x <= 0 || trap.x + trap.size >= canvas.width) trap.dx *= -1;
        if (trap.y <= 0 || trap.y + trap.size >= canvas.height) trap.dy *= -1;

        if (
            player.x < trap.x + trap.size &&
            player.x + player.size > trap.x &&
            player.y < trap.y + trap.size &&
            player.y + player.size > trap.y
        ) {
            player.x = 50;
            player.y = 50;
        }
    });

    orbs = orbs.filter(orb => {
        if (
            player.x < orb.x + 10 &&
            player.x + player.size > orb.x - 10 &&
            player.y < orb.y + 10 &&
            player.y + player.size > orb.y - 10
        ) {
            score++;
            scoreDisplay.textContent = score;
            if (score >= 5) exitGate.unlocked = true;
            return false;
        }
        return true;
    });

    if (
        exitGate.unlocked &&
        player.x < exitGate.x + exitGate.size &&
        player.x + player.size > exitGate.x &&
        player.y < exitGate.y + exitGate.size &&
        player.y + player.size > exitGate.y
    ) {
        gameState = "win";
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameState === "start") {
        ctx.fillStyle = "white";
        ctx.font = "28px Arial";
        ctx.fillText("Escape The Echo", 190, 150);
        ctx.font = "18px Arial";
        ctx.fillText("Press SPACE to Start", 210, 200);
        return;
    }

    ctx.fillStyle = "#3b82f6";
    ctx.fillRect(player.x, player.y, player.size, player.size);

    orbs.forEach(orb => {
        ctx.shadowBlur = 15;
        ctx.shadowColor = "#22d3ee";
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = "#22d3ee";
        ctx.fill();
        ctx.shadowBlur = 0;
    });

    traps.forEach(trap => {
        ctx.fillStyle = "#f97316";
        ctx.fillRect(trap.x, trap.y, trap.size, trap.size);
    });

    ctx.fillStyle = exitGate.unlocked ? "#10b981" : "#ef4444";
    ctx.fillRect(exitGate.x, exitGate.y, exitGate.size, exitGate.size);

    if (gameState === "win") {
        ctx.fillStyle = "rgba(0,0,0,0.85)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        let finalTime = Math.floor((Date.now() - startTime) / 1000);
        let scorePercent = Math.max(100 - finalTime, 10);

        ctx.fillStyle = "white";
        ctx.font = "24px Arial";
        ctx.fillText("🎉 You Escaped!", 220, 150);
        ctx.font = "18px Arial";
        ctx.fillText("Time: " + finalTime + "s", 260, 190);
        ctx.fillText("Open Mind Score: " + scorePercent + "%", 200, 220);
        ctx.fillText("Click to Play Again", 220, 260);
    }
}

document.addEventListener("keydown", e => {
    if (gameState === "start" && e.code === "Space") {
        initGame();
    }
});

canvas.addEventListener("click", function() {
    if (gameState === "win") {
        gameState = "start";
    }
});

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();