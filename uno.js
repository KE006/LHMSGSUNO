// Card types and colors
const COLORS = ['red', 'blue', 'green', 'yellow'];
const NUMBERS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const SPECIAL_CARDS = ['skip', 'reverse', 'draw-two'];
const WILD_CARDS = ['wild', 'wild-draw-four'];

// Game state
let deck = [];
let discardPile = [];
let playerHand = [];
let aiHand = [];
let currentPlayer = 'player'; // 'player' or 'ai'
let currentColor = '';
let gameActive = false;
let direction = 1; // 1 for clockwise, -1 for counter-clockwise

// Add these variables to the top of the file with other game state variables
let achievements = {
    firstWin: false,
    wildMaster: false,
    comeback: false,
    perfect: false,
    specialMaster: false,
    threeWins: 0
};

let gameStats = {
    wildCardsPlayed: 0,
    maxHandSize: 7,
    cardsDrawn: 0,
    specialCardsInARow: 0,
    lastCardWasSpecial: false
};

// DOM elements
const playerHandElement = document.getElementById('player-hand');
const aiHandElement = document.getElementById('ai-hand');
const discardPileElement = document.getElementById('discard-pile');
const deckElement = document.getElementById('deck');
const gameMessageElement = document.getElementById('game-message');
const colorChooserElement = document.getElementById('color-chooser');
const newGameButton = document.getElementById('new-game-btn');
const aiCardCountElement = document.getElementById('ai-card-count');

// Additional DOM elements
const startPanel = document.getElementById('start-panel');
const gameAreaContainer = document.getElementById('game-area-container');
const winPanel = document.getElementById('win-panel');
const losePanel = document.getElementById('lose-panel');
const startGameButton = document.getElementById('start-game-btn');
const playAgainWinButton = document.getElementById('play-again-win-btn');
const playAgainLoseButton = document.getElementById('play-again-lose-btn');
const aiRemainingCountElement = document.getElementById('ai-remaining-count');
const playerRemainingCountElement = document.getElementById('player-remaining-count');

// Additional DOM elements
const achievementsBtn = document.getElementById('achievements-btn');
const achievementsPanel = document.getElementById('achievements-panel');
const closeAchievementsBtn = document.getElementById('close-achievements-btn');
const achievementNotification = document.getElementById('achievement-notification');
const achievementNotificationText = document.getElementById('achievement-notification-text');

// Additional DOM elements for tutorial
const startTutorialButton = document.getElementById('start-tutorial-btn');
const tutorialPanel = document.getElementById('tutorial-panel');
const tutorialTitle = document.getElementById('tutorial-title');
const tutorialText = document.getElementById('tutorial-text');
const tutorialNextButton = document.getElementById('tutorial-next-btn');
const tutorialHighlight = document.getElementById('tutorial-highlight');

// Additional DOM elements for puzzles
const puzzlesButton = document.getElementById('puzzles-btn');
const puzzlesPanel = document.getElementById('puzzles-panel');
const backFromPuzzlesButton = document.getElementById('back-from-puzzles-btn');
const puzzleCompletePanel = document.getElementById('puzzle-complete-panel');
const puzzleCompleteMessage = document.getElementById('puzzle-complete-message');
const nextPuzzleButton = document.getElementById('next-puzzle-btn');
const puzzlesMenuButton = document.getElementById('puzzles-menu-btn');
const puzzleInstructions = document.getElementById('puzzle-instructions');
const puzzleTitle = document.getElementById('puzzle-title');
const puzzleText = document.getElementById('puzzle-text');
const startPuzzleButton = document.getElementById('start-puzzle-btn');

// Tutorial state
let tutorialActive = false;
let tutorialStep = 0;
let tutorialCards = [];

// Puzzle state
let puzzleActive = false;
let currentPuzzle = 0;
let puzzlesCompleted = [false, false, false];
let puzzleMoves = 0;
let puzzleMaxMoves = 0;

// Initialize the game
newGameButton.addEventListener('click', startNewGame);
startGameButton.addEventListener('click', startGameFromPanel);
playAgainWinButton.addEventListener('click', startGameFromPanel);
playAgainLoseButton.addEventListener('click', startGameFromPanel);
deckElement.addEventListener('click', drawCard);
startTutorialButton.addEventListener('click', startTutorial);
tutorialNextButton.addEventListener('click', nextTutorialStep);
puzzlesButton.addEventListener('click', showPuzzlesPanel);
backFromPuzzlesButton.addEventListener('click', backToMainMenu);
nextPuzzleButton.addEventListener('click', loadNextPuzzle);
puzzlesMenuButton.addEventListener('click', showPuzzlesPanel);
startPuzzleButton.addEventListener('click', startPuzzle);

