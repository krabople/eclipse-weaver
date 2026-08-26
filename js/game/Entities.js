/**
 * Game Entities for Eclipse Weaver
 */

/**
 * Player Celestial Core (Astra)
 */
class AstraPlayer {
    constructor(x, y) {
        this.pos = new Vector2(x, y);
        this.vel = new Vector2(0, 0);
        this.acc = new Vector2(0, 0);
        this.radius = 16;
        this.speed = 450;
        this.drag = 0.94;
        this.energy = 100;
        this.maxEnergy = 100;
        this.tethering = false;
        this.trail = []; // Active thread path points
        this.maxTrailLength = 120;
        this.connectedNodes = new Set();
        this.hue = 190; // Neon cyan base
    }

    update(dt, inputDir, bounds) {
        // Accelerate based on input
        if (inputDir.lengthSq() > 0) {
            inputDir.normalize();
            this.acc.x = inputDir.x * this.speed * 4;
            this.acc.y = inputDir.y * this.speed * 4;
        } else {
            this.acc.set(0, 0);
        }

        // Apply acceleration & drag
        this.vel.add(new Vector2(this.acc.x * dt, this.acc.y * dt));
        this.vel.scale(this.drag);
        this.pos.add(new Vector2(this.vel.x * dt, this.vel.y * dt));

        // Screen boundary bounce
        if (this.pos.x < this.radius) { this.pos.x = this.radius; this.vel.x *= -0.5; }
        if (this.pos.x > bounds.width - this.radius) { this.pos.x = bounds.width - this.radius; this.vel.x *= -0.5; }
        if (this.pos.y < this.radius) { this.pos.y = this.radius; this.vel.y *= -0.5; }
        if (this.pos.y > bounds.height - this.radius) { this.pos.y = bounds.height - this.radius; this.vel.y *= -0.5; }

        // Track thread trail
        if (this.tethering) {
            const lastPt = this.trail[this.trail.length - 1];
            if (!lastPt || lastPt.distSq(this.pos) > 25) {
                this.trail.push(this.pos.clone());
                if (this.trail.length > this.maxTrailLength) {
                    this.trail.shift();
                }
            }
        }
    }

    draw(ctx) {
        ctx.save();
        
        // Draw tether thread trail
        if (this.trail.length > 1) {
            ctx.shadowColor = '#00f0ff';
            ctx.shadowBlur = 15;
            ctx.strokeStyle = '#00f0ff';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(this.trail[0].x, this.trail[0].y);
            for (let i = 1; i < this.trail.length; i++) {
                ctx.lineTo(this.trail[i].x, this.trail[i].y);
            }
            ctx.stroke();
        }

        // Draw Player Core
        ctx.shadowColor = `hsl(${this.hue}, 100%, 60%)`;
        ctx.shadowBlur = 25;

        // Outer glow aura
        const grad = ctx.createRadialGradient(this.pos.x, this.pos.y, 0, this.pos.x, this.pos.y, this.radius * 2);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.5, `hsl(${this.hue}, 100%, 60%)`);
        grad.addColorStop(1, 'transparent');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.radius * 2, 0, Math.PI * 2);
        ctx.fill();

        // Inner solid core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.radius * 0.6, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

/**
 * Temporal Echo Ghost Entity
 */
class TemporalEcho {
    constructor() {
        this.active = false;
        this.recordedPath = []; // Array of {pos, timestamp}
        this.playbackTime = 0;
        this.duration = 4.0;
        this.currentPos = new Vector2();
        this.trail = [];
    }

    startRecording(playerTrail) {
        this.recordedPath = playerTrail.map(pt => pt.clone());
        this.playbackTime = 0;
        this.active = true;
        this.trail = [];
    }

    update(dt) {
        if (!this.active || this.recordedPath.length < 2) return;

        this.playbackTime += dt;
        const progress = this.playbackTime / this.duration;

        if (progress >= 1.0) {
            this.active = false;
            return;
        }

        const index = Math.floor(progress * (this.recordedPath.length - 1));
        const subT = (progress * (this.recordedPath.length - 1)) - index;

        const p1 = this.recordedPath[index];
        const p2 = this.recordedPath[Math.min(index + 1, this.recordedPath.length - 1)];
        this.currentPos = Vector2.lerp(p1, p2, subT);

        this.trail.push(this.currentPos.clone());
        if (this.trail.length > 80) this.trail.shift();
    }

