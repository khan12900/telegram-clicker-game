// Initialize Telegram WebApp
const tg = window.Telegram.WebApp;
tg.expand();

// Game state
let points = 0;
let multiplier = 1.0;
let autoClickerInterval = null;

// DOM Elements
const pointsDisplay = document.getElementById('points');
const multiplierDisplay = document.getElementById('multiplier');
const clickArea = document.getElementById('clickArea');
const shopModal = document.getElementById('shopModal');
const leaderboardModal = document.getElementById('leaderboardModal');

// Initialize user data
async function initUser() {
    try {
        const response = await fetch(`/api/user/${tg.initDataUnsafe.user.id}`);
        const userData = await response.json();
        points = userData.points;
        multiplier = userData.boost_multiplier;
        updateDisplay();
    } catch (error) {
        console.error('Failed to initialize user data:', error);
    }
}

// Update display
function updateDisplay() {
    pointsDisplay.textContent = Math.floor(points);
    multiplierDisplay.textContent = multiplier.toFixed(1);
}

// Click handler
clickArea.addEventListener('click', async () => {
    points += multiplier;
    updateDisplay();
    
    try {
        await fetch('/api/click', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                telegram_id: tg.initDataUnsafe.user.id
            })
        });
    } catch (error) {
        console.error('Failed to save click:', error);
    }
});

// Shop functionality
document.getElementById('shopButton').addEventListener('click', () => {
    shopModal.style.display = 'block';
});

// Leaderboard functionality
document.getElementById('leaderboardButton').addEventListener('click', async () => {
    try {
        const response = await fetch('/api/leaderboard');
        const leaderboard = await response.json();
        
        const leaderboardList = document.getElementById('leaderboardList');
        leaderboardList.innerHTML = leaderboard
            .map((entry, index) => `
                <div class="leaderboard-item">
                    <span>#${index + 1}</span>
                    <span>Player ${entry.telegram_id}</span>
                    <span>${entry.points} points</span>
                </div>
            `)
            .join('');
        
        leaderboardModal.style.display = 'block';
    } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
    }
});

// Referral system
document.getElementById('referralButton').addEventListener('click', () => {
    tg.showPopup({
        title: 'Invite Friends',
        message: 'Share this game with your friends and earn bonus points!',
        buttons: [{
            type: 'default',
            text: 'Share',
            onClick: () => {
                tg.shareGame();
            }
        }]
    });
});

// Close modals
document.querySelectorAll('.close-button').forEach(button => {
    button.addEventListener('click', () => {
        shopModal.style.display = 'none';
        leaderboardModal.style.display = 'none';
    });
});

// Shop items
document.querySelectorAll('.buy-button').forEach(button => {
    button.addEventListener('click', () => {
        const item = button.dataset.item;
        const cost = item === 'booster' ? 100 : 200;
        
        if (points >= cost) {
            points -= cost;
            
            if (item === 'booster') {
                multiplier *= 2;
                setTimeout(() => {
                    multiplier /= 2;
                    updateDisplay();
                }, 60000);
            } else if (item === 'autoclicker') {
                if (autoClickerInterval) clearInterval(autoClickerInterval);
                autoClickerInterval = setInterval(() => {
                    clickArea.click();
                }, 1000);
                setTimeout(() => {
                    clearInterval(autoClickerInterval);
                    autoClickerInterval = null;
                }, 30000);
            }
            
            updateDisplay();
        } else {
            tg.showPopup({
                title: 'Not enough points',
                message: 'Keep clicking to earn more points!'
            });
        }
    });
});

// Initialize the game
initUser();