// Set up color chooser
document.querySelectorAll('.color-btn').forEach(button => {
    button.addEventListener('click', () => {
        const color = button.getAttribute('data-color');
        handleColorChoice(color);
    });
});

// Set up puzzle items
document.querySelectorAll('.puzzle-item').forEach(item => {
    item.addEventListener('click', () => {
        const puzzleId = parseInt(item.getAttribute('data-puzzle'));
        loadPuzzle(puzzleId);
    });
});

// Initialize achievements
function initAchievements() {
    // Load achievements from localStorage if available
    const savedAchievements = localStorage.getItem('unoAchievements');
    if (savedAchievements) {
        achievements = JSON.parse(savedAchievements);
        updateAchievementsUI();
    }
    
    // Set up event listeners
    achievementsBtn.addEventListener('click', toggleAchievementsPanel);
    closeAchievementsBtn.addEventListener('click', toggleAchievementsPanel);
}

// Toggle achievements panel
function toggleAchievementsPanel() {
    if (achievementsPanel.style.display === 'block') {
        achievementsPanel.style.display = 'none';
    } else {
        achievementsPanel.style.display = 'block';
        updateAchievementsUI();
    }
}

// Update achievements UI
function updateAchievementsUI() {
    // First Win
    updateAchievementUI('first-win', achievements.firstWin);
    
    // Wild Master
    updateAchievementUI('wild-master', achievements.wildMaster);
    
    // Comeback
    updateAchievementUI('comeback', achievements.comeback);
    
    // Perfect Game
    updateAchievementUI('perfect', achievements.perfect);
    
    // Special Master
    updateAchievementUI('special-master', achievements.specialMaster);
    
    // Three Wins
    updateAchievementUI('three-wins', achievements.threeWins >= 3);
}

// Update individual achievement UI
function updateAchievementUI(id, unlocked) {
    const achievement = document.getElementById(`achievement-${id}`);
    const icon = achievement.querySelector('.achievement-icon');
    const status = achievement.querySelector('.achievement-status');
    
    if (unlocked) {
        achievement.classList.add('unlocked');
        icon.classList.remove('locked');
        icon.classList.add('unlocked');
        status.textContent = '✅';
    } else {
        achievement.classList.remove('unlocked');
        icon.classList.add('locked');
        icon.classList.remove('unlocked');
        status.textContent = '🔒';
    }
}

// Show achievement notification
function showAchievementNotification(name) {
    achievementNotificationText.textContent = name;
    achievementNotification.classList.add('show');
    
    setTimeout(() => {
        achievementNotification.classList.remove('show');
    }, 5000);
}

// Unlock achievement
function unlockAchievement(id, name) {
    switch(id) {
        case 'first-win':
            if (!achievements.firstWin) {
                achievements.firstWin = true;
                showAchievementNotification(name);
            }
            break;
        case 'wild-master':
            if (!achievements.wildMaster) {
                achievements.wildMaster = true;
                showAchievementNotification(name);
            }
            break;
        case 'comeback':
            if (!achievements.comeback) {
                achievements.comeback = true;
                showAchievementNotification(name);
            }
            break;
        case 'perfect':
            if (!achievements.perfect) {
                achievements.perfect = true;
                showAchievementNotification(name);
            }
            break;
        case 'special-master':
            if (!achievements.specialMaster) {
                achievements.specialMaster = true;
                showAchievementNotification(name);
            }
            break;
        case 'three-wins':
            achievements.threeWins++;
            if (achievements.threeWins === 3) {
                showAchievementNotification(name);
            }
            break;
    }
    
    // Save achievements to localStorage
    localStorage.setItem('unoAchievements', JSON.stringify(achievements));
    
    // Update achievements UI if panel is open
    if (achievementsPanel.style.display === 'block') {
        updateAchievementsUI();
    }
}

// Reset game stats
function resetGameStats() {
    gameStats = {
        wildCardsPlayed: 0,
        maxHandSize: 7,
        cardsDrawn: 0,
        specialCardsInARow: 0,
        lastCardWasSpecial: false
    };
}

// Start game from panel
function startGameFromPanel() {
    // Hide all panels
    startPanel.style.display = 'none';
    winPanel.style.display = 'none';
    losePanel.style.display = 'none';
    
    // Show game area
    gameAreaContainer.style.display = 'block';
    
    // Start a new game
    startNewGame();
}

