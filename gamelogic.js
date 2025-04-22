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

function showMessage(text) {
    const msg = document.getElementById("gameMessage");
    msg.textContent = text;
    msg.style.opacity = 1;

    clearTimeout(msg._timeout); // prevent stacking messages
    msg._timeout = setTimeout(() => {
        msg.style.opacity = 0;
    }, 3000);
}

document.getElementById("vitality").addEventListener("click", () => {
    showMessage("🛡️ Vitality upgrade unlocked!");
});

document.getElementById("skill").addEventListener("click", () => {
    showMessage("🌀 Skill upgraded!");
});
