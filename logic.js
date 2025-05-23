// Game state variables
let battlePoints = 0,
    clickPower = 1,
    idlePower = 0,
    permanentBoostMultiplier = 1,
    totalUpgradesPurchased = 0,
    hasActivatedBloodlust = false,
    hasAscended = false,
    clicks = 0,
    idleTime = 0,
    lastInteraction = Date.now(),
    suppressNotifications = false,
    ascensionCount = parseInt(localStorage.getItem("ascensionCount")) || 0,
    idleInterval;

function startIdleInterval() {
    clearInterval(idleInterval); // prevent duplicate intervals
    idleInterval = setInterval(() => {
        if (idlePower > 0) {
            addBP(idlePower);
            updateCounter();
        }
        idleTime = Math.floor((Date.now() - lastInteraction) / 1000);
    }, 1000);
}

// Base upgrades costs, used for resetting/recalculating
const baseCosts = {
    vitality: 100,
    skill: 250,
    strength: 400,
    summon: 600,
    ritual: 850,
    blade: 1000,
    ascend: 500000,
    bloodlust: 5000
};


const upgrades = {
    vitality: { cost: 100, level: 0, clickBoost: 2 },
    skill: { cost: 250, level: 0, clickBoost: 5 },
    strength: { cost: 400, level: 0, clickBoost: 10 },
    summon: { cost: 600, level: 0, idleBoost: 1 },
    ritual: { cost: 850, level: 0, idleBoost: 5 },
    blade: { cost: 1000, level: 0, idleBoost: 10 },
    ascend: { cost: 500000, level: 0 },
    bloodlust: { cost: 5000, active: false, level: 0 }
};

// Notification system queue
const messageQueue = [];
let isShowingMessage = false;

document.getElementById("closePopup").addEventListener("click", () => {
    document.getElementById("Popup").style.display = "none";
});

// Push messages to queue and display them
function showMessage(msg) {
    if (suppressNotifications) return;
    messageQueue.push(msg);
    if (isShowingMessage) return;

    const messageBox = document.getElementById("gameMessage");
    if (!messageBox) return;

    isShowingMessage = true;
    displayNextMessage(messageBox);
}

function displayNextMessage(messageBox) {
    if (!messageQueue.length) {
        isShowingMessage = false;
        return;
    }

    messageBox.textContent = messageQueue.shift();
    messageBox.style.opacity = 1;
    setTimeout(() => {
        messageBox.style.opacity = 0;
        setTimeout(() => displayNextMessage(messageBox), 100);
    }, 1500);
}

// Updates counter display and checks for achievements
function updateCounter() {
    document.getElementById("Counter").textContent = `Battle Points: ${battlePoints}`;
    checkAchievements();
}

//Adds BP scaled by boost multiplier and bloodlust mode
function addBP(amount) {
    battlePoints += amount * permanentBoostMultiplier * (upgrades.bloodlust.active ? 20 : 1);
}

//Achievements unlocked
function markAchievement(achievementId, achievementName) {
    const el = document.getElementById(achievementId);
    if (el && el.dataset.achieved === "false") {
        el.dataset.achieved = "true";
        el.classList.add("completed");
        showMessage(`🏆 ${achievementName}!`);
    }
}

// Check achievements requirements
function checkAchievements() {
    if (totalUpgradesPurchased >= 1) markAchievement("achievement1", "First Step");
    if (battlePoints >= 1000) markAchievement("achievement2", "Achiever");
    if (clicks >= 1000) markAchievement("achievement3", "Tapping into Madness");
    if (battlePoints >= 5000) markAchievement("achievement4", "Battle Master");
    if (totalUpgradesPurchased >= 10) markAchievement("achievement5", "Can't Get Enough");
    if (hasActivatedBloodlust) markAchievement("achievement6", "Power Surge");
    if (idleTime >= 600) markAchievement("achievement7", "Take a Break");
    if (hasAscended) markAchievement("achievement8", "Fresh Start");
}

// Buttons with costs and effects
function initializeUpgradeButtons() {
    for (let id in upgrades) {
        const upgrade = upgrades[id], button = document.getElementById(id);
        if (!button || (!upgrade.clickBoost && !upgrade.idleBoost && id !== "bloodlust" && id !== "ascend")) continue;
        const baseText = button.innerText.split('(')[0].trim();
        button.innerHTML = `${baseText} (Cost: ${upgrade.cost} BP) ${upgrade.clickBoost ? `(+${upgrade.clickBoost} BP/click)` : upgrade.idleBoost ? `(+${upgrade.idleBoost} BP/second)` : ''}`;
    }
}

document.addEventListener("DOMContentLoaded", initializeUpgradeButtons);