// Start a new game
function startNewGame() {
    // Reset game stats
    resetGameStats();
    
    // Create and shuffle the deck
    deck = createDeck();
    shuffleDeck(deck);
    
    // Clear hands and discard pile
    playerHand = [];
    aiHand = [];
    discardPile = [];
    
    // Deal cards
    for (let i = 0; i < 7; i++) {
        playerHand.push(deck.pop());
        aiHand.push(deck.pop());
    }
    
    // Start discard pile with one card from the deck
    let startCard = deck.pop();
    // If it's a wild card, assign a random color
    if (startCard.type === 'wild' || startCard.type === 'wild-draw-four') {
        startCard.color = COLORS[Math.floor(Math.random() * COLORS.length)];
        startCard.displayColor = startCard.color;
    }
    discardPile.push(startCard);
    currentColor = startCard.color;
    
    // Set starting player
    currentPlayer = 'player';
    direction = 1;
    gameActive = true;
    
    // Update UI
    updateGameUI();
    gameMessageElement.textContent = "Your turn! Play a card or draw from the deck.";
}

// Create a complete UNO deck
function createDeck() {
    const deck = [];
    
    // Add number cards (0-9) for each color
    COLORS.forEach(color => {
        // One 0 card per color
        deck.push({ color, type: '0', displayColor: color });
        
        // Two of each 1-9 card per color
        for (let i = 1; i < NUMBERS.length; i++) {
            deck.push({ color, type: NUMBERS[i], displayColor: color });
            deck.push({ color, type: NUMBERS[i], displayColor: color });
        }
        
        // Two of each special card per color
        SPECIAL_CARDS.forEach(type => {
            deck.push({ color, type, displayColor: color });
            deck.push({ color, type, displayColor: color });
        });
    });
    
    // Add wild cards (4 of each type)
    for (let i = 0; i < 4; i++) {
        deck.push({ color: 'wild', type: 'wild', displayColor: 'wild' });
        deck.push({ color: 'wild', type: 'wild-draw-four', displayColor: 'wild' });
    }
    
    return deck;
}

// Shuffle the deck using Fisher-Yates algorithm
function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

// Update the game UI
function updateGameUI() {
    // Update player's hand
    renderPlayerHand();
    
    // Update AI's hand (showing card backs)
    renderAIHand();
    
    // Update discard pile
    renderDiscardPile();
    
    // Update AI card count
    aiCardCountElement.textContent = aiHand.length;
}

// Render player's hand
function renderPlayerHand() {
    playerHandElement.innerHTML = '';
    
    playerHand.forEach((card, index) => {
        const cardElement = createCardElement(card);
        cardElement.addEventListener('click', () => playCard(index));
        playerHandElement.appendChild(cardElement);
    });
}

// Render AI's hand (card backs)
function renderAIHand() {
    aiHandElement.innerHTML = '';
    
    for (let i = 0; i < aiHand.length; i++) {
        const cardElement = document.createElement('div');
        cardElement.className = 'card back';
        aiHandElement.appendChild(cardElement);
    }
}

// Render the discard pile
function renderDiscardPile() {
    discardPileElement.innerHTML = '';
    
    if (discardPile.length > 0) {
        const topCard = discardPile[discardPile.length - 1];
        const cardElement = createCardElement(topCard);
        discardPileElement.appendChild(cardElement);
    }
}

// Create a card element
function createCardElement(card) {
    const cardElement = document.createElement('div');
    cardElement.className = `card ${card.displayColor}`;
    
    let symbol = card.type;
    if (card.type === 'skip') {
        symbol = '⊘';
    } else if (card.type === 'reverse') {
        symbol = '⟲';
    } else if (card.type === 'draw-two') {
        symbol = '+2';
    } else if (card.type === 'wild') {
        symbol = 'W';
    } else if (card.type === 'wild-draw-four') {
        symbol = '+4';
    }
    
    cardElement.textContent = symbol;
    
    return cardElement;
}

// Handle player drawing a card
function drawCard() {
    if (!gameActive || currentPlayer !== 'player') return;
    
    if (deck.length === 0) {
        // Reshuffle discard pile if deck is empty
        if (discardPile.length <= 1) {
            gameMessageElement.textContent = "No cards left to draw!";
            return;
        }
        
        const topCard = discardPile.pop();
        deck = [...discardPile];
        discardPile = [topCard];
        shuffleDeck(deck);
    }
    
    const drawnCard = deck.pop();
    playerHand.push(drawnCard);
    
    // Update game stats
    gameStats.cardsDrawn++;
    gameStats.maxHandSize = Math.max(gameStats.maxHandSize, playerHand.length);
    
    updateGameUI();
    gameMessageElement.textContent = "You drew a card. Your turn ends.";
    
    // Switch to AI's turn
    setTimeout(() => {
        currentPlayer = 'ai';
        aiTurn();
    }, 1000);
}

