// === POPUP START ===
document.getElementById("closePopup").addEventListener("click", function () {
    document.getElementById("Popup").style.display = "none";
});

// === GLOBAL VARIABLES ===
let battlePoints = 0;
let clickPower = 1;
let idlePower = 0;
let permanentBoost = 0; // Flat bonus per click, increases by 1 per ascension
let totalUpgradesPurchased = 0;
let hasActivatedBloodlust = false;
let hasAscended = false;
let clicks = 0; // Track total clicks
let idleTime = 0; // Track idle time in seconds
let lastInteraction = Date.now(); // Timestamp of last user interaction
let idleInterval; // Make idleInterval accessible to stop it

const Button = document.getElementById("Clicker");
const Counter = document.getElementById("Counter");

let upgrades = {
    vitality: { cost: 100, level: 0, clickBoost: 2 },
    skill: { cost: 250, level: 0, clickBoost: 5 },
    strength: { cost: 400, level: 0, clickBoost: 10 },
    summon: { cost: 600, level: 0, idleBoost: 1 },
    ritual: { cost: 850, level: 0, idleBoost: 5 },
    blade: { cost: 1000, level: 0, idleBoost: 10 },
    ascend: { cost: 250000, level: 0 },
    bloodlust: { cost: 10000, active: false }
};

// === MESSAGE QUEUE ===
const messageQueue = [];
let isShowingMessage = false;

function showMessage(msg) {
    const messageBox = document.getElementById("gameMessage");
    if (!messageBox) return;

    messageQueue.push(msg);
    if (isShowingMessage) return;
    displayNextMessage(messageBox);
}

function displayNextMessage(messageBox) {
    if (messageQueue.length === 0) {
        isShowingMessage = false;
        return;
    }

    isShowingMessage = true;
    messageBox.textContent = messageQueue.shift();
    messageBox.style.opacity = 1;

    setTimeout(() => {
        messageBox.style.opacity = 0;
        setTimeout(() => {
            displayNextMessage(messageBox);
        }, 300);
    }, 3000);
}

// === CORE FUNCTIONS ===
function updateCounter() {
    console.log(`Updating counter: battlePoints=${battlePoints}, permanentBoost=${permanentBoost}, idlePower=${idlePower}`);
    Counter.textContent = `Battle Points: ${battlePoints}`;
    checkAchievements();
}

function addBP(amount) {
    const totalAmount = amount + permanentBoost; // Add flat bonus per click
    battlePoints += totalAmount;
    console.log(`Adding BP: amount=${amount}, permanentBoost=${permanentBoost}, totalAmount=${totalAmount}, battlePoints=${battlePoints}`);
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// === ACHIEVEMENT FUNCTIONS ===
function markAchievementAsCompleted(achievementId, achievementName) {
    const achievementElement = document.getElementById(achievementId);
    if (achievementElement && achievementElement.dataset.achieved === "false") {
        achievementElement.dataset.achieved = "true";
        achievementElement.classList.add("completed");
        showMessage(`🏆 Achievement Unlocked: ${achievementName}!`);
        console.log(`Achievement marked as completed: ${achievementName}`);
    } else {
        console.log(`Achievement ${achievementName} not marked: element=${achievementElement}, achieved=${achievementElement?.dataset.achieved}`);
    }
}

function checkAchievements() {
    if (totalUpgradesPurchased >= 1) {
        markAchievementAsCompleted("achievement1", "First Step");
    }

    if (battlePoints >= 1000) {
        markAchievementAsCompleted("achievement2", "Battle Novice");
    }

    if (clicks >= 1000) {
        markAchievementAsCompleted("achievement3", "Tapping into Madness");
    }

    if (battlePoints >= 5000) {
        markAchievementAsCompleted("achievement4", "Warlord");
    }

    if (totalUpgradesPurchased >= 10) {
        markAchievementAsCompleted("achievement5", "Tinkerer's Touch");
    }

    if (hasActivatedBloodlust) {
        markAchievementAsCompleted("achievement6", "Bloodlust Unleashed");
    }

    if (idleTime >= 600) { // 10 minutes = 600 seconds
        markAchievementAsCompleted("achievement7", "Meditator");
    }

    if (hasAscended) {
        markAchievementAsCompleted("achievement8", "Born Anew");
    }
}

// === INITIALIZE UPGRADE BUTTONS ===
function initializeUpgradeButtons() {
    for (let id in upgrades) {
        const button = document.getElementById(id);
        if (button && (upgrades[id].clickBoost || upgrades[id].idleBoost)) {
            let bonus = upgrades[id].clickBoost
                ? `(+${upgrades[id].clickBoost}/click)`
                : upgrades[id].idleBoost
                    ? `(+${upgrades[id].idleBoost}/s)`
                    : '';
            button.innerHTML = `${button.innerText.split('(')[0].trim()} (Cost: ${upgrades[id].cost} BP)${upgrades[id].idleBoost ? '<br>' : ''}${bonus}`;
        }
    }
}

document.addEventListener("DOMContentLoaded", initializeUpgradeButtons);

// === BUY UPGRADE ===
function buyUpgrade(id, effect) {
    if (battlePoints >= upgrades[id].cost) {
        battlePoints -= upgrades[id].cost;
        upgrades[id].level++;
        totalUpgradesPurchased++;
        resetIdleTime(); // Reset idle time on upgrade purchase

        let idleIncrease = 0;
        if (upgrades[id].idleBoost) {
            idleIncrease = upgrades[id].idleBoost;
        }

        effect();
        upgrades[id].cost = Math.floor(upgrades[id].cost * 1.5);
        const button = document.getElementById(id);
        if (button) {
            let bonus = upgrades[id].clickBoost
                ? `(+${upgrades[id].clickBoost}/click)`
                : upgrades[id].idleBoost
                    ? `(+${upgrades[id].idleBoost}/s)`
                    : '';
            button.innerHTML = `${button.innerText.split('(')[0].trim()} (Cost: ${upgrades[id].cost} BP)${upgrades[id].idleBoost ? '<br>' : ''}${bonus}`;
        }
        updateCounter();
        showMessage(`✅ ${capitalize(id)} upgraded!`);

        if (idleIncrease > 0) {
            showMessage(`🕒 Idle power increased by ${idleIncrease} BP/s!`);
        }
    } else {
        showMessage(`❌ Not enough BP for ${capitalize(id)}.`);
    }
}

// === CLICK HANDLER ===
Button.addEventListener("click", function () {
    console.log(`Before click: battlePoints=${battlePoints}, clickPower=${clickPower}, permanentBoost=${permanentBoost}, idlePower=${idlePower}`);
    clicks++; // Increment click counter
    resetIdleTime(); // Reset idle time on interaction
    addBP(clickPower);
    updateCounter();
    console.log(`After click: battlePoints=${battlePoints}, clicks=${clicks}`);
});

// === IDLE TIME TRACKING ===
function resetIdleTime() {
    lastInteraction = Date.now();
    idleTime = 0;
    console.log("Idle time reset");
}

function updateIdleTime() {
    idleTime = Math.floor((Date.now() - lastInteraction) / 1000);
    console.log(`Idle time: ${idleTime} seconds`);
}

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
        updateIdlePower();
    });
});

document.getElementById("ritual").addEventListener("click", () => {
    buyUpgrade("ritual", () => {
        updateIdlePower();
    });
});

document.getElementById("blade").addEventListener("click", () => {
    buyUpgrade("blade", () => {
        updateIdlePower();
    });
});

// === SPECIAL: BLOODLUST ===
document.getElementById("bloodlust").addEventListener("click", () => {
    buyUpgrade("bloodlust", () => {
        upgrades.bloodlust.active = true;
        hasActivatedBloodlust = true;
        resetIdleTime(); // Reset idle time on bloodlust activation
        showMessage("🩸 Bloodlust Mode activated!");
        checkAchievements();
    });
});

// === ASCEND BUTTON ===
document.getElementById("ascend").addEventListener("click", () => {
    if (battlePoints >= upgrades.ascend.cost) {
        document.getElementById("ascendConfirm").classList.remove("hidden");
    } else {
        showMessage("❌ Not enough BP to Ascend.");
    }
});

document.getElementById("ascendNo").addEventListener("click", () => {
    document.getElementById("ascendConfirm").classList.add("hidden");
});

document.getElementById("ascendYes").addEventListener("click", () => {
    console.log(`Before Ascend: battlePoints=${battlePoints}, clickPower=${clickPower}, idlePower=${idlePower}, permanentBoost=${permanentBoost}, upgrades=${JSON.stringify(upgrades)}`);

    // Stop the idle interval to prevent interference
    clearInterval(idleInterval);

    battlePoints = 0;
    clickPower = 1;
    idlePower = 0;
    clicks = 0; // Reset clicks
    idleTime = 0; // Reset idle time
    lastInteraction = Date.now(); // Reset interaction timestamp
    permanentBoost += 1; // Add +1 BP per click per ascension

    for (let key in upgrades) {
        upgrades[key].level = 0;
        if (upgrades[key].hasOwnProperty('active')) upgrades[key].active = false;
    }

    hasAscended = true;
    updateIdlePower();
    updateCounter();
    document.getElementById("ascendConfirm").classList.add("hidden");
    showMessage(`⚱️ You Ascended! +${permanentBoost} BP per click gained.`);
    initializeUpgradeButtons();
    checkAchievements();

    // Restart idle interval
    idleInterval = setInterval(() => {
        console.log(`Idle Tick: idlePower=${idlePower}, Battle Points=${battlePoints}, idleTime=${idleTime}`);
        runIdleUpgrades();
        updateIdleTime();
    }, 1000);

    console.log(`After Ascend: battlePoints=${battlePoints}, clickPower=${clickPower}, idlePower=${idlePower}, permanentBoost=${permanentBoost}, upgrades=${JSON.stringify(upgrades)}`);
});

// === PASSIVE INCOME ===
function updateIdlePower() {
    idlePower =
        upgrades.summon.level * upgrades.summon.idleBoost +
        upgrades.ritual.level * upgrades.ritual.idleBoost +
        upgrades.blade.level * upgrades.blade.idleBoost;
    console.log(`Updated Idle Power: ${idlePower}`);
}

function runIdleUpgrades() {
    if (idlePower > 0) {
        addBP(idlePower);
        updateCounter();
    }
}

// Start the idle interval
idleInterval = setInterval(() => {
    console.log(`Idle Tick: idlePower=${idlePower}, Battle Points=${battlePoints}, idleTime=${idleTime}`);
    runIdleUpgrades();
    updateIdleTime();
}, 1000);

// === ACHIEVEMENTS TOGGLE ===
const toggleButton = document.getElementById("toggleAchievements");
const achievementsContainer = document.getElementById("achievementsContainer");

toggleButton.addEventListener("click", () => {
    achievementsContainer.classList.toggle("hidden");
    if (achievementsContainer.classList.contains("hidden")) {
        toggleButton.textContent = "Achievements ⚔️";
    } else {
        toggleButton.textContent = "Hide Achievements ⚔️";
    }
    console.log("Achievements panel visibility:", achievementsContainer.classList.contains("hidden") ? "Hidden" : "Visible");
});