    draw(ctx) {
        if (!this.active) return;

        ctx.save();
        ctx.shadowColor = '#ff0077';
        ctx.shadowBlur = 20;

        // Echo thread trail
        if (this.trail.length > 1) {
            ctx.strokeStyle = '#ff0077';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(this.trail[0].x, this.trail[0].y);
            for (let i = 1; i < this.trail.length; i++) {
                ctx.lineTo(this.trail[i].x, this.trail[i].y);
            }
            ctx.stroke();
        }

        // Echo Ghost Core
        ctx.fillStyle = '#ff0077';
        ctx.globalAlpha = 0.7 + 0.3 * Math.sin(Date.now() * 0.01);
        ctx.beginPath();
        ctx.arc(this.currentPos.x, this.currentPos.y, 14, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

/**
 * Celestial Orbital Node
 */
class OrbitalNode {
    constructor(id, x, y, radius = 22, type = 'standard') {
        this.id = id;
        this.pos = new Vector2(x, y);
        this.originPos = new Vector2(x, y);
        this.radius = radius;
        this.type = type; // 'standard', 'pulsar', 'reflector'
        this.purified = false;
        this.orbitRadius = 0;
        this.orbitSpeed = 0;
        this.orbitAngle = Math.random() * Math.PI * 2;
        this.pulse = 0;
    }

    setOrbit(centerPos, radius, speed) {
        this.originPos = centerPos.clone();
        this.orbitRadius = radius;
        this.orbitSpeed = speed;
    }

    update(dt) {
        if (this.orbitRadius > 0) {
            this.orbitAngle += this.orbitSpeed * dt;
            this.pos.x = this.originPos.x + Math.cos(this.orbitAngle) * this.orbitRadius;
            this.pos.y = this.originPos.y + Math.sin(this.orbitAngle) * this.orbitRadius;
        }

        this.pulse += dt * 3;
    }

    draw(ctx) {
        ctx.save();
        const baseColor = this.purified ? '#00ff88' : (this.type === 'pulsar' ? '#ffd700' : '#00f0ff');
        const glowRadius = this.radius + Math.sin(this.pulse) * 3;

        ctx.shadowColor = baseColor;
        ctx.shadowBlur = 20;

        // Outer ring
        ctx.strokeStyle = baseColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, glowRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Inner Core
        ctx.fillStyle = this.purified ? '#ffffff' : baseColor;
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.radius * 0.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

/**
 * Corruptor Enemy Entity
 */
class Corruptor {
    constructor(x, y, speed = 80) {
        this.pos = new Vector2(x, y);
        this.vel = new Vector2(0, 0);
        this.speed = speed;
        this.radius = 12;
        this.alive = true;
    }

    update(dt, targetPos) {
        if (!this.alive) return;
        const dir = targetPos.clone().sub(this.pos).normalize();
        this.vel = dir.scale(this.speed);
        this.pos.add(new Vector2(this.vel.x * dt, this.vel.y * dt));
    }

    draw(ctx) {
        if (!this.alive) return;
        ctx.save();
        ctx.shadowColor = '#ff0033';
        ctx.shadowBlur = 15;
        ctx.fillStyle = '#ff0033';

        // Draw spiked diamond shape
        ctx.beginPath();
        ctx.moveTo(this.pos.x, this.pos.y - this.radius);
        ctx.lineTo(this.pos.x + this.radius, this.pos.y);
        ctx.lineTo(this.pos.x, this.pos.y + this.radius);
        ctx.lineTo(this.pos.x - this.radius, this.pos.y);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }
}

/**
 * Black Hole Gravitational Hazard
 */
class BlackHole {
    constructor(x, y, mass = 300, radius = 28) {
        this.pos = new Vector2(x, y);
        this.mass = mass;
        this.radius = radius;
        this.rotAngle = 0;
    }

    update(dt) {
        this.rotAngle += dt * 2;
    }

    draw(ctx) {
        ctx.save();
        ctx.shadowColor = '#7b2cbf';
        ctx.shadowBlur = 35;

        // Accretion disk
        ctx.strokeStyle = '#7b2cbf';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.radius * 1.6, this.rotAngle, this.rotAngle + Math.PI * 1.5);
        ctx.stroke();

        // Dark singularity core
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}