// Handle player playing a card
function playCard(index) {
    if (!gameActive || currentPlayer !== 'player') return;
    
    const card = playerHand[index];
    const topCard = discardPile[discardPile.length - 1];
    
    // Check if the card can be played
    if (canPlayCard(card, topCard, currentColor)) {
        // Remove the card from player's hand
        playerHand.splice(index, 1);
        
        // Update game stats
        if (card.type === 'wild' || card.type === 'wild-draw-four') {
            gameStats.wildCardsPlayed++;
            
            // Check for Wild Master achievement
            if (gameStats.wildCardsPlayed >= 5 && !achievements.wildMaster) {
                unlockAchievement('wild-master', 'Wild Master');
            }
        }
        
        // Track special cards in a row
        const isSpecial = SPECIAL_CARDS.includes(card.type) || WILD_CARDS.includes(card.type);
        if (isSpecial) {
            if (gameStats.lastCardWasSpecial) {
                gameStats.specialCardsInARow++;
            } else {
                gameStats.specialCardsInARow = 1;
            }
            gameStats.lastCardWasSpecial = true;
            
            // Check for Special Master achievement
            if (gameStats.specialCardsInARow >= 3 && !achievements.specialMaster) {
                unlockAchievement('special-master', 'Special Card Master');
            }
        } else {
            gameStats.lastCardWasSpecial = false;
            gameStats.specialCardsInARow = 0;
        }
        
        // Handle wild cards
        if (card.type === 'wild' || card.type === 'wild-draw-four') {
            showColorChooser(card, index);
            return;
        }
        
        // Add the card to the discard pile
        discardPile.push(card);
        currentColor = card.color;
        
        // Check for win
        if (playerHand.length === 0) {
            gameActive = false;
            showWinPanel();
            
            // Check achievements
            checkWinAchievements();
            
            return;
        }
        
        // Handle special cards
        handleSpecialCard(card);
    } else {
        gameMessageElement.textContent = "You can't play that card!";
    }
}

// Check if a card can be played
function canPlayCard(card, topCard, currentColor) {
    // Wild cards can always be played
    if (card.type === 'wild' || card.type === 'wild-draw-four') {
        return true;
    }
    
    // Match color or type
    return card.color === currentColor || card.type === topCard.type;
}

// Handle special card effects
function handleSpecialCard(card) {
    switch (card.type) {
        case 'skip':
            gameMessageElement.textContent = "You played a Skip card. AI's turn is skipped.";
            updateGameUI();
            // Player gets another turn
            break;
            
        case 'reverse':
            direction *= -1;
            gameMessageElement.textContent = "You played a Reverse card. It's still your turn.";
            updateGameUI();
            // In a 2-player game, reverse acts like skip
            break;
            
        case 'draw-two':
            // AI draws 2 cards
            for (let i = 0; i < 2; i++) {
                if (deck.length === 0) reshuffleDeck();
                aiHand.push(deck.pop());
            }
            gameMessageElement.textContent = "You played a Draw Two card. AI draws 2 cards and is skipped.";
            updateGameUI();
            // Player gets another turn
            break;
            
        case 'wild-draw-four':
            // AI draws 4 cards
            for (let i = 0; i < 4; i++) {
                if (deck.length === 0) reshuffleDeck();
                aiHand.push(deck.pop());
            }
            gameMessageElement.textContent = "You played a Wild Draw Four card. AI draws 4 cards and is skipped.";
            updateGameUI();
            // Player gets another turn
            break;
            
        default:
            // Regular card or wild
            gameMessageElement.textContent = "You played a card. AI's turn.";
            updateGameUI();
            
            // Switch to AI's turn
            setTimeout(() => {
                currentPlayer = 'ai';
                aiTurn();
            }, 1000);
            break;
    }
}

// Show color chooser for wild cards
function showColorChooser(card, index) {
    colorChooserElement.style.display = 'block';
    
    // Store the card and index for later use
    colorChooserElement.dataset.cardIndex = index;
    colorChooserElement.dataset.cardType = card.type;
}

// Handle color choice for wild cards
function handleColorChoice(color) {
    colorChooserElement.style.display = 'none';
    
    const cardType = colorChooserElement.dataset.cardType;
    
    // Create a new card with the chosen color
    const card = {
        type: cardType,
        color: color,
        displayColor: cardType === 'wild' || cardType === 'wild-draw-four' ? 'wild' : color
    };
    
    // Remove the original wild card from player's hand
    playerHand.splice(parseInt(colorChooserElement.dataset.cardIndex), 1);
    
    // Add the card to the discard pile
    discardPile.push(card);
    currentColor = color;
    
    // Check for win
    if (playerHand.length === 0) {
        gameActive = false;
        showWinPanel();
        return;
    }
    
    // Handle special card effects
    handleSpecialCard(card);
}

// Reshuffle the discard pile into the deck
function reshuffleDeck() {
    if (discardPile.length <= 1) return;
    
    const topCard = discardPile.pop();
    deck = [...discardPile];
    discardPile = [topCard];
    shuffleDeck(deck);
}

