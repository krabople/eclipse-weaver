/**
 * Constellation Geometry & Solar Burst Manager
 */
class ConstellationManager {
    constructor(particleSystem, soundSynth) {
        this.particles = particleSystem;
        this.sound = soundSynth;
    }

    /**
     * Check if a thread path forms a closed geometric polygon loop
     * Returns an object { closed: true, polygon: Vector2[], area: number } or null
     */
    detectClosedLoop(trail) {
        if (trail.length < 10) return null;

        const head = trail[trail.length - 1];
        
        // Check head against older segments (skip last 6 points to avoid micro-loops)
        for (let i = 0; i < trail.length - 8; i++) {
            const p1 = trail[i];
            const p2 = trail[i + 1];

            // If head is close to segment p1-p2 or crosses it
            const dist = Physics.distToSegment(head, p1, p2);
            if (dist < 15) {
                // Polygon is formed by trail slice from i to end
                const polygon = trail.slice(i);
                const area = Physics.polygonArea(polygon);
                
                if (area > 800) { // Require minimum constellation size
                    return { polygon, area, startIndex: i };
                }
            }
        }
        return null;
    }

    /**
     * Process solar burst inside an enclosed polygon loop
     */
    triggerSolarBurst(polygon, nodes, corruptors, particleSystem) {
        // Find enclosed nodes & corruptors
        let purifiedNodeCount = 0;
        let destroyedCorruptors = 0;

        // Calculate center of polygon
        let cx = 0, cy = 0;
        for (const pt of polygon) {
            cx += pt.x;
            cy += pt.y;
        }
        cx /= polygon.length;
        cy /= polygon.length;

        // Purify nodes inside polygon
        for (const node of nodes) {
            if (Physics.pointInPolygon(node.pos, polygon)) {
                if (!node.purified) {
                    node.purified = true;
                    purifiedNodeCount++;
                    particleSystem.emitSolarBurst(node.pos.x, node.pos.y, 60, '#00ff88');
                }
            }
        }

        // Destroy corruptors inside polygon
        for (const c of corruptors) {
            if (c.alive && Physics.pointInPolygon(c.pos, polygon)) {
                c.alive = false;
                destroyedCorruptors++;
                particleSystem.emitSolarBurst(c.pos.x, c.pos.y, 40, '#ff0055');
            }
        }

        // Trigger visual & audio feedback
        particleSystem.emitSolarBurst(cx, cy, 120, '#00f0ff');
        this.sound.playSolarBurstChord();

        return {
            purifiedNodes: purifiedNodeCount,
            destroyedCorruptors,
            center: new Vector2(cx, cy)
        };
    }
}