// Buying an upgrade
function buyUpgrade(id, effect) {
    if (battlePoints >= upgrades[id].cost) {
        battlePoints -= upgrades[id].cost;
        upgrades[id].level++;
        if (id !== "bloodlust") totalUpgradesPurchased++;
        lastInteraction = Date.now();
        idleTime = 0;
        effect();
        upgrades[id].cost = Math.floor(upgrades[id].cost * 1.5);
        const button = document.getElementById(id);
        if (button) {
            const baseText = button.innerText.split('(')[0].trim();
            button.innerHTML = `${baseText} (Cost: ${upgrades[id].cost} BP) ${upgrades[id].clickBoost ? `(+${upgrades[id].clickBoost} BP/click)` : upgrades[id].idleBoost ? `(+${upgrades[id].idleBoost} BP/second)` : ''}`;
        }
        updateCounter();
        if (id !== "bloodlust") showMessage(`✅ ${id.charAt(0).toUpperCase() + id.slice(1)} upgraded!`);
        if (upgrades[id].idleBoost) showMessage(`🕒 Idle power +${upgrades[id].idleBoost} BP/second!`);
    } else {
        showMessage(`❌ Not enough BP for ${id.charAt(0).toUpperCase() + id.slice(1)}.`);
    }
}

// Main clicker
document.getElementById("Clicker").addEventListener("click", () => {
    clicks++;
    lastInteraction = Date.now();
    idleTime = 0;
    addBP(clickPower);
    updateCounter();
});

// Manual upgrades
document.getElementById("vitality").addEventListener("click", () =>
    buyUpgrade("vitality", () => clickPower += upgrades.vitality.clickBoost * (2 ** (upgrades.vitality.level - 1))));

document.getElementById("skill").addEventListener("click", () =>
    buyUpgrade("skill", () => clickPower += upgrades.skill.clickBoost * (2 ** (upgrades.skill.level - 1))));

document.getElementById("strength").addEventListener("click", () =>
    buyUpgrade("strength", () => clickPower += upgrades.strength.clickBoost * (2 ** (upgrades.strength.level - 1))));

// Idle upgrades
document.getElementById("summon").addEventListener("click", () =>
    buyUpgrade("summon", () => {
        updateIdlePower();
        startIdleInterval();
    }));

document.getElementById("ritual").addEventListener("click", () =>
    buyUpgrade("ritual", () => {
        updateIdlePower();
        startIdleInterval();
    }));

document.getElementById("blade").addEventListener("click", () =>
    buyUpgrade("blade", () => {
        updateIdlePower();
        startIdleInterval();
    }));


// Bloodlust mode
document.getElementById("bloodlust").addEventListener("click", () => {
    if (upgrades.bloodlust.active) return showMessage("🩸 Bloodlust Mode is already active!");
    buyUpgrade("bloodlust", () => {
        upgrades.bloodlust.active = true;
        upgrades.bloodlust.level++;
        hasActivatedBloodlust = true;
        document.getElementById("bloodlust").disabled = true;
        lastInteraction = Date.now();
        idleTime = 0;
        showMessage("🩸 Bloodlust Mode activated! x20 gain of BP for 7 seconds!");
        checkAchievements();
        const progress = document.getElementById
        ("bloodlustProgress"), bar = document.getElementById("bloodlustProgressBar");
        progress.classList.remove("hidden");
        bar.style.width = "100%";
        setTimeout(() => bar.style.width = "0%", 10);
        setTimeout(() => {
            upgrades.bloodlust.active = false;
            document.getElementById("bloodlust").disabled = false;
            progress.classList.add("hidden");
            showMessage("🩸 Bloodlust Mode ended.");
        }, 7000);
    });
});

// Ascend confirmation
document.getElementById("ascend").addEventListener("click", () => {
    if (battlePoints >= upgrades.ascend.cost) document.getElementById("ascendConfirm").classList.remove("hidden");
    else showMessage("❌ Not enough BP to Ascend.");
});

document.getElementById("ascendNo").addEventListener
("click", () => document.getElementById("ascendConfirm").classList.add("hidden"));

// Ascend applied with permanentboost for next playthrough
document.getElementById("ascendYes").addEventListener("click", () => {
    clearInterval(idleInterval);
    battlePoints = 0;
    clickPower = 1;
    idlePower = 0;
    clicks = 0;
    idleTime = 0;
    lastInteraction = Date.now();
    permanentBoostMultiplier *= 2;
    ascensionCount++;
    localStorage.setItem("ascensionCount", ascensionCount);

    for (let key in upgrades) {
        upgrades[key].level = 0;
        if (key === "ascend") {
            upgrades[key].cost = Math.floor(baseCosts.ascend * Math.pow(2, ascensionCount));
        } else if (key === "bloodlust") {
            upgrades[key].cost = Math.floor(baseCosts.bloodlust * Math.pow(1.5, ascensionCount));
        } else {
            upgrades[key].cost = baseCosts[key];
        }
        if (upgrades[key].hasOwnProperty('active')) {
            upgrades[key].active = false;
        }
    }
    hasAscended = true;
    updateCounter();
    document.getElementById("ascendConfirm").classList.add("hidden");
    showMessage(`⚱️ You Ascended! Your BP gain is now doubled permanently!`);
    initializeUpgradeButtons();
    checkAchievements();

    document.addEventListener("DOMContentLoaded", () => {

    });
    startIdleInterval();
});