// AI's turn
function aiTurn() {
    if (!gameActive || currentPlayer !== 'ai') return;
    
    gameMessageElement.textContent = "AI is thinking...";
    
    // Simulate thinking time
    setTimeout(() => {
        const topCard = discardPile[discardPile.length - 1];
        
        // Find playable cards
        const playableCards = aiHand.filter(card => canPlayCard(card, topCard, currentColor));
        
        if (playableCards.length > 0) {
            // Choose the best card to play
            const cardToPlay = chooseAICard(playableCards);
            const cardIndex = aiHand.findIndex(card => 
                card.type === cardToPlay.type && card.color === cardToPlay.color);
            
            // Remove the card from AI's hand
            aiHand.splice(cardIndex, 1);
            
            // Handle wild cards
            if (cardToPlay.type === 'wild' || cardToPlay.type === 'wild-draw-four') {
                // Choose the most frequent color in AI's hand
                const colorCounts = { red: 0, blue: 0, green: 0, yellow: 0 };
                aiHand.forEach(card => {
                    if (COLORS.includes(card.color)) {
                        colorCounts[card.color]++;
                    }
                });
                
                let bestColor = 'red';
                let maxCount = 0;
                
                for (const color in colorCounts) {
                    if (colorCounts[color] > maxCount) {
                        maxCount = colorCounts[color];
                        bestColor = color;
                    }
                }
                
                cardToPlay.color = bestColor;
                currentColor = bestColor;
                
                gameMessageElement.textContent = `AI played a ${cardToPlay.type} and chose ${bestColor}.`;
            } else {
                currentColor = cardToPlay.color;
                gameMessageElement.textContent = `AI played a ${cardToPlay.color} ${cardToPlay.type}.`;
            }
            
            // Add the card to the discard pile
            discardPile.push(cardToPlay);
            
            // Check for win
            if (aiHand.length === 0) {
                gameActive = false;
                showLosePanel();
                return;
            }
            
            // Handle special cards
            handleAISpecialCard(cardToPlay);
        } else {
            // Draw a card
            if (deck.length === 0) reshuffleDeck();
            
            if (deck.length > 0) {
                const drawnCard = deck.pop();
                aiHand.push(drawnCard);
                
                gameMessageElement.textContent = "AI drew a card. Your turn.";
                
                // Switch to player's turn
                currentPlayer = 'player';
            } else {
                gameMessageElement.textContent = "No cards left to draw! Game ends in a tie.";
                gameActive = false;
            }
        }
        
        updateGameUI();
    }, 1500);
}

// Choose the best card for AI to play
function chooseAICard(playableCards) {
    // Prioritize special cards and high-value cards
    
    // First, try to play action cards
    const actionCards = playableCards.filter(card => 
        SPECIAL_CARDS.includes(card.type) || WILD_CARDS.includes(card.type));
    
    if (actionCards.length > 0) {
        // Prioritize Draw Four, then Draw Two, then other action cards
        const drawFours = actionCards.filter(card => card.type === 'wild-draw-four');
        if (drawFours.length > 0) return drawFours[0];
        
        const drawTwos = actionCards.filter(card => card.type === 'draw-two');
        if (drawTwos.length > 0) return drawTwos[0];
        
        const skips = actionCards.filter(card => card.type === 'skip');
        if (skips.length > 0) return skips[0];
        
        const reverses = actionCards.filter(card => card.type === 'reverse');
        if (reverses.length > 0) return reverses[0];
        
        const wilds = actionCards.filter(card => card.type === 'wild');
        if (wilds.length > 0) return wilds[0];
    }
    
    // If no action cards, play the highest value number card
    const numberCards = playableCards.filter(card => NUMBERS.includes(card.type));
    if (numberCards.length > 0) {
        // Sort by number value (highest first)
        numberCards.sort((a, b) => parseInt(b.type) - parseInt(a.type));
        return numberCards[0];
    }
    
    // If we get here, just play the first playable card
    return playableCards[0];
}

// Handle AI special card effects
function handleAISpecialCard(card) {
    switch (card.type) {
        case 'skip':
            gameMessageElement.textContent = "AI played a Skip card. Your turn is skipped.";
            // AI gets another turn
            setTimeout(() => aiTurn(), 1500);
            break;
            
        case 'reverse':
            direction *= -1;
            gameMessageElement.textContent = "AI played a Reverse card. It's still AI's turn.";
            // In a 2-player game, reverse acts like skip
            setTimeout(() => aiTurn(), 1500);
            break;
            
        case 'draw-two':
            // Player draws 2 cards
            for (let i = 0; i < 2; i++) {
                if (deck.length === 0) reshuffleDeck();
                if (deck.length > 0) {
                    playerHand.push(deck.pop());
                }
            }
            gameMessageElement.textContent = "AI played a Draw Two card. You draw 2 cards and are skipped.";
            // AI gets another turn
            setTimeout(() => aiTurn(), 1500);
            break;
            
        case 'wild-draw-four':
            // Player draws 4 cards
            for (let i = 0; i < 4; i++) {
                if (deck.length === 0) reshuffleDeck();
                if (deck.length > 0) {
                    playerHand.push(deck.pop());
                }
            }
            gameMessageElement.textContent = `AI played a Wild Draw Four and chose ${card.color}. You draw 4 cards and are skipped.`;
            // AI gets another turn
            setTimeout(() => aiTurn(), 1500);
            break;
            
        default:
            // Regular card or wild
            gameMessageElement.textContent = "AI played a card. Your turn.";
            currentPlayer = 'player';
            break;
    }
}

