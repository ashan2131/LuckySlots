// Slot machine symbols with their values
const symbols = [
  { emoji: "🍒", value: 1 },
  { emoji: "🍋", value: 1.5 },
  { emoji: "🍊", value: 2 },
  { emoji: "🍇", value: 2.5 },
  { emoji: "🍉", value: 3 },
  { emoji: "🔔", value: 4 },
  { emoji: "💎", value: 5 },
  { emoji: "7️⃣", value: 10 }
];

// Game state
let balance = 1000;
let currentBet = 10;
let isSpinning = false;
let winAmount = 0;

// DOM elements
const slot1 = document.getElementById('slot1').querySelector('.slot-wrapper');
const slot2 = document.getElementById('slot2').querySelector('.slot-wrapper');
const slot3 = document.getElementById('slot3').querySelector('.slot-wrapper');
const spinButton = document.getElementById('spin-button');
const balanceDisplay = document.getElementById('balance');
const betDisplay = document.getElementById('bet-amount');
const winDisplay = document.getElementById('win');
const messageDisplay = document.getElementById('message');
const betUpButton = document.getElementById('bet-up');
const betDownButton = document.getElementById('bet-down');

// Initialize the slots
function initializeSlots() {
  // Create a long strip of symbols for each slot
  const slotStrip = createSlotStrip(20);
  
  // Populate the slots
  [slot1, slot2, slot3].forEach(slot => {
    slot.innerHTML = slotStrip;
    // Position the strip randomly
    const randomPosition = -Math.floor(Math.random() * 10) * 150;
    slot.style.top = randomPosition + 'px';
  });
}

// Create a strip of random symbols
function createSlotStrip(count) {
  let html = '';
  for (let i = 0; i < count; i++) {
    const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
    html += `<div class="symbol">${randomSymbol.emoji}</div>`;
  }
  return html;
}

// Spin the slots
function spin() {
  if (isSpinning || balance < currentBet) return;
  
  // Deduct bet from balance
  balance -= currentBet;
  balanceDisplay.textContent = balance;
  
  // Reset win display
  winDisplay.textContent = '0';
  messageDisplay.textContent = '';
  messageDisplay.classList.remove('win-animation');
  document.querySelector('.slot-machine').classList.remove('jackpot-animation');
  
  isSpinning = true;
  spinButton.disabled = true;
  betUpButton.disabled = true;
  betDownButton.disabled = true;
  
  // Create new slot strips
  const newSlotStrip = createSlotStrip(20);
  [slot1, slot2, slot3].forEach(slot => {
    slot.innerHTML = newSlotStrip;
  });
  
  // Generate random stopping positions
  const results = [];
  const spinDurations = [1000, 1500, 2000]; // Different durations for each reel
  
  // Spin each slot with different timing
  [slot1, slot2, slot3].forEach((slot, index) => {
    // Random number of symbols to scroll (between 10 and 15)
    const symbolsToScroll = 10 + Math.floor(Math.random() * 6);
    const stopPosition = -symbolsToScroll * 150;
    
    // Animate the spin
    setTimeout(() => {
      slot.style.transition = `top ${spinDurations[index]/1000}s cubic-bezier(0.1, 0.7, 0.5, 1)`;
      slot.style.top = stopPosition + 'px';
      
      // Get the result symbol (the one in the middle of the view)
      setTimeout(() => {
        const symbolElements = slot.querySelectorAll('.symbol');
        const middleSymbolIndex = symbolsToScroll;
        const middleSymbol = symbolElements[middleSymbolIndex].textContent;
        results.push(middleSymbol);
        
        // Check for win after all slots have stopped
        if (index === 2) {
          setTimeout(checkWin, 300, results);
        }
      }, spinDurations[index]);
    }, index * 300); // Stagger the start of each spin
  });
  
  // Play spin sound
  playSound('spin');
}

// Check for winning combinations
function checkWin(results) {
  const [symbol1, symbol2, symbol3] = results;
  winAmount = 0;
  
  // Find the value of the symbols
  const value1 = symbols.find(s => s.emoji === symbol1)?.value || 0;
  const value2 = symbols.find(s => s.emoji === symbol2)?.value || 0;
  const value3 = symbols.find(s => s.emoji === symbol3)?.value || 0;
  
  // Check for matches
  if (symbol1 === symbol2 && symbol2 === symbol3) {
    // Jackpot - all three match
    winAmount = currentBet * value1 * 10;
    messageDisplay.textContent = 'JACKPOT! 🎉';
    messageDisplay.classList.add('win-animation');
    document.querySelector('.slot-machine').classList.add('jackpot-animation');
    playSound('jackpot');
  } else if (symbol1 === symbol2 || symbol2 === symbol3 || symbol1 === symbol3) {
    // Two matching symbols
    const matchValue = symbol1 === symbol2 ? value1 : (symbol2 === symbol3 ? value2 : value1);
    winAmount = currentBet * matchValue * 2;
    messageDisplay.textContent = 'Winner! 🎉';
    messageDisplay.classList.add('win-animation');
    playSound('win');
  } else {
    messageDisplay.textContent = 'Try again!';
    playSound('lose');
  }
  
  // Update balance and win display
  if (winAmount > 0) {
    balance += winAmount;
    balanceDisplay.textContent = balance;
    winDisplay.textContent = winAmount;
  }
  
  // Reset game state
  isSpinning = false;
  spinButton.disabled = false;
  betUpButton.disabled = false;
  betDownButton.disabled = false;
}

// Increase bet
function increaseBet() {
  if (currentBet < 100 && currentBet < balance) {
    currentBet += 10;
    betDisplay.textContent = currentBet;
  }
}

// Decrease bet
function decreaseBet() {
  if (currentBet > 10) {
    currentBet -= 10;
    betDisplay.textContent = currentBet;
  }
}

// Simple sound effects (using AudioContext API)
function playSound(type) {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  switch(type) {
    case 'spin':
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.2);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.2);
      break;
    case 'win':
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.3);
      break;
    case 'jackpot':
      // Play a sequence of notes for jackpot
      for (let i = 0; i < 8; i++) {
        const noteOscillator = audioContext.createOscillator();
        const noteGain = audioContext.createGain();
        
        noteOscillator.connect(noteGain);
        noteGain.connect(audioContext.destination);
        
        noteOscillator.type = 'square';
        noteOscillator.frequency.setValueAtTime(300 + (i * 100), audioContext.currentTime + (i * 0.1));
        noteGain.gain.setValueAtTime(0.1, audioContext.currentTime + (i * 0.1));
        noteGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + (i * 0.1) + 0.1);
        
        noteOscillator.start(audioContext.currentTime + (i * 0.1));
        noteOscillator.stop(audioContext.currentTime + (i * 0.1) + 0.1);
      }
      break;
    case 'lose':
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.2);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.2);
      break;
  }
}

// Event listeners
spinButton.addEventListener('click', spin);
betUpButton.addEventListener('click', increaseBet);
betDownButton.addEventListener('click', decreaseBet);

// Initialize the game
initializeSlots();
balanceDisplay.textContent = balance;
betDisplay.textContent = currentBet;
