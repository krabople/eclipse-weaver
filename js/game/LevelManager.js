/**
 * Level Manager for Campaign & Endless Modes
 */
class LevelManager {
    constructor() {
        this.currentLevelIndex = 0;
        this.maxUnlockedLevel = parseInt(localStorage.getItem('ew_unlocked_level') || '1', 10);
        this.campaignLevels = this.generateCampaignLevels();
    }

    generateCampaignLevels() {
        const levels = [];
        for (let i = 1; i <= 30; i++) {
            const nodeCount = 3 + Math.floor(i / 3);
            const corruptorCount = Math.floor(i / 2);
            const hasBlackHole = i >= 4 && i % 3 === 0;

            levels.push({
                id: i,
                title: `SECTOR ${Math.ceil(i / 5)}-${((i - 1) % 5) + 1}`,
                objectiveText: `PURIFY ${nodeCount} ORBITAL NODES`,
                nodeCount,
                corruptorCount,
                hasBlackHole,
                parTime: 30 + i * 2,
                targetScore: 1000 * i
            });
        }
        return levels;
    }

    loadLevel(levelIndex, width, height) {
        this.currentLevelIndex = levelIndex;
        const config = this.campaignLevels[levelIndex] || this.campaignLevels[0];

        const nodes = [];
        const corruptors = [];
        const blackHoles = [];

        const centerX = width / 2;
        const centerY = height / 2;

        // Position nodes in orbits
        const radiusStep = Math.min(width, height) * 0.18;
        for (let i = 0; i < config.nodeCount; i++) {
            const angle = (i / config.nodeCount) * Math.PI * 2;
            const r = radiusStep + (i % 2) * 50;
            const x = centerX + Math.cos(angle) * r;
            const y = centerY + Math.sin(angle) * r;

            const node = new OrbitalNode(i, x, y, 20, i % 4 === 0 ? 'pulsar' : 'standard');
            if (i > 1) {
                node.setOrbit(new Vector2(centerX, centerY), r, 0.3 * (i % 2 === 0 ? 1 : -1));
            }
            nodes.push(node);
        }

        // Spawn corruptors
        for (let i = 0; i < config.corruptorCount; i++) {
            const cx = Math.random() < 0.5 ? 50 : width - 50;
            const cy = Math.random() * height;
            corruptors.push(new Corruptor(cx, cy, 60 + Math.random() * 40));
        }

        // Spawn black hole if level requires
        if (config.hasBlackHole) {
            blackHoles.push(new BlackHole(centerX, centerY, 350, 32));
        }

        return {
            config,
            nodes,
            corruptors,
            blackHoles,
            startPos: new Vector2(width / 2, height - 100)
        };
    }

    generateEndlessWave(waveNum, width, height) {
        const nodeCount = Math.min(10, 4 + Math.floor(waveNum / 2));
        const corruptorCount = 2 + waveNum * 2;
        const hasBlackHole = waveNum >= 2;

        const nodes = [];
        const corruptors = [];
        const blackHoles = [];

        for (let i = 0; i < nodeCount; i++) {
            const x = 100 + Math.random() * (width - 200);
            const y = 100 + Math.random() * (height - 200);
            const node = new OrbitalNode(i, x, y, 20, Math.random() < 0.3 ? 'pulsar' : 'standard');
            if (Math.random() < 0.6) {
                node.setOrbit(new Vector2(width / 2, height / 2), 100 + Math.random() * 150, (Math.random() - 0.5) * 1.2);
            }
            nodes.push(node);
        }

        for (let i = 0; i < corruptorCount; i++) {
            const x = Math.random() < 0.5 ? 40 : width - 40;
            const y = Math.random() * height;
            corruptors.push(new Corruptor(x, y, 70 + waveNum * 10));
        }

        if (hasBlackHole) {
            blackHoles.push(new BlackHole(width / 2, height / 2, 400, 30));
        }

        return {
            config: {
                title: `SURGE WAVE ${waveNum}`,
                objectiveText: `PURIFY ALL NODES TO SURVIVE`,
                nodeCount
            },
            nodes,
            corruptors,
            blackHoles,
            startPos: new Vector2(width / 2, height / 2)
        };
    }

    unlockLevel(levelNum) {
        if (levelNum > this.maxUnlockedLevel) {
            this.maxUnlockedLevel = levelNum;
            localStorage.setItem('ew_unlocked_level', levelNum.toString());
        }
    }
}
