/**
 * Application Bootstrap & Event Wiring for Eclipse Weaver
 */
window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const game = new Game(canvas);

    // Initialize High Score Display
    const savedHighScore = localStorage.getItem('ew_high_score') || '0';
    document.getElementById('menuHighScore').innerText = savedHighScore;

    // UI Element References
    const mainMenu = document.getElementById('mainMenu');
    const levelSelectModal = document.getElementById('levelSelectModal');
    const howToPlayModal = document.getElementById('howToPlayModal');
    const pauseModal = document.getElementById('pauseModal');
    const levelCompleteModal = document.getElementById('levelCompleteModal');
    const gameOverModal = document.getElementById('gameOverModal');
    const hud = document.getElementById('hud');

    // Hide all modals function
    function hideAllOverlays() {
        mainMenu.classList.add('hidden');
        levelSelectModal.classList.add('hidden');
        howToPlayModal.classList.add('hidden');
        pauseModal.classList.add('hidden');
        levelCompleteModal.classList.add('hidden');
        gameOverModal.classList.add('hidden');
    }

    // Render Campaign Level Grid
    function renderLevelGrid() {
        const grid = document.getElementById('levelGrid');
        grid.innerHTML = '';
        const levels = game.levelMgr.campaignLevels;

        levels.forEach((lvl, idx) => {
            const card = document.createElement('div');
            card.className = `level-card ${idx + 1 > game.levelMgr.maxUnlockedLevel ? 'locked' : ''}`;
            card.innerHTML = `
                <div class="num">${idx + 1}</div>
                <div class="stars">★★★</div>
            `;

            if (idx + 1 <= game.levelMgr.maxUnlockedLevel) {
                card.addEventListener('click', () => {
                    hideAllOverlays();
                    hud.classList.remove('hidden');
                    game.startCampaignLevel(idx);
                });
            }
            grid.appendChild(card);
        });
    }

    // Navigation Event Listeners
    document.getElementById('startCampaignBtn').addEventListener('click', () => {
        renderLevelGrid();
        mainMenu.classList.add('hidden');
        levelSelectModal.classList.remove('hidden');
    });

    document.getElementById('startEndlessBtn').addEventListener('click', () => {
        hideAllOverlays();
        hud.classList.remove('hidden');
        game.startEndlessMode();
    });

    document.getElementById('howToPlayBtn').addEventListener('click', () => {
        howToPlayModal.classList.remove('hidden');
    });

    document.getElementById('closeHowToPlayBtn').addEventListener('click', () => {
        howToPlayModal.classList.add('hidden');
    });

    document.getElementById('backFromLevelsBtn').addEventListener('click', () => {
        levelSelectModal.classList.add('hidden');
        mainMenu.classList.remove('hidden');
    });

    // In-game Actions
    document.getElementById('echoBtn').addEventListener('click', () => game.triggerEcho());
    document.getElementById('novaBtn').addEventListener('click', () => game.triggerSupernova());
    document.getElementById('pauseBtn').addEventListener('click', () => game.togglePause());

    document.getElementById('audioToggleBtn').addEventListener('click', () => {
        const enabled = game.sound.toggleMute();
        document.getElementById('audioToggleBtn').innerText = enabled ? '🔊' : '🔇';
    });

    // Pause Modal Buttons
    document.getElementById('resumeBtn').addEventListener('click', () => game.togglePause());
    document.getElementById('restartLevelBtn').addEventListener('click', () => {
        hideAllOverlays();
        game.startCampaignLevel(game.levelMgr.currentLevelIndex);
    });
    document.getElementById('quitToMenuBtn').addEventListener('click', () => {
        hideAllOverlays();
        hud.classList.add('hidden');
        mainMenu.classList.remove('hidden');
        game.state = 'MENU';
    });

    // Victory / Game Over Buttons
    document.getElementById('nextLevelBtn').addEventListener('click', () => {
        hideAllOverlays();
        game.startCampaignLevel(game.levelMgr.currentLevelIndex + 1);
    });
    document.getElementById('retryLevelBtn').addEventListener('click', () => {
        hideAllOverlays();
        game.startCampaignLevel(game.levelMgr.currentLevelIndex);
    });
    document.getElementById('retryGameOverBtn').addEventListener('click', () => {
        hideAllOverlays();
        if (game.mode === 'CAMPAIGN') {
            game.startCampaignLevel(game.levelMgr.currentLevelIndex);
        } else {
            game.startEndlessMode();
        }
    });
    document.getElementById('levelCompleteMenuBtn').addEventListener('click', () => {
        hideAllOverlays();
        hud.classList.add('hidden');
        renderLevelGrid();
        levelSelectModal.classList.remove('hidden');
    });
    document.getElementById('gameOverMenuBtn').addEventListener('click', () => {
        hideAllOverlays();
        hud.classList.add('hidden');
        mainMenu.classList.remove('hidden');
        game.state = 'MENU';
    });

    // Start 60 FPS Engine Loop
    requestAnimationFrame((t) => game.loop(t));
});
