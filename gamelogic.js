document.getElementById("closePopup").addEventListener("click", function() //popup closes when Start Training button is pressed
{document.getElementById("Popup").style.display="none"});


//declaring variables
const Button = document.getElementById("Clicker");
const Counter = document.getElementById("Counter");

let points =  0
//skill points display

Button.addEventListener("click", function() {
    points++;
    Counter.innerText = "Battle Points : " + points;
})

function knightSay(message) {
    const speech = document.getElementById("knightSpeech");
    speech.textContent = message;
    speech.style.opacity = 1;

    setTimeout(() => {
        speech.style.opacity = 0;
    }, 2500);
}

//need to modify upgrades to be clicked only when enough points are available
document.getElementById("skill").addEventListener("click", () => {
    // Your upgrade logic
    knightSay("🌀 Skill unlocked!");
});

document.getElementById("vitality").addEventListener("click", () => {
    knightSay("🛡️ Vitality increased.");
});

document.getElementById("ritual").addEventListener("click", () => {
    knightSay("🩸 Blood Ritual complete.");
});









