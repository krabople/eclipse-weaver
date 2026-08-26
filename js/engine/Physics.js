/**
 * Physics & Geometric Utility Engine
 */
class Physics {
    /**
     * Compute gravitational force vector applied to an entity by a gravity body
     */
    static computeGravity(entityPos, bodyPos, mass, maxForce = 500) {
        const dx = bodyPos.x - entityPos.x;
        const dy = bodyPos.y - entityPos.y;
        const distSq = Math.max(dx * dx + dy * dy, 400); // Prevent infinite singularity force
        const forceMagnitude = Math.min((mass * 1000) / distSq, maxForce);
        const angle = Math.atan2(dy, dx);
        
        return new Vector2(
            Math.cos(angle) * forceMagnitude,
            Math.sin(angle) * forceMagnitude
        );
    }

    /**
     * Check intersection between two line segments (p1-p2) and (p3-p4)
     * Returns point of intersection or null
     */
    static lineIntersection(p1, p2, p3, p4) {
        const d = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x);
        if (Math.abs(d) < 0.0001) return null; // Parallel

        const t = ((p1.x - p3.x) * (p3.y - p4.y) - (p1.y - p3.y) * (p3.x - p4.x)) / d;
        const u = -((p1.x - p2.x) * (p1.y - p3.y) - (p1.y - p2.y) * (p1.x - p3.x)) / d;

        if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
            return new Vector2(
                p1.x + t * (p2.x - p1.x),
                p1.y + t * (p2.y - p1.y)
            );
        }
        return null;
    }

    /**
     * Check if a point is inside a polygon using Ray-Casting algorithm
     */
    static pointInPolygon(point, polygonPoints) {
        let inside = false;
        const n = polygonPoints.length;
        for (let i = 0, j = n - 1; i < n; j = i++) {
            const xi = polygonPoints[i].x, yi = polygonPoints[i].y;
            const xj = polygonPoints[j].x, yj = polygonPoints[j].y;

            const intersect = ((yi > point.y) !== (yj > point.y)) &&
                (point.x < (xj - xi) * (point.y - yi) / (yj - yi + 0.00001) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    }

    /**
     * Calculate Shoelace formula polygon area
     */
    static polygonArea(points) {
        let area = 0;
        const n = points.length;
        for (let i = 0; i < n; i++) {
            const j = (i + 1) % n;
            area += points[i].x * points[j].y;
            area -= points[j].x * points[i].y;
        }
        return Math.abs(area / 2.0);
    }

    /**
     * Circle to circle collision check
     */
    static circleCollision(pos1, r1, pos2, r2) {
        return pos1.distSq(pos2) <= (r1 + r2) * (r1 + r2);
    }

    /**
     * Distance from point to line segment
     */
    static distToSegment(p, v, w) {
        const l2 = v.distSq(w);
        if (l2 === 0) return p.dist(v);
        let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
        t = Math.max(0, Math.min(1, t));
        const projection = new Vector2(
            v.x + t * (w.x - v.x),
            v.y + t * (w.y - v.y)
        );
        return p.dist(projection);
    }
}

if (typeof module !== 'undefined') {
    module.exports = Physics;
}
