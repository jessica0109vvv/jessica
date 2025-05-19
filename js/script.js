class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        this.score = 0;
        this.isGameOver = false;
        this.isPlaying = false;

        // 載入圖像
        this.dinoImage = document.getElementById('dinoSprite');
        this.cactusImage = document.getElementById('cactusSprite');

        // 恐龍相關設定
        this.dino = {
            x: 50,
            y: this.canvas.height - 60,
            width: 44,
            height: 47,
            jumping: false,
            velocity: 0,
            frameX: 0,  // 用於動畫
            frameTimer: 0
        };

        // 障礙物設定
        this.obstacles = [];
        this.obstacleTimer = 0;

        // 事件監聽
        window.addEventListener('resize', () => this.resizeCanvas());
        window.addEventListener('keydown', (e) => this.handleInput(e));
        document.getElementById('startButton').addEventListener('click', () => this.startGame());

        // 初始畫面
        this.drawInitialScreen();
    }

    resizeCanvas() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = 300;
        this.dino.y = this.canvas.height - 60;
    }

    startGame() {
        if (this.isPlaying) return;
        this.isPlaying = true;
        this.isGameOver = false;
        this.score = 0;
        this.obstacles = [];
        this.updateScore();
        this.gameLoop();
    }

    handleInput(e) {
        if ((e.code === 'Space' || e.code === 'ArrowUp') && !this.dino.jumping && this.isPlaying) {
            this.dino.jumping = true;
            this.dino.velocity = -15;
        }

        if (e.code === 'Space' && this.isGameOver) {
            this.startGame();
        }
    }

    updateScore() {
        document.getElementById('scoreText').textContent = this.score;
    }

    update() {
        if (!this.isPlaying) return;

        // 更新恐龍位置和動畫
        if (this.dino.jumping) {
            this.dino.y += this.dino.velocity;
            this.dino.velocity += 0.8;

            if (this.dino.y >= this.canvas.height - 60) {
                this.dino.y = this.canvas.height - 60;
                this.dino.jumping = false;
                this.dino.velocity = 0;
            }
        } else {
            // 跑步動畫
            this.dino.frameTimer++;
            if (this.dino.frameTimer > 5) {
                this.dino.frameX = (this.dino.frameX + 1) % 2;
                this.dino.frameTimer = 0;
            }
        }

        // 生成障礙物
        this.obstacleTimer++;
        if (this.obstacleTimer > 60) {
            if (Math.random() < 0.02) {
                this.obstacles.push({
                    x: this.canvas.width,
                    width: 25,
                    height: 50
                });
                this.obstacleTimer = 0;
            }
        }

        // 更新障礙物位置
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            this.obstacles[i].x -= 5;
            
            // 碰撞檢測
            if (this.checkCollision(this.dino, this.obstacles[i])) {
                this.gameOver();
                return;
            }

            // 移除超出畫面的障礙物
            if (this.obstacles[i].x + this.obstacles[i].width < 0) {
                this.obstacles.splice(i, 1);
                this.score++;
                this.updateScore();
            }
        }
    }

    checkCollision(dino, obstacle) {
        // 縮小碰撞箱以使遊戲更友好
        const margin = 10;
        return !(dino.x + margin + dino.width - margin * 2 < obstacle.x || 
                dino.x + margin > obstacle.x + obstacle.width - margin || 
                dino.y + margin + dino.height - margin * 2 < this.canvas.height - obstacle.height - 20 || 
                dino.y + margin > this.canvas.height - 20);
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 繪製地面
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(0, this.canvas.height - 20, this.canvas.width, 2);

        // 繪製恐龍
        this.ctx.drawImage(
            this.dinoImage,
            this.dino.frameX * 44, // 源圖像 x 座標
            0,                     // 源圖像 y 座標
            44,                    // 源圖像寬度
            47,                    // 源圖像高度
            this.dino.x,          // 目標 x 座標
            this.dino.y,          // 目標 y 座標
            this.dino.width,      // 目標寬度
            this.dino.height      // 目標高度
        );

        // 繪製障礙物（仙人掌）
        this.obstacles.forEach(obstacle => {
            this.ctx.drawImage(
                this.cactusImage,
                obstacle.x,
                this.canvas.height - obstacle.height - 20,
                obstacle.width,
                obstacle.height
            );
        });

        if (this.isGameOver) {
            this.ctx.fillStyle = '#000';
            this.ctx.font = '30px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('遊戲結束！按空白鍵重新開始', this.canvas.width / 2, this.canvas.height / 2);
        }
    }

    drawInitialScreen() {
        this.ctx.fillStyle = '#000';
        this.ctx.font = '24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('按開始遊戲按鈕或空白鍵開始', this.canvas.width / 2, this.canvas.height / 2);

        // 繪製初始恐龍
        this.ctx.drawImage(
            this.dinoImage,
            0, 0, 44, 47,
            this.dino.x, this.dino.y,
            this.dino.width, this.dino.height
        );
    }

    gameOver() {
        this.isPlaying = false;
        this.isGameOver = true;
        this.draw();
    }

    gameLoop() {
        if (!this.isPlaying) return;
        
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// 初始化遊戲
const game = new Game();