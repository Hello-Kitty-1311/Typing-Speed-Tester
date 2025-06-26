const textDisplay = document.getElementById('textDisplay');
const textInput = document.getElementById('textInput');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');

const sampleTexts = [
    "The quick brown fox jumps over the lazy dog.",
    "Life is like riding a bicycle. To keep your balance, you must keep moving."
];

function loadText() {
    const textIndex = Math.floor(Math.random() * sampleTexts.length);
    textDisplay.textContent = sampleTexts[textIndex];
    textInput.value = '';
}

function resetTest() {
    loadText();
}

startBtn.addEventListener('click', () => {
    textInput.focus();
    resetTest();
});

resetBtn.addEventListener('click', resetTest);

loadText();