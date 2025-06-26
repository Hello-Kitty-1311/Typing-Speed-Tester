const textDisplay = document.getElementById('textDisplay');
const textInput = document.getElementById('textInput');
const timeEl = document.getElementById('time');
const wpmEl = document.getElementById('wpm');
const cpmEl = document.getElementById('cpm');
const accuracyEl = document.getElementById('accuracy');
const streakEl = document.getElementById('streak');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const pauseBtn = document.getElementById('pauseBtn');
const themeBtn = document.getElementById('themeBtn');
const resultEl = document.getElementById('result');
const historyEl = document.getElementById('history');
const personalBestEl = document.getElementById('personalBest');
const progressFill = document.getElementById('progressFill');
const timerSelect = document.getElementById('timerSelect');
const difficultySelect = document.getElementById('difficultySelect');

const easyTexts = [
    "The quick brown fox jumps over the lazy dog.",
    "Life is like riding a bicycle. To keep your balance, you must keep moving.",
    "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    "Everything you can imagine is real if you believe in yourself.",
    "The only way to do great work is to love what you do.",
    "Practice makes perfect, but perfection takes time and dedication.",
    "Every journey begins with a single step forward.",
    "Small progress is still progress worth celebrating.",
    "The best way to predict the future is to create it yourself.",
    "Your attitude determines your direction in life."
];

const mediumTexts = [
    "Programming is the art of telling another human what one wants the computer to do efficiently and effectively.",
    "Innovation distinguishes between a leader and a follower in the modern technological world we live in.",
    "The future belongs to those who believe in the beauty of their dreams and pursue them with determination.",
    "Change is the law of life, and those who look only to the past or present are certain to miss the future ahead.",
    "Education is not the learning of facts, but the training of the mind to think analytically and critically.",
    "Technology is best when it brings people together to share experiences and create memories.",
    "Success in the digital age requires constant adaptation and willingness to learn new skills.",
    "The best innovations come from understanding both technology and human psychology.",
    "Creativity is intelligence having fun while solving complex problems.",
    "Great design is not just what it looks like, but how it works for users."
];

const hardTexts = [
    "The synthesis of artificial consciousness represents one of the most ambitious and controversial goals in the field of artificial intelligence and cognitive science.",
    "Quantum entanglement is a physical phenomenon that occurs when pairs or groups of particles are generated, interact, or share spatial proximity in ways such that the quantum state of each particle cannot be described independently.",
    "The philosophical implications of technological singularity raise profound questions about the future of human consciousness and the nature of intelligence itself.",
    "The complexity of cryptographic algorithms relies on mathematical principles that ensure secure communication in an era of unprecedented digital interconnectivity.",
    "The intricate relationship between epigenetic modifications and environmental factors demonstrates the remarkable plasticity of genetic expression in living organisms.",
    "The convergence of nanotechnology and biotechnology presents unprecedented opportunities for advancing medical treatments and human enhancement.",
    "The anthropogenic impact on global climate systems necessitates a comprehensive understanding of complex atmospheric and oceanic interactions.",
    "The emergence of decentralized autonomous organizations challenges traditional paradigms of corporate governance and economic systems.",
    "The integration of quantum computing in cryptographic systems may revolutionize current security protocols and data protection methods.",
    "The development of brain-computer interfaces raises ethical considerations regarding the boundaries between human cognition and artificial systems."
];

let timeLeft;
let timeInterval = null;
let charIndex = 0;
let mistakes = 0;
let isTyping = false;
let currentStreak = 0;
let maxStreak = 0;
let isPaused = false;
let personalBest = JSON.parse(localStorage.getItem('personalBest')) || {
    wpm: 0,
    accuracy: 0,
    streak: 0,
    totalTests: 0,
    averageWPM: 0
};
let testHistory = JSON.parse(localStorage.getItem('testHistory')) || [];
let isDarkTheme = localStorage.getItem('isDarkTheme') === 'true';
let typingSound = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU');

function getTexts() {
    const texts = {
        easy: easyTexts,
        medium: mediumTexts,
        hard: hardTexts
    }[difficultySelect.value];
    return texts.sort(() => Math.random() - 0.5);
}