// Show win panel
function showWinPanel() {
    // Update stats
    aiRemainingCountElement.textContent = aiHand.length;
    
    // Hide game area and show win panel
    gameAreaContainer.style.display = 'none';
    winPanel.style.display = 'block';
    
    // Update UI one last time to show final state
    updateGameUI();
}

// Show lose panel
function showLosePanel() {
    // Update stats
    playerRemainingCountElement.textContent = playerHand.length;
    
    // Hide game area and show lose panel
    gameAreaContainer.style.display = 'none';
    losePanel.style.display = 'block';
    
    // Update UI one last time to show final state
    updateGameUI();
}

// Check win-related achievements
function checkWinAchievements() {
    // First Win achievement
    if (!achievements.firstWin) {
        unlockAchievement('first-win', 'First Victory');
    }
    
    // Three Wins achievement
    unlockAchievement('three-wins', 'Experienced Player');
    
    // Comeback achievement
    if (gameStats.maxHandSize >= 10 && !achievements.comeback) {
        unlockAchievement('comeback', 'Comeback King');
    }
    
    // Perfect Game achievement
    if (gameStats.cardsDrawn === 0 && !achievements.perfect) {
        unlockAchievement('perfect', 'Perfect Game');
    }
}

// Start tutorial
function startTutorial() {
    // Hide start panel
    startPanel.style.display = 'none';
    
    // Show game area
    gameAreaContainer.style.display = 'block';
    
    // Show tutorial panel
    tutorialPanel.style.display = 'flex';
    
    // Set up tutorial game
    setupTutorialGame();
    
    // Start tutorial
    tutorialActive = true;
    tutorialStep = 0;
    nextTutorialStep();
}

// Set up a predefined tutorial game
function setupTutorialGame() {
    // Reset game state
    deck = [];
    discardPile = [];
    playerHand = [];
    aiHand = [];
    
    // Create a predefined deck for tutorial
    deck = createDeck();
    shuffleDeck(deck);
    
    // Set up player's hand with specific cards for tutorial
    playerHand = [
        { color: 'red', type: '5', displayColor: 'red' },
        { color: 'blue', type: '5', displayColor: 'blue' },
        { color: 'green', type: '9', displayColor: 'green' },
        { color: 'yellow', type: '2', displayColor: 'yellow' },
        { color: 'red', type: 'skip', displayColor: 'red' },
        { color: 'wild', type: 'wild', displayColor: 'wild' }
    ];
    
    // Set up AI's hand
    aiHand = [
        { color: 'red', type: '3', displayColor: 'red' },
        { color: 'blue', type: '7', displayColor: 'blue' },
        { color: 'green', type: '4', displayColor: 'green' },
        { color: 'yellow', type: '8', displayColor: 'yellow' },
        { color: 'blue', type: 'reverse', displayColor: 'blue' }
    ];
    
    // Start with a red 7 on the discard pile
    discardPile = [{ color: 'red', type: '7', displayColor: 'red' }];
    currentColor = 'red';
    
    // Set starting player to player
    currentPlayer = 'player';
    direction = 1;
    gameActive = true;
    
    // Save the tutorial cards for reference
    tutorialCards = [...playerHand];
    
    // Update UI
    updateGameUI();
    gameMessageElement.textContent = "Tutorial mode: Follow the instructions below.";
}

