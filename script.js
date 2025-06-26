const textDisplay = document.getElementById('textDisplay');
const textInput = document.getElementById('textInput');
const timeEl = document.getElementById('time');
const wpmEl = document.getElementById('wpm');
const cpmEl = document.getElementById('cpm');
const accuracyEl = document.getElementById('accuracy');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const resultEl = document.getElementById('result');

const sampleTexts = [
    "The quick brown fox jumps over the lazy dog.",
    "Life is like riding a bicycle. To keep your balance, you must keep moving.",
    "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    "Everything you can imagine is real if you believe in yourself.",
    "The only way to do great work is to love what you do."
];

let timeLeft = 60;
let timeInterval = null;
let charIndex = 0;
let mistakes = 0;
let isTyping = false;

function loadText() {
    const textIndex = Math.floor(Math.random() * sampleTexts.length);
    textDisplay.innerHTML = sampleTexts[textIndex].split('').map(char => 
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
    updateStats();
}

function updateStats() {
    const timeElapsed = 60 - timeLeft;
    if (timeElapsed === 0) return;

    const totalChars = charIndex;
    const netWPM = Math.round(((totalChars / 5) / timeElapsed) * 60);
    const cpm = Math.round((totalChars / timeElapsed) * 60);
    const accuracy = Math.round(((totalChars - mistakes) / totalChars) * 100) || 0;

    wpmEl.innerText = netWPM || 0;
    cpmEl.innerText = cpm || 0;
    accuracyEl.innerText = accuracy;
}

function resetTest() {
    clearInterval(timeInterval);
    timeLeft = 60;
    timeEl.innerText = timeLeft;
    textInput.disabled = false;
    resultEl.innerHTML = '';
    resetStats();
    loadText();
}

startBtn.addEventListener('click', () => {
    textInput.focus();
    resetTest();
});

resetBtn.addEventListener('click', resetTest);

loadText();