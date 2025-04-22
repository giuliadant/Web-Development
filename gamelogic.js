// === POPUP START ===
document.getElementById("closePopup").addEventListener("click", function () {
    document.getElementById("Popup").style.display = "none";
});

// === GLOBAL VARIABLES ===
let battlePoints = 0;
let clickPower = 1;
let idlePower = 0;

const Button = document.getElementById("Clicker");
const Counter = document.getElementById("Counter");

let upgrades = {
    vitality: { cost: 100, level: 0, clickBoost: 2 },
    skill: { cost: 250, level: 0, clickBoost: 5 },
    strength: { cost: 400, level: 0, clickBoost: 10 },
    summon: { cost: 400, level: 0, idleBoost: 1 },
    ritual: { cost: 650, level: 0, idleBoost: 5 },
    blade: { cost: 800, level: 0, idleBoost: 10 },
    retire: { cost: 30000, level: 0 },
    bloodlust: { cost: 10000, active: false }
};

// === CORE FUNCTIONS ===
function updateCounter() {
    Counter.textContent = `Battle Points : ${battlePoints}`;
}

function addBP(amount) {
    battlePoints += amount;
    updateCounter();
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function showMessage(msg) {
    const messageBox = document.getElementById("gameMessage");
    if (!messageBox) return;
    messageBox.textContent = msg;
    messageBox.style.opacity = 1;
    clearTimeout(messageBox._timeout);
    messageBox._timeout = setTimeout(() => {
        messageBox.style.opacity = 0;
    }, 3000);
}

function buyUpgrade(id, effect) {
    const upgrade = upgrades[id];
    if (battlePoints >= upgrade.cost) {
        battlePoints -= upgrade.cost;
        upgrade.level++;
        effect();
        updateCounter();
        showMessage(`✅ ${capitalize(id)} upgraded!`);
    } else {
        showMessage(`❌ Not enough BP for ${capitalize(id)}.`);
    }
}

// === CLICK HANDLER ===
Button.addEventListener("click", function () {
    addBP(clickPower);
});

// === MANUAL UPGRADE EVENTS ===
document.getElementById("vitality").addEventListener("click", () => {
    buyUpgrade("vitality", () => {
        clickPower += upgrades.vitality.clickBoost;
    });
});

document.getElementById("skill").addEventListener("click", () => {
    buyUpgrade("skill", () => {
        clickPower += upgrades.skill.clickBoost;
    });
});

document.getElementById("strength").addEventListener("click", () => {
    buyUpgrade("strength", () => {
        clickPower += upgrades.strength.clickBoost;
    });
});

// === IDLE UPGRADE EVENTS ===
document.getElementById("summon").addEventListener("click", () => {
    buyUpgrade("summon", () => {
        idlePower += upgrades.summon.idleBoost;
    });
});

document.getElementById("ritual").addEventListener("click", () => {
    buyUpgrade("ritual", () => {
        idlePower += upgrades.ritual.idleBoost;
    });
});

document.getElementById("blade").addEventListener("click", () => {
    buyUpgrade("blade", () => {
        idlePower += upgrades.blade.idleBoost;
    });
});

// === SPECIAL: BLOODLUST ===
document.getElementById("bloodlust").addEventListener("click", () => {
    buyUpgrade("bloodlust", () => {
        upgrades.bloodlust.active = true;
        showMessage("🩸 Bloodlust Mode activated!");
    });
});

// === PASSIVE INCOME ===
setInterval(() => {
    if (idlePower > 0) {
        addBP(idlePower);
    }
}, 1000);




