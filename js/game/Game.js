/**
 * Main Game Controller for Eclipse Weaver
 */
class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.dpr = window.devicePixelRatio || 1;

        // Systems
        this.particleSystem = new ParticleSystem();
        this.sound = new SoundSynth();
        this.constellationMgr = new ConstellationManager(this.particleSystem, this.sound);
        this.levelMgr = new LevelManager();

        // Game State
        this.state = 'MENU'; // MENU, PLAYING, PAUSED, VICTORY, GAMEOVER
        this.mode = 'CAMPAIGN'; // CAMPAIGN, ENDLESS
        this.score = 0;
        this.multiplier = 1.0;
        this.supernovaEnergy = 0;
        this.maxSupernova = 100;
        this.echoCooldown = 0;
        this.echoMaxCooldown = 5.0; // Seconds

        // Entities
        this.player = null;
        this.echo = new TemporalEcho();
        this.nodes = [];
        this.corruptors = [];
        this.blackHoles = [];
        this.currentLevelConfig = null;

        // Background Starfield
        this.stars = [];
        this.initStarfield();

        // Inputs
        this.inputDir = new Vector2(0, 0);
        this.keys = {};
        this.touchStartPos = null;
        this.isTouchActive = false;

        // Time tracking
        this.lastTime = performance.now();

        this.resize();
        this.bindEvents();
    }

    initStarfield() {
        this.stars = [];
        for (let i = 0; i < 150; i++) {
            this.stars.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                size: Math.random() * 2 + 0.5,
                alpha: Math.random() * 0.8 + 0.2,
                speed: Math.random() * 15 + 5
            });
        }
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width * this.dpr;
        this.canvas.height = this.height * this.dpr;
        this.canvas.style.width = `${this.width}px`;
        this.canvas.style.height = `${this.height}px`;
        this.ctx.scale(this.dpr, this.dpr);
    }

    bindEvents() {
        window.addEventListener('resize', () => this.resize());

        // Keyboard
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (e.code === 'Space') this.triggerEcho();
            if (e.code === 'ShiftLeft' || e.code === 'KeyE') this.triggerSupernova();
            if (e.code === 'KeyP') this.togglePause();
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        // Touch & Mouse Pointer Controls
        this.canvas.addEventListener('pointerdown', (e) => {
            if (this.state !== 'PLAYING') return;
            this.isTouchActive = true;
            this.touchStartPos = new Vector2(e.clientX, e.clientY);
            this.player.tethering = true;
        });

        this.canvas.addEventListener('pointermove', (e) => {
            if (!this.isTouchActive || !this.touchStartPos) return;
            const currentPos = new Vector2(e.clientX, e.clientY);
            const delta = currentPos.clone().sub(this.touchStartPos);
            if (delta.lengthSq() > 10) {
                this.inputDir = delta.normalize();
            }
        });

        const endTouch = () => {
            this.isTouchActive = false;
            this.touchStartPos = null;
            this.inputDir.set(0, 0);
        };

        this.canvas.addEventListener('pointerup', endTouch);
        this.canvas.addEventListener('pointercancel', endTouch);
    }

    startCampaignLevel(levelIdx = 0) {
        this.mode = 'CAMPAIGN';
        const data = this.levelMgr.loadLevel(levelIdx, this.width, this.height);
        this.setupEntities(data);
    }

    startEndlessMode() {
        this.mode = 'ENDLESS';
        this.endlessWave = 1;
        const data = this.levelMgr.generateEndlessWave(this.endlessWave, this.width, this.height);
        this.setupEntities(data);
    }

    setupEntities(data) {
        this.currentLevelConfig = data.config;
        this.nodes = data.nodes;
        this.corruptors = data.corruptors;
        this.blackHoles = data.blackHoles;
        this.player = new AstraPlayer(data.startPos.x, data.startPos.y);
        this.player.tethering = true;
        this.echo = new TemporalEcho();
        
        this.score = 0;
        this.multiplier = 1.0;
        this.supernovaEnergy = 0;
        this.echoCooldown = 0;
        this.particleSystem.clear();

        this.state = 'PLAYING';
        this.updateHUD();
    }

    triggerEcho() {
        if (this.state !== 'PLAYING' || this.echoCooldown > 0) return;
        if (this.player.trail.length < 5) return;

        this.echo.startRecording(this.player.trail);
        this.echoCooldown = this.echoMaxCooldown;
        this.particleSystem.emitSparks(this.player.pos.x, this.player.pos.y, 25, '#ff0077');
        this.sound.playEchoSFX();
    }

    triggerSupernova() {
        if (this.state !== 'PLAYING' || this.supernovaEnergy < this.maxSupernova) return;

        this.supernovaEnergy = 0;
        this.particleSystem.emitSolarBurst(this.player.pos.x, this.player.pos.y, Math.max(this.width, this.height), '#ffd700');
        this.sound.playSupernovaSFX();

        // Clear all corruptors
        for (const c of this.corruptors) {
            c.alive = false;
            this.score += 250 * this.multiplier;
        }

        // Purify all nodes
        for (const n of this.nodes) {
            n.purified = true;
        }

        this.updateHUD();
    }

    togglePause() {
        if (this.state === 'PLAYING') {
            this.state = 'PAUSED';
            document.getElementById('pauseModal').classList.remove('hidden');
        } else if (this.state === 'PAUSED') {
            this.state = 'PLAYING';
            document.getElementById('pauseModal').classList.add('hidden');
        }
    }

    update(dt) {
        if (this.state !== 'PLAYING') return;

        // Process Keyboard Direction Inputs
        const kbDir = new Vector2(0, 0);
        if (this.keys['KeyW'] || this.keys['ArrowUp']) kbDir.y -= 1;
        if (this.keys['KeyS'] || this.keys['ArrowDown']) kbDir.y += 1;
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) kbDir.x -= 1;
        if (this.keys['KeyD'] || this.keys['ArrowRight']) kbDir.x += 1;

        if (kbDir.lengthSq() > 0) {
            this.inputDir = kbDir;
        }

        // Cooldowns
        if (this.echoCooldown > 0) {
            this.echoCooldown = Math.max(0, this.echoCooldown - dt);
        }

        // Update Starfield
        for (const star of this.stars) {
            star.y += star.speed * dt;
            if (star.y > this.height) star.y = 0;
        }

        // Update Black Holes Gravity
        for (const bh of this.blackHoles) {
            bh.update(dt);
            const gravForce = Physics.computeGravity(this.player.pos, bh.pos, bh.mass);
            this.player.vel.add(new Vector2(gravForce.x * dt, gravForce.y * dt));

            // Check event horizon collision
            if (Physics.circleCollision(this.player.pos, this.player.radius, bh.pos, bh.radius)) {
                this.triggerGameOver('Absorbed by Black Hole Singularity.');
                return;
            }
        }

        // Update Player & Echo
        this.player.update(dt, this.inputDir, { width: this.width, height: this.height });
        this.echo.update(dt);

        // Update Nodes
        for (const node of this.nodes) {
            node.update(dt);

            // Connect thread when player grazes node
            if (Physics.circleCollision(this.player.pos, this.player.radius, node.pos, node.radius)) {
                if (!this.player.connectedNodes.has(node.id)) {
                    this.player.connectedNodes.add(node.id);
                    this.sound.playNodeConnectNote(this.player.connectedNodes.size);
                    this.particleSystem.emitSparks(node.pos.x, node.pos.y, 10, '#00f0ff');
                }
            }
        }

        // Check Constellation Loop Formations
        const loopResult = this.constellationMgr.detectClosedLoop(this.player.trail);
        if (loopResult) {
            const burstStats = this.constellationMgr.triggerSolarBurst(
                loopResult.polygon, this.nodes, this.corruptors, this.particleSystem
            );

            // Clear trail to avoid infinite loops
            this.player.trail = this.player.trail.slice(loopResult.startIndex + loopResult.polygon.length);
            
            // Score & Supernova Energy
            this.multiplier = Math.min(5.0, this.multiplier + 0.2);
            this.score += Math.floor(loopResult.area * 0.1 * this.multiplier);
            this.supernovaEnergy = Math.min(this.maxSupernova, this.supernovaEnergy + 25);
            this.updateHUD();
        }

        // Update Corruptors
        for (const c of this.corruptors) {
            c.update(dt, this.player.pos);
            if (c.alive && Physics.circleCollision(this.player.pos, this.player.radius, c.pos, c.radius)) {
                this.triggerGameOver('Destroyed by Solar Corruptor.');
                return;
            }
        }

        // Update Visual Particles
        this.particleSystem.update(dt);

        // Check Win Condition
        const allPurified = this.nodes.length > 0 && this.nodes.every(n => n.purified);
        if (allPurified) {
            if (this.mode === 'CAMPAIGN') {
                this.triggerVictory();
            } else {
                // Next wave in Endless Mode
                this.endlessWave++;
                const data = this.levelMgr.generateEndlessWave(this.endlessWave, this.width, this.height);
                this.setupEntities(data);
            }
        }
    }

    triggerVictory() {
        this.state = 'VICTORY';
        this.sound.playVictorySFX();
        this.levelMgr.unlockLevel(this.levelMgr.currentLevelIndex + 2);

        document.getElementById('levelScoreVal').innerText = this.score;
        document.getElementById('levelConstellationsVal').innerText = Math.floor(this.score / 500);
        document.getElementById('levelEchoesVal').innerText = this.echo.recordedPath.length > 0 ? 1 : 0;
        document.getElementById('levelCompleteModal').classList.remove('hidden');
    }

    triggerGameOver(reason) {
        this.state = 'GAMEOVER';
        document.getElementById('defeatReasonText').innerText = reason;
        document.getElementById('finalScoreVal').innerText = this.score;
        document.getElementById('gameOverModal').classList.remove('hidden');

        // High score storage
        const currentHigh = parseInt(localStorage.getItem('ew_high_score') || '0', 10);
        if (this.score > currentHigh) {
            localStorage.setItem('ew_high_score', this.score.toString());
            document.getElementById('menuHighScore').innerText = this.score;
        }
    }

    updateHUD() {
        document.getElementById('scoreText').innerText = this.score;
        document.getElementById('multiplierText').innerText = `x${this.multiplier.toFixed(1)}`;
        document.getElementById('energyBar').style.width = `${this.player ? this.player.energy : 100}%`;
        document.getElementById('supernovaBar').style.width = `${(this.supernovaEnergy / this.maxSupernova) * 100}%`;
        
        const novaBtn = document.getElementById('novaBtn');
        if (this.supernovaEnergy >= this.maxSupernova) {
            novaBtn.classList.remove('disabled');
        } else {
            novaBtn.classList.add('disabled');
        }

        const cdRatio = (this.echoCooldown / this.echoMaxCooldown) * 100;
        document.getElementById('echoCooldown').style.height = `${cdRatio}%`;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Draw Starfield Background
        this.ctx.fillStyle = '#ffffff';
        for (const star of this.stars) {
            this.ctx.globalAlpha = star.alpha;
            this.ctx.fillRect(star.x, star.y, star.size, star.size);
        }
        this.ctx.globalAlpha = 1;

        if (this.state === 'PLAYING' || this.state === 'PAUSED') {
            // Draw Black Holes
            for (const bh of this.blackHoles) bh.draw(this.ctx);

            // Draw Nodes
            for (const node of this.nodes) node.draw(this.ctx);

            // Draw Corruptors
            for (const c of this.corruptors) c.draw(this.ctx);

            // Draw Echo & Player
            this.echo.draw(this.ctx);
            if (this.player) this.player.draw(this.ctx);

            // Draw Particles
            this.particleSystem.draw(this.ctx);
        }
    }

    loop(timestamp) {
        const dt = Math.min(0.05, (timestamp - this.lastTime) / 1000);
        this.lastTime = timestamp;

        this.update(dt);
        this.draw();

        requestAnimationFrame((t) => this.loop(t));
    }
}
