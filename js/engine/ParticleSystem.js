/**
 * High-performance Particle & Visual Effects Emitter
 */
class Particle {
    constructor(x, y, vx, vy, color, size, life, shape = 'circle') {
        this.pos = new Vector2(x, y);
        this.vel = new Vector2(vx, vy);
        this.color = color;
        this.size = size;
        this.maxSize = size;
        this.life = life;
        this.maxLife = life;
        this.shape = shape;
        this.alpha = 1;
        this.decay = 1 / life;
    }

    update(dt) {
        this.pos.add(new Vector2(this.vel.x * dt, this.vel.y * dt));
        this.life -= dt;
        this.alpha = Math.max(0, this.life / this.maxLife);
        this.size = this.maxSize * (0.3 + 0.7 * this.alpha);
        return this.life > 0;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = this.size * 2;

        if (this.shape === 'ring') {
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.pos.x, this.pos.y, this.size, 0, Math.PI * 2);
            ctx.stroke();
        } else if (this.shape === 'star') {
            ctx.beginPath();
            const r = this.size;
            for (let i = 0; i < 5; i++) {
                ctx.lineTo(
                    this.pos.x + r * Math.cos((18 + i * 72) * Math.PI / 180),
                    this.pos.y - r * Math.sin((18 + i * 72) * Math.PI / 180)
                );
                ctx.lineTo(
                    this.pos.x + (r / 2) * Math.cos((54 + i * 72) * Math.PI / 180),
                    this.pos.y - (r / 2) * Math.sin((54 + i * 72) * Math.PI / 180)
                );
            }
            ctx.closePath();
            ctx.fill();
        } else {
            ctx.beginPath();
            ctx.arc(this.pos.x, this.pos.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }
}

class ParticleSystem {
    constructor() {
        this.particles = [];
        this.shockwaves = [];
    }

    emitSparks(x, y, count = 15, color = '#00f0ff') {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 50 + Math.random() * 250;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            const life = 0.4 + Math.random() * 0.5;
            const size = 2 + Math.random() * 4;
            this.particles.push(new Particle(x, y, vx, vy, color, size, life));
        }
    }

    emitSolarBurst(x, y, radius = 80, color = '#ff0077') {
        // Ring shockwave
        this.shockwaves.push({
            x, y, radius: 10, maxRadius: radius,
            color, alpha: 1, life: 0.6, maxLife: 0.6
        });

        // Sparks
        this.emitSparks(x, y, 30, color);
        
        // Starbursts
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const speed = 180;
            this.particles.push(new Particle(
                x, y, Math.cos(angle) * speed, Math.sin(angle) * speed,
                '#ffd700', 8, 0.5, 'star'
            ));
        }
    }

    update(dt) {
        // Update particles
        this.particles = this.particles.filter(p => p.update(dt));

        // Update shockwaves
        for (let i = this.shockwaves.length - 1; i >= 0; i--) {
            const sw = this.shockwaves[i];
            sw.life -= dt;
            sw.alpha = Math.max(0, sw.life / sw.maxLife);
            sw.radius += (sw.maxRadius - sw.radius) * (dt * 5);
            if (sw.life <= 0) {
                this.shockwaves.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        // Draw shockwaves
        for (const sw of this.shockwaves) {
            ctx.save();
            ctx.globalAlpha = sw.alpha;
            ctx.strokeStyle = sw.color;
            ctx.shadowColor = sw.color;
            ctx.shadowBlur = 15;
            ctx.lineWidth = 4 * sw.alpha;
            ctx.beginPath();
            ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }

        // Draw particles
        for (const p of this.particles) {
            p.draw(ctx);
        }
    }

    clear() {
        this.particles = [];
        this.shockwaves = [];
    }
}