function loadText() {
    const texts = getTexts();
    const textIndex = Math.floor(Math.random() * texts.length);
    textDisplay.innerHTML = texts[textIndex].split('').map(char => 
        `<span>${char}</span>`
    ).join('');
    textDisplay.querySelectorAll('span')[0].classList.add('current');
    textInput.value = '';
    resetStats();
}

function resetStats() {
    charIndex = 0;
    mistakes = 0;
    isTyping = false;
    currentStreak = 0;
    maxStreak = 0;
    updateProgressBar();
    updateStats();
}

function initTyping() {
    if (isPaused) return;
    
    const characters = textDisplay.querySelectorAll('span');
    const typedChar = textInput.value.charAt(charIndex);
    
    if (charIndex < characters.length) {
        if (!isTyping && typedChar) {
            startTypingTest();
        }

        if (typedChar == null) {
            handleBackspace(characters);
        } else {
            handleCharacterTyping(characters, typedChar);
        }

        updateStats();
        updateProgressBar();
        playTypingSound();
    } else {
        finishTest();
    }
}

function startTypingTest() {
    timeLeft = parseInt(timerSelect.value);
    timeInterval = setInterval(initTimer, 1000);
    isTyping = true;
}

function handleBackspace(characters) {
    if (charIndex > 0) {
        charIndex--;
        if (characters[charIndex].classList.contains('incorrect')) {
            mistakes--;
        }
        characters[charIndex].classList.remove('correct', 'incorrect');
        characters[charIndex].classList.add('current');
        currentStreak = 0;
    }
}

function handleCharacterTyping(characters, typedChar) {
    const isCorrect = characters[charIndex].innerText === typedChar;
    characters[charIndex].classList.add(isCorrect ? 'correct' : 'incorrect');
    
    if (isCorrect) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
    } else {
        mistakes++;
        currentStreak = 0;
        vibrate();
    }
    
    characters[charIndex].classList.remove('current');
    if (charIndex + 1 < characters.length) {
        characters[charIndex + 1].classList.add('current');
    }
    charIndex++;
}

function updateStats() {
    const timeElapsed = parseInt(timerSelect.value) - timeLeft;
    if (timeElapsed === 0) return;

    const totalChars = charIndex;
    const netWPM = Math.round(((totalChars / 5) / timeElapsed) * 60);
    const grossWPM = Math.round(((totalChars + mistakes) / 5 / timeElapsed) * 60);
    const cpm = Math.round((totalChars / timeElapsed) * 60);
    const accuracy = Math.round(((totalChars - mistakes) / totalChars) * 100) || 0;

    wpmEl.innerText = netWPM || 0;
    cpmEl.innerText = cpm || 0;
    accuracyEl.innerText = accuracy;
    streakEl.innerText = maxStreak;
}

function updateProgressBar() {
    const progress = (charIndex / textDisplay.querySelectorAll('span').length) * 100;
    progressFill.style.width = `${progress}%`;
}

function initTimer() {
    if (isPaused) return;
    
    if (timeLeft > 0) {
        timeLeft--;
        timeEl.innerText = timeLeft;
        updateProgressBar();
        if (timeLeft <= 5) {
            timeEl.style.color = 'var(--error-color)';
        }
    } else {
        finishTest();
    }
}

function finishTest() {
    clearInterval(timeInterval);
    textInput.disabled = true;
    
    const result = {
        wpm: parseInt(wpmEl.innerText),
        cpm: parseInt(cpmEl.innerText),
        accuracy: parseInt(accuracyEl.innerText),
        streak: maxStreak,
        difficulty: difficultySelect.value,
        time: parseInt(timerSelect.value),
        date: new Date().toLocaleString()
    };
    
    updatePersonalBest(result);
    updateTestHistory(result);
    showResult(result);
    saveToLocalStorage();
    
    if (result.wpm > personalBest.averageWPM) {
        playSuccessSound();
    }
}

function updatePersonalBest(result) {
    if (result.wpm > personalBest.wpm) {
        personalBest.wpm = result.wpm;
    }
    if (result.accuracy > personalBest.accuracy) {
        personalBest.accuracy = result.accuracy;
    }
    if (result.streak > personalBest.streak) {
        personalBest.streak = result.streak;
    }
    
    personalBest.totalTests = (personalBest.totalTests || 0) + 1;
    personalBest.averageWPM = Math.round(((personalBest.averageWPM || 0) * (personalBest.totalTests - 1) + result.wpm) / personalBest.totalTests);
    
    updatePersonalBestDisplay();
}

