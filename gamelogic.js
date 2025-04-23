let battlePoints = 0, clickPower = 1, idlePower = 0, permanentBoostMultiplier = 1, totalUpgradesPurchased = 0, hasActivatedBloodlust = false, hasAscended = false, clicks = 0, idleTime = 0, lastInteraction = Date.now();

const upgrades = {
    vitality: { cost: 100, level: 0, clickBoost: 2 },
    skill: { cost: 250, level: 0, clickBoost: 5 },
    strength: { cost: 400, level: 0, clickBoost: 10 },
    summon: { cost: 600, level: 0, idleBoost: 1 },
    ritual: { cost: 850, level: 0, idleBoost: 5 },
    blade: { cost: 1000, level: 0, idleBoost: 10 },
    ascend: { cost: 250000, level: 0 },
    bloodlust: { cost: 10000, active: false }
};

const messageQueue = [];
let isShowingMessage = false;

document.getElementById("closePopup").addEventListener("click", () => {
    document.getElementById("Popup").style.display = "none";
});

function showMessage(msg) {
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
        setTimeout(() => displayNextMessage(messageBox), 300);
    }, 3000);
}

function updateCounter() {
    document.getElementById("Counter").textContent = `Battle Points: ${battlePoints}`;
    checkAchievements();
}

function addBP(amount) {
    battlePoints += amount * permanentBoostMultiplier * (upgrades.bloodlust.active ? 2 : 1);
}

function markAchievement(achievementId, achievementName) {
    const el = document.getElementById(achievementId);
    if (el && el.dataset.achieved === "false") {
        el.dataset.achieved = "true";
        el.classList.add("completed");
        showMessage(`🏆 ${achievementName}!`);
    }
}

function checkAchievements() {
    if (totalUpgradesPurchased >= 1) markAchievement("achievement1", "First Step");
    if (battlePoints >= 1000) markAchievement("achievement2", "Battle Novice");
    if (clicks >= 1000) markAchievement("achievement3", "Tapping into Madness");
    if (battlePoints >= 5000) markAchievement("achievement4", "Warlord");
    if (totalUpgradesPurchased >= 10) markAchievement("achievement5", "Tinkerer's Touch");
    if (hasActivatedBloodlust) markAchievement("achievement6", "Bloodlust Unleashed");
    if (idleTime >= 600) markAchievement("achievement7", "Meditator");
    if (hasAscended) markAchievement("achievement8", "Born Anew");
}

function initializeUpgradeButtons() {
    for (let id in upgrades) {
        const upgrade = upgrades[id], button = document.getElementById(id);
        if (!button || (!upgrade.clickBoost && !upgrade.idleBoost)) continue;
        button.innerHTML = `${button.innerText.split('(')[0].trim()} (Cost: ${upgrade.cost} BP)${upgrade.idleBoost ? '<br>' : ''}${upgrade.clickBoost ? `(+${upgrade.clickBoost}/click)` : upgrade.idleBoost ? `(+${upgrade.idleBoost}/s)` : ''}`;
    }
}

document.addEventListener("DOMContentLoaded", initializeUpgradeButtons);

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
            button.innerHTML = `${button.innerText.split('(')[0].trim()} (Cost: ${upgrades[id].cost} BP)${upgrades[id].idleBoost ? '<br>' : ''}${upgrades[id].clickBoost ? `(+${upgrades[id].clickBoost}/click)` : upgrades[id].idleBoost ? `(+${upgrades[id].idleBoost}/s)` : ''}`;
        }
        updateCounter();
        if (id !== "bloodlust") showMessage(`✅ ${id.charAt(0).toUpperCase() + id.slice(1)} upgraded!`);
        if (upgrades[id].idleBoost) showMessage(`🕒 Idle power +${upgrades[id].idleBoost} BP/s!`);
    } else {
        showMessage(`❌ Not enough BP for ${id.charAt(0).toUpperCase() + id.slice(1)}.`);
    }
}

document.getElementById("Clicker").addEventListener("click", () => {
    clicks++;
    lastInteraction = Date.now();
    idleTime = 0;
    addBP(clickPower);
    updateCounter();
});

document.getElementById("vitality").addEventListener("click", () => buyUpgrade("vitality", () => clickPower += upgrades.vitality.clickBoost));
document.getElementById("skill").addEventListener("click", () => buyUpgrade("skill", () => clickPower += upgrades.skill.clickBoost));
document.getElementById("strength").addEventListener("click", () => buyUpgrade("strength", () => clickPower += upgrades.strength.clickBoost));
document.getElementById("summon").addEventListener("click", () => buyUpgrade("summon", () => updateIdlePower()));
document.getElementById("ritual").addEventListener("click", () => buyUpgrade("ritual", () => updateIdlePower()));
document.getElementById("blade").addEventListener("click", () => buyUpgrade("blade", () => updateIdlePower()));

document.getElementById("bloodlust").addEventListener("click", () => {
    if (upgrades.bloodlust.active) return showMessage("🩸 Bloodlust Mode is already active!");
    buyUpgrade("bloodlust", () => {
        upgrades.bloodlust.active = true;
        hasActivatedBloodlust = true;
        document.getElementById("bloodlust").disabled = true;
        lastInteraction = Date.now();
        idleTime = 0;
        showMessage("🩸 Bloodlust Mode activated! Points doubled for 7 seconds!");
        checkAchievements();
        const progress = document.getElementById("bloodlustProgress"), bar = document.getElementById("bloodlustProgressBar");
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

document.getElementById("ascend").addEventListener("click", () => {
    if (battlePoints >= upgrades.ascend.cost) document.getElementById("ascendConfirm").classList.remove("hidden");
    else showMessage("❌ Not enough BP to Ascend.");
});

document.getElementById("ascendNo").addEventListener("click", () => document.getElementById("ascendConfirm").classList.add("hidden"));

document.getElementById("ascendYes").addEventListener("click", () => {
    clearInterval(idleInterval);
    battlePoints = 0;
    clickPower = 1;
    idlePower = 0;
    clicks = 0;
    idleTime = 0;
    lastInteraction = Date.now();
    permanentBoostMultiplier *= 1.5;
    for (let key in upgrades) {
        upgrades[key].level = 0;
        if (upgrades[key].hasOwnProperty('active')) upgrades[key].active = false;
    }
    hasAscended = true;
    updateCounter();
    document.getElementById("ascendConfirm").classList.add("hidden");
    showMessage(`⚱️ You Ascended! +${Math.round((permanentBoostMultiplier - 1) * 100)}% permanent BP boost gained.`);
    initializeUpgradeButtons();
    checkAchievements();
    idleInterval = setInterval(() => {
        if (idlePower > 0) {
            addBP(idlePower);
            updateCounter();
        }
        idleTime = Math.floor((Date.now() - lastInteraction) / 1000);
    }, 1000);
});

function updateIdlePower() {
    idlePower = upgrades.summon.level * upgrades.summon.idleBoost + upgrades.ritual.level * upgrades.ritual.idleBoost + upgrades.blade.level * upgrades.blade.idleBoost;
}

let idleInterval = setInterval(() => {
    if (idlePower > 0) {
        addBP(idlePower);
        updateCounter();
    }
    idleTime = Math.floor((Date.now() - lastInteraction) / 1000);
}, 1000);

document.getElementById("toggleAchievements").addEventListener("click", () => {
    const container = document.getElementById("achievementsContainer");
    container.classList.toggle("hidden");
    document.getElementById("toggleAchievements").textContent = container.classList.contains("hidden") ? "Achievements ⚔️" : "Hide Achievements ⚔️";
});