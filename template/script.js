
function setup() {
    noCanvas();
}

const startButton = document.getElementById("start-button");
const gameStatus = document.getElementById("game-status");

if (!(startButton instanceof HTMLButtonElement) || !(gameStatus instanceof HTMLParagraphElement)) {
    throw new Error("The start button or game status message is missing.");
}

startButton.addEventListener("click", () => {
    gameStatus.hidden = false;
});