function updatePersonalBestDisplay() {
    personalBestEl.innerHTML = `
        <div>Best WPM: ${personalBest.wpm}</div>
        <div>Best Accuracy: ${personalBest.accuracy}%</div>
        <div>Best Streak: ${personalBest.streak}</div>
        <div>Total Tests: ${personalBest.totalTests}</div>
        <div>Average WPM: ${personalBest.averageWPM}</div>
    `;
}

function updateTestHistory(result) {
    testHistory.unshift(result);
    if (testHistory.length > 10) testHistory.pop();
    updateHistoryDisplay();
}

function showResult(result) {
    const improvement = result.wpm > personalBest.averageWPM ? '🎯 New Personal Best!' : '';
    const medal = getMedal(result.wpm);
    resultEl.innerHTML = `
        Test Complete! ${improvement} ${medal}<br>
        Speed: ${result.wpm} WPM | 
        Accuracy: ${result.accuracy}% | 
        Streak: ${result.streak} | 
        Level: ${result.difficulty}
    `;
}

function getMedal(wpm) {
    if (wpm >= 100) return '🏆';
    if (wpm >= 80) return '🥇';
    if (wpm >= 60) return '🥈';
    if (wpm >= 40) return '🥉';
    return '🎯';
}

function updateHistoryDisplay() {
    historyEl.innerHTML = testHistory
        .map((result, index) => `
            <div class="history-item">
                Test ${index + 1}: ${result.wpm} WPM, 
                ${result.accuracy}% accuracy, 
                ${result.streak} streak, 
                ${result.difficulty} level
                ${getMedal(result.wpm)}
                (${result.date})
            </div>
        `)
        .join('');
}

function togglePause(e) {
    if (e && e.shiftKey && e.key === 'Enter' || !e) {
        isPaused = !isPaused;
        pauseBtn.innerText = isPaused ? 'Resume' : 'Pause';
        textInput.disabled = isPaused;
        
        if (isPaused) {
            clearInterval(timeInterval);
            textDisplay.style.opacity = '0.7';
        } else {
            timeInterval = setInterval(initTimer, 1000);
            textDisplay.style.opacity = '1';
        }
    }
}

function resetTest() {
    clearInterval(timeInterval);
    timeLeft = parseInt(timerSelect.value);
    timeEl.innerText = timeLeft;
    timeEl.style.color = 'var(--text-color)';
    textInput.disabled = false;
    textDisplay.style.opacity = '1';
    pauseBtn.innerText = 'Pause';
    resultEl.innerHTML = '';
    resetStats();
    loadText();
}

function toggleTheme() {
    isDarkTheme = !isDarkTheme;
    document.body.setAttribute('data-theme', isDarkTheme ? 'dark' : 'light');
    localStorage.setItem('isDarkTheme', isDarkTheme);
}

function saveToLocalStorage() {
    localStorage.setItem('personalBest', JSON.stringify(personalBest));
    localStorage.setItem('testHistory', JSON.stringify(testHistory));
}

function playTypingSound() {
    if (!isPaused) {
        typingSound.currentTime = 0;
        typingSound.play().catch(() => {});
    }
}

function playSuccessSound() {
    const successSound = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU');
    successSound.play().catch(() => {});
}

function vibrate() {
    if (navigator.vibrate) {
        navigator.vibrate(50);
    }
}

function init() {
    document.body.setAttribute('data-theme', isDarkTheme ? 'dark' : 'light');
    updatePersonalBestDisplay();
    updateHistoryDisplay();
    loadText();
}

document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        textInput.focus();
        resetTest();
    } else if (e.key === 'Escape') {
        resetTest();
    } else if (e.shiftKey && e.key === 'Enter') {
        e.preventDefault();
        togglePause(e);
    }
});

textInput.addEventListener('input', initTyping);
startBtn.addEventListener('click', () => {
    textInput.focus();
    resetTest();
});
resetBtn.addEventListener('click', resetTest);
pauseBtn.addEventListener('click', () => togglePause());
themeBtn.addEventListener('click', toggleTheme);
timerSelect.addEventListener('change', resetTest);
difficultySelect.addEventListener('change', resetTest);

init();