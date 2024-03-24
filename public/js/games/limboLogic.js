const BET = $('#bet-amount')[0]
const TARGET_MULTIPLIER = $('#target-multiplier')[0]
const PROFIT = $('#profit')[0]
const BET_BUTTON = document.getElementById('bet-button')

const BALANCE = $('#balance')[0]

let lastMultipliers = []

BET.value = 0
TARGET_MULTIPLIER.value = 1.5

BET.onkeyup = updateProfit

class NotyfManager {
    constructor(maxNotifications) {
        this.notifications = []
        this.maxNotifications = maxNotifications
    }

    addNotification(text, won) {
        if (this.notifications.length >= this.maxNotifications) {
            this.notifications.shift()
        }

        this.notifications.push({multiplier: text, won: won})
    }
}

const notificacions = new NotyfManager(20)

BET.onchange = () => {
    var balanceValue = parseFloat(BALANCE.innerText.replace(/\./g, '').replace(/,/g, '.'));

    if (!BET.value) {
        BET.value = 0;
    }

    if (parseFloat(BET.value) > balanceValue) {
        BET.value = balanceValue;
    }

    BET.value = parseFloat(BET.value).toFixed(2);

    updateProfit()
}

TARGET_MULTIPLIER.onkeyup = () => {

    updateProfit()
}

TARGET_MULTIPLIER.onchange = () => {
    if (!TARGET_MULTIPLIER.value) {
        TARGET_MULTIPLIER.value = 1.01;
    }
    if (parseFloat(TARGET_MULTIPLIER.value) < 1.01) {
        TARGET_MULTIPLIER.value = 1.01;
    }
    updateProfit()
}

function updateProfit() {
    let bet = parseFloat(BET.value)
    let target = parseFloat(TARGET_MULTIPLIER.value)

    bet = bet ? bet : 0
    target = target ? target : 0

    PROFIT.value = (parseFloat((bet * target).toFixed(2)) - bet).toFixed(2)
}

//Repetim el codi de all.js pq sino no podem actualitzar el profit
document.getElementById('multiply-bet').onclick = function() {
    const BET = document.getElementById('bet-amount');
    var balance = document.getElementById('balance');
    var balanceValue = parseFloat(balance.innerText.replace(/\./g, '').replace(/,/g, '.'));

    var changeTo = parseFloat(BET.value) * 2;

    if (changeTo > balanceValue) {
        changeTo = balanceValue;
    }

    BET.value = changeTo;

    updateProfit()
}

document.getElementById('halve-bet').onclick = function() {
    const BET = document.getElementById('bet-amount');
    var changeTo = parseFloat((parseFloat(BET.value) / 2).toFixed(2));

    if (changeTo < 0.01) {
        changeTo = 0.01;
    }

    BET.value = changeTo
    updateProfit()
}

updateBalance()

function makeBet() {
    const target = parseFloat(TARGET_MULTIPLIER.value)
    $.ajax({
        url: '/limbo/bet',
        type: 'POST',
        data: {
            bet: parseFloat(BET.value),
            target: target
        },
        success: function (data) {
            console.log(data)
            animateMultiplier(data.multiplier, target)
        },
        error: function (err) {
            console.log(err)
        }
    })
}

const limbo_colors = {
    won: '#33b52c',
    lost: '#b52c2c',
    normal: 'white'
}

const cling = new Audio('/audio/limbo/cling.mp3')
cling.volume = 0.2

const ready = new Audio('/audio/limbo/ready.mp3')
ready.volume = 0.2

async function animateMultiplier(maxMultiplier, targetMultiplier) {
    const STEPS = 20
    let timePerStep = 400 / STEPS
    const BIG_MULTIPLIER = $('.big-multiplier')[0]
    const MULTIPLIER_CONTAINER = $('.multiplier-container')[0]
    let val = 0
    
    MULTIPLIER_CONTAINER.style.color = limbo_colors.normal
    swapButton()
    for (let i = 0; i < STEPS; i++) {
        val = parseFloat((maxMultiplier / STEPS) * i).toFixed(2)
        BIG_MULTIPLIER.innerText = val
        ready.play()
        await timeout(timePerStep)
    }

    BIG_MULTIPLIER.innerText = maxMultiplier.toFixed(2)

    if (maxMultiplier >= targetMultiplier) {
        MULTIPLIER_CONTAINER.style.color = limbo_colors.won
        notificacions.addNotification(maxMultiplier.toFixed(2), true)
        cling.play()
    } else {
        MULTIPLIER_CONTAINER.style.color = limbo_colors.lost
        notificacions.addNotification(maxMultiplier.toFixed(2), false)
    }

    
    updateBalance()
    updateMultipliers()

    await timeout(200)
    swapButton()
}

function updateMultipliers() {
    const lastMultipliersContainer = $('.last-multipliers')[0]
    lastMultipliersContainer.innerHTML = ''

    lastMultipliersContainer.innerHTML += `<div class="last-multipliers-background"></div>`
    
    for (let i = notificacions.notifications.length-1; i >= 0; i--) {
        if (notificacions.notifications[i].won) {
            lastMultipliersContainer.innerHTML += `<div class="multiplier won-multi">${notificacions.notifications[i].multiplier} x</div>`
        } else {
            lastMultipliersContainer.innerHTML += `<div class="multiplier lost-multi">${notificacions.notifications[i].multiplier} x</div>`
        }
        
    }
}

BET_BUTTON.onclick = makeBet

function swapButton() {
    const BUTTON = document.getElementById('bet-button')

    if (BUTTON.classList.contains('blocked')) {
        BUTTON.classList.remove('blocked')
        BUTTON.onclick = makeBet
    } else {
        BUTTON.classList.add('blocked')
        BUTTON.onclick = null
    }
}