// Total idle power from idle upgrades
function updateIdlePower() {
    idlePower =
        (upgrades.summon.level > 0 ? upgrades.summon.idleBoost * (2 ** (upgrades.summon.level - 1)) : 0) +
        (upgrades.ritual.level > 0 ? upgrades.ritual.idleBoost * (2 ** (upgrades.ritual.level - 1)) : 0) +
        (upgrades.blade.level > 0 ? upgrades.blade.idleBoost * (2 ** (upgrades.blade.level - 1)) : 0);
}

// Achievement toggle
document.getElementById("toggleAchievements").addEventListener("click", () => {
    const container = document.getElementById("achievementsContainer");
    container.classList.toggle("hidden");
    document.getElementById("toggleAchievements").textContent = container.classList.contains("hidden") ? "Achievements ⚔️" : "Hide Achievements ⚔️";
});

// Save game
function saveGameState() {
    for (let key in upgrades) {
        if (!Number.isFinite(upgrades[key].cost) || !Number.isFinite(upgrades[key].level)) {
            console.warn(`Invalid data for ${key}:`, upgrades[key]);
        }
    }
    const saveData = {
        battlePoints,
        clickPower,
        idlePower,
        permanentBoostMultiplier,
        totalUpgradesPurchased,
        hasActivatedBloodlust,
        hasAscended,
        clicks,
        idleTime,
        upgrades,
        lastInteraction,
        ascensionCount
    };
    console.log('Saving game state:', JSON.stringify(saveData, null, 2));
    fetch('/gameState', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saveData)
    })
        .then(res => {
            if (!res.ok) throw new Error(`HTTP error ${res.status}`);
            return res.json();
        })
        .then(() => showMessage("💾 Game saved!"))
        .catch(err => showMessage(`⚠️ Save failed: ${err.message}`));
}

// Load game
function loadGameState() {
    console.log('Attempting to load game state...');
    suppressNotifications = true;
    fetch('/gameState')
        .then(res => {
            if (!res.ok) throw new Error(`HTTP error ${res.status}`);
            return res.json();
        })
        .then(data => {
            if (!data || Object.keys(data).length === 0) {
                showMessage("⚠️ No saved game found.");
                suppressNotifications = false;
                return;
            }
            battlePoints = data.battlePoints || 0;
            clickPower = data.clickPower || 1;
            idlePower = data.idlePower || 0;
            permanentBoostMultiplier = data.permanentBoostMultiplier || 1;
            totalUpgradesPurchased = data.totalUpgradesPurchased || 0;
            hasActivatedBloodlust = data.hasActivatedBloodlust || false;
            hasAscended = data.hasAscended || false;
            clicks = data.clicks || 0;
            idleTime = data.idleTime || 0;
            lastInteraction = data.lastInteraction || Date.now();
            ascensionCount = data.ascensionCount || 0;
            console.log('Loaded game state:', JSON.stringify(data, null, 2));
            for (let key in upgrades) {
                if (data.upgrades && data.upgrades[key]) {
                    upgrades[key].level = data.upgrades[key].level || 0;
                    upgrades[key].cost = data.upgrades[key].cost || upgrades[key].cost;
                    if ('active' in upgrades[key]) {
                        upgrades[key].active = data.upgrades[key].active || false;
                    }
                    if ('clickBoost' in upgrades[key]) {
                        upgrades[key].clickBoost = data.upgrades[key].clickBoost || upgrades[key].clickBoost;
                    }
                    if ('idleBoost' in upgrades[key]) {
                        upgrades[key].idleBoost = data.upgrades[key].idleBoost || upgrades[key].idleBoost;
                    }
                } else {
                    console.warn(`Upgrade ${key} not found in saved data, using defaults.`);
                }
            }
            updateIdlePower();
            initializeUpgradeButtons();
            updateCounter();
            checkAchievements();
            startIdleInterval();
            suppressNotifications = false;
            showMessage("📂 Game loaded!");
        })
        .catch(err => {
            suppressNotifications = false;
            showMessage(`⚠️ Failed to load game: ${err.message}`);
        });
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("saveGameBtn").addEventListener("click", saveGameState);
    document.getElementById("loadGameBtn").addEventListener("click", loadGameState);
});