// Tutorial steps
function nextTutorialStep() {
    tutorialStep++;
    
    switch(tutorialStep) {
        case 1:
            tutorialTitle.textContent = "Welcome to UNO!";
            tutorialText.textContent = "In UNO, your goal is to be the first to get rid of all your cards. Let's learn how to play!";
            break;
            
        case 2:
            tutorialTitle.textContent = "The Discard Pile";
            tutorialText.textContent = "This is the discard pile. You must play a card that matches either the color or number/symbol of the top card.";
            break;
            
        case 3:
            tutorialTitle.textContent = "Your Hand";
            tutorialText.textContent = "These are your cards. Click on a card that matches the top card of the discard pile to play it.";
            break;
            
        case 4:
            tutorialTitle.textContent = "Play a Card";
            tutorialText.textContent = "Try playing a card that matches the red 7 on the discard pile. You can match by color (red) or number (7).";
            break;
            
        case 5:
            tutorialTitle.textContent = "Special Cards";
            tutorialText.textContent = "Special cards like Skip, Reverse, and Draw Two have special effects. Try playing the red Skip card.";
            break;
            
        case 6:
            tutorialTitle.textContent = "Wild Cards";
            tutorialText.textContent = "Wild cards can be played on any color. After playing a wild card, you choose the next color. Try playing your Wild card.";
            break;
            
        case 7:
            tutorialTitle.textContent = "Choose a Color";
            tutorialText.textContent = "When you play a Wild card, you need to choose the next color. Pick any color!";
            break;
            
        case 8:
            tutorialTitle.textContent = "Drawing Cards";
            tutorialText.textContent = "If you don't have a playable card, you must draw from the deck. Click on the deck to draw a card.";
            break;
            
        case 9:
            tutorialTitle.textContent = "AI's Turn";
            tutorialText.textContent = "After your turn, the AI will play. The goal is to be the first to get rid of all your cards.";
            break;
            
        case 10:
            tutorialTitle.textContent = "Ready to Play!";
            tutorialText.textContent = "You've learned the basics of UNO! Click 'Next' to start a real game against the AI.";
            break;
            
        case 11:
            endTutorial();
            startGameFromPanel();
            break;
    }
}

// End tutorial
function endTutorial() {
    tutorialActive = false;
    tutorialPanel.style.display = 'none';
}

// When the page loads, show the start panel instead of starting a game
window.addEventListener('load', function() {
    startPanel.style.display = 'block';
    gameAreaContainer.style.display = 'none';
    initAchievements();
});

// Show puzzles panel
function showPuzzlesPanel() {
    startPanel.style.display = 'none';
    puzzlesPanel.style.display = 'block';
    puzzleCompletePanel.style.display = 'none';
    gameAreaContainer.style.display = 'none';
    
    // Load puzzle completion status
    loadPuzzleStatus();
}

// Back to main menu
function backToMainMenu() {
    puzzlesPanel.style.display = 'none';
    startPanel.style.display = 'block';
}

// Load puzzle status
function loadPuzzleStatus() {
    // Load from localStorage if available
    const savedPuzzles = localStorage.getItem('unoPuzzles');
    if (savedPuzzles) {
        puzzlesCompleted = JSON.parse(savedPuzzles);
    }
    
    // Update UI
    puzzlesCompleted.forEach((completed, index) => {
        const puzzleItem = document.querySelector(`.puzzle-item[data-puzzle="${index + 1}"]`);
        const puzzleStatus = document.getElementById(`puzzle-status-${index + 1}`);
        
        if (completed) {
            puzzleItem.classList.add('completed');
            puzzleStatus.textContent = '✅';
        } else {
            puzzleItem.classList.remove('completed');
            puzzleStatus.textContent = '⭐';
        }
    });
}

// Save puzzle status
function savePuzzleStatus() {
    localStorage.setItem('unoPuzzles', JSON.stringify(puzzlesCompleted));
}

// Load a specific puzzle
function loadPuzzle(puzzleId) {
    currentPuzzle = puzzleId;
    puzzleActive = true;
    puzzleMoves = 0;
    
    // Hide puzzles panel
    puzzlesPanel.style.display = 'none';
    
    // Show puzzle instructions
    puzzleInstructions.style.display = 'flex';
    
    // Set up puzzle based on ID
    switch(puzzleId) {
        case 1:
            puzzleTitle.textContent = "Puzzle 1: The Perfect Play";
            puzzleText.textContent = "You have one chance to win. Find the red card that will let you win in a single move! Hint: Look for a card that matches the discard pile.";
            puzzleMaxMoves = 1;
            break;
            
        case 2:
            puzzleTitle.textContent = "Puzzle 2: Color Strategy";
            puzzleText.textContent = "Use your wild card to set up a winning move. Hint: Choose a color that matches your other cards.";
            puzzleMaxMoves = 2;
            break;
            
        case 3:
            puzzleTitle.textContent = "Puzzle 3: Special Card Challenge";
            puzzleText.textContent = "The AI has one red card left! Use your special cards to prevent the AI from winning. Hint: Any red special card will work.";
            puzzleMaxMoves = 3;
            break;
    }
}

// Start the puzzle
function startPuzzle() {
    // Hide instructions
    puzzleInstructions.style.display = 'none';
    
    // Show game area
    gameAreaContainer.style.display = 'block';
    
    // Set up the puzzle scenario
    setupPuzzleGame(currentPuzzle);
}

// Set up a puzzle game
function setupPuzzleGame(puzzleId) {
    // Reset game state
    deck = [];
    discardPile = [];
    playerHand = [];
    aiHand = [];
    
    // Create a basic deck
    deck = createDeck();
    shuffleDeck(deck);
    
    // Set up specific puzzle scenarios
    switch(puzzleId) {
        case 1:
            // Puzzle 1: Win in one move (EASIER VERSION)
            playerHand = [
                { color: 'red', type: '5', displayColor: 'red' },
                { color: 'blue', type: '7', displayColor: 'blue' },
                { color: 'green', type: '2', displayColor: 'green' },
                { color: 'red', type: 'skip', displayColor: 'red' }, // Changed to red skip
                { color: 'yellow', type: 'draw-two', displayColor: 'yellow' }
            ];
            
            aiHand = [
                { color: 'blue', type: '3', displayColor: 'blue' },
                { color: 'green', type: '9', displayColor: 'green' }
            ];
            
            discardPile = [{ color: 'red', type: '9', displayColor: 'red' }];
            currentColor = 'red';
            break;
            
        case 2:
            // Puzzle 2: Use wild card strategically (EASIER VERSION)
            playerHand = [
                { color: 'wild', type: 'wild', displayColor: 'wild' },
                { color: 'blue', type: '4', displayColor: 'blue' },
                { color: 'green', type: '4', displayColor: 'green' }
            ];
            
            aiHand = [
                { color: 'red', type: '2', displayColor: 'red' },
                { color: 'blue', type: '9', displayColor: 'blue' },
                { color: 'green', type: '1', displayColor: 'green' }
            ];
            
            discardPile = [{ color: 'yellow', type: '2', displayColor: 'yellow' }];
            currentColor = 'yellow';
            break;
            
        case 3:
            // Puzzle 3: Prevent AI from winning (EASIER VERSION)
            playerHand = [
                { color: 'red', type: 'skip', displayColor: 'red' },
                { color: 'red', type: 'reverse', displayColor: 'red' }, // Changed to red reverse
                { color: 'red', type: 'draw-two', displayColor: 'red' }, // Changed to red draw-two
                { color: 'wild', type: 'wild-draw-four', displayColor: 'wild' }
            ];
            
            aiHand = [
                { color: 'red', type: '7', displayColor: 'red' }
            ];
            
            discardPile = [{ color: 'red', type: '3', displayColor: 'red' }];
            currentColor = 'red';
            break;
    }
    
    // Set starting player to player
    currentPlayer = 'player';
    direction = 1;
    gameActive = true;
    
    // Update UI
    updateGameUI();
    gameMessageElement.textContent = "Puzzle mode: Find the solution!";
}

// Check if puzzle is completed
function checkPuzzleCompletion() {
    if (!puzzleActive) return false;
    
    // Check if player has won
    if (playerHand.length === 0) {
        // Mark puzzle as completed
        puzzlesCompleted[currentPuzzle - 1] = true;
        savePuzzleStatus();
        
        // Show completion panel
        showPuzzleCompletePanel();
        return true;
    }
    
    // Check if moves exceeded
    if (puzzleMoves >= puzzleMaxMoves && playerHand.length > 0) {
        gameMessageElement.textContent = "Puzzle failed! Try again with fewer moves.";
        
        // Reset puzzle after a delay
        setTimeout(() => {
            setupPuzzleGame(currentPuzzle);
            puzzleMoves = 0;
        }, 3000);
        
        return false;
    }
    
    return false;
}

// Show puzzle complete panel
function showPuzzleCompletePanel() {
    gameAreaContainer.style.display = 'none';
    puzzleCompletePanel.style.display = 'block';
    
    // Set message based on puzzle
    switch(currentPuzzle) {
        case 1:
            puzzleCompleteMessage.textContent = "Perfect! You found the winning move.";
            break;
        case 2:
            puzzleCompleteMessage.textContent = "Great strategy! You used the wild card perfectly.";
            break;
        case 3:
            puzzleCompleteMessage.textContent = "Excellent! You prevented the AI from winning and claimed victory.";
            break;
    }
}

// Load next puzzle
function loadNextPuzzle() {
    const nextPuzzle = currentPuzzle + 1;
    if (nextPuzzle <= 3) {
        loadPuzzle(nextPuzzle);
    } else {
        showPuzzlesPanel();
    }
}

// Override playCard function for puzzle mode
const originalPuzzlePlayCard = playCard;
playCard = function(index) {
    if (puzzleActive) {
        // Count the move
        puzzleMoves++;
        
        // Use the original function
        originalPuzzlePlayCard(index);
        
        // Check for puzzle completion
        checkPuzzleCompletion();
    } else {
        // Use the original function for normal gameplay
        originalPuzzlePlayCard(index);
    }
}; 