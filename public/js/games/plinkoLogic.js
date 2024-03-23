let plinko = []

const DOTS = 15
const WIDTH = 800
const HEIGHT = 700
const SPACE_BETWEEN_X = 40
const SPACE_BETWEEN_Y = 38

const TOP_MARGIN = 10

let multiplierList= [{
    risk: 0,
    values: [
        {value: 620, class: "hm1"}, 
        {value: 83, class: "hm2"}, 
        {value: 27, class: "hm3"}, 
        {value: 8, class: "hm4"}, 
        {value: 3, class: "hm5"}, 
        {value: 0.5, class: "hm6"}, 
        {value: 0.2, class: "hm7"}, 
        {value: 0.2, class: "hm7"}, 
        {value: 0.2, class: "hm7"},
        {value: 0.2, class: "hm7"},  
        {value: 0.5, class: "hm6"}, 
        {value: 3, class: "hm5"}, 
        {value: 8, class: "hm4"}, 
        {value: 27, class: "hm3"}, 
        {value: 83, class: "hm2"}, 
        {value: 620, class: "hm1"}
    ]
},
{
    risk: 1,
    values: [
        {value: 88, class: "mm1"}, 
        {value: 18, class: "mm2"},
        {value: 11, class: "mm3"},
        {value: 5, class: "mm4"},
        {value: 3, class: "mm5"},
        {value: 1.3, class: "mm6"},
        {value: 0.5, class: "mm7"},
        {value: 0.3, class: "mm7"},
        {value: 0.3, class: "mm7"},
        {value: 0.5, class: "mm7"},
        {value: 1.3, class: "mm6"},
        {value: 3, class: "mm5"},
        {value: 5, class: "mm4"},
        {value: 11, class: "mm3"},
        {value: 18, class: "mm2"},
        {value: 88, class: "mm1"}
    ]
},
{
    risk: 2,
    values: [
        {value: 15, class: "lm1"},
        {value: 8, class: "lm2"},
        {value: 3, class: "lm3"},
        {value: 2, class: "lm4"},
        {value: 1.5, class: "lm5"},
        {value: 1.1, class: "lm6"},
        {value: 1, class: "lm7"},
        {value: 0.7, class: "lm7"},
        {value: 0.7, class: "lm7"},
        {value: 1, class: "lm7"},
        {value: 1.1, class: "lm6"},
        {value: 1.5, class: "lm5"},
        {value: 2, class: "lm4"},
        {value: 3, class: "lm3"},
        {value: 8, class: "lm2"},
        {value: 15, class: "lm1"}
    ]
}];

const defHeaders = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
}

let multipliers = []

function drawPlinko() {
    plinko = []
    for (let i = 1; i < DOTS+1; i++) {
        let tempPlinko = []
        for (let j = 0; j < i; j++) {
            tempPlinko.push(new Dot(j * SPACE_BETWEEN_X + WIDTH / 2 - i * (SPACE_BETWEEN_X/2), TOP_MARGIN + i * SPACE_BETWEEN_Y))
        }
        plinko.push(tempPlinko)
    }

    
    for (let i = 0; i < plinko.length; i++) {
        for (let j = 0; j < plinko[i].length; j++) {
            plinko[i][j].drawPlinko()
        }
    }

    
    for (var i = 0; i < DOTS; i++) {
        new Dot(WIDTH / 2 - i * (SPACE_BETWEEN_X/2) - (plinko[1][1].x - plinko[1][0].x) * 1.5, 38 + i * SPACE_BETWEEN_Y + TOP_MARGIN).drawPlinko()
        new Dot(WIDTH / 2 - i * (SPACE_BETWEEN_X/2) - (plinko[1][1].x - plinko[1][0].x) * 0.5 + SPACE_BETWEEN_X * plinko[i].length-1, 38 + i * SPACE_BETWEEN_Y + TOP_MARGIN).drawPlinko()
    }

    
    for (var i = 0; i < DOTS+1; i++) {
        if (i == DOTS) {
            multipliers.push(new Multiplier(plinko[plinko.length-1][i-1].x - 17 - (i*(-0.3)) + 25, plinko[plinko.length-1][i-1].y + 40, multiplierList[risk].values[i].value, multiplierList[risk].values[i].class))
            continue
        }

        multipliers.push(new Multiplier(plinko[plinko.length-1][i].x - 32 - (i*(-0.3)), plinko[plinko.length-1][i].y + 40, multiplierList[risk].values[i].value, multiplierList[risk].values[i].class, i))
    }
}

class Dot {
    constructor(x, y) {
        this.x = x
        this.y = y
    }

    drawPlinko() {
        const plinko = document.getElementById('plinko-container')
        const dot = document.createElement('div')
        dot.classList.add('plinko-obs')

        dot.style.left = `${this.x}px`
        dot.style.top = `${this.y}px`

        plinko.appendChild(dot)
    }
}

let id = 0

class Ball {
    constructor(id, bet) {
        this.x = plinko[0][0].x + 3.5
        this.y = plinko[0][0].y - TOP_MARGIN - 30

        this.ball = document.createElement('div')

        this.path = []
        this.bet = bet
        this.id = id

        this.try = 5

        this.result = null

        this.drawBall()
        //this.generatePath()
        this.askBall()
        this.doPath()
    }

    drawBall() {
        const plinko = document.getElementById('plinko-container')
        
        this.ball.classList.add('plinko-ball')
        this.ball.id = this.id

        this.ball.style.left = `${this.x}px`
        this.ball.style.top = `${this.y}px`

        plinko.appendChild(this.ball)
    }

    generatePath() {
        let random = []
        let track = 0

        for (var i = 0; i < DOTS+1; i++) {
            random.push(Math.floor(Math.random() * 2))
        }

        this.path.push([0, 0])

        for (var i = 1; i < random.length; i++) {
            if (random[i] === 0) {
                this.path.push([i, track])
            } else {
                track++
                this.path.push([i, track])
            }
        }
    }

    async doPath() {
        if (this.result == null) {
            if (this.try < 0) {
                this.ball.remove()
                return
            }

            this.try--
            await timeout(50)
            this.doPath()
            return
        }

        for (let i = 0; i < this.path.length; i++) {
            let x = this.path[i][0]
            let y = this.path[i][1]

            if (i == DOTS) {
                await $(`#${this.id}`).animate({left: `${multipliers[y].x+15}px`, top: `${multipliers[y].y - 8}px`}, 200, "linear").promise()
                this.ball.style.left = `${multipliers[y].x+20}px`
                this.ball.style.top = `${multipliers[y].y -8}px`
                
                fakeBalance(this.result.prize)
                notyfManager.newNotyf(this.result.prize-this.bet)
                multipliers[y].doAnimation()

                if (this.result.prize > this.bet) {
                    const audio = new Audio(`/audio/plinko/plinko_entry2.mp3`)
                    audio.volume = 0.2
                    audio.play()
                    continue
                }
                
                playSound()
                continue
            }


            await $(`#${this.id}`).animate({left: `${plinko[x][y].x + 4}px`, top: `${plinko[x][y].y - 8}px`}, 200, "linear").promise()
            this.ball.style.left = `${plinko[x][y].x + 4}px`
            this.ball.style.top = `${plinko[x][y].y -8}px`
        }
        this.ball.remove()
    }

    async askBall() {
        try {        
            const result = await $.ajax({
                type: "POST",
                url: "/plinko/ball",
                data: {
                    bet: this.bet,
                    risk: risk
                },
            })

            this.result = result
            this.path = result.path
            fakeBalance(-this.bet)
            const audio = new Audio(`/audio/plinko/plinko_entry.mp3`)
            audio.volume = 0.5
            audio.play()

        } catch (error) {
            console.log(error)
        }
    }
}

let balls = []
let risk = 0

async function newBall(bet) {
    balls.push(new Ball(id, bet))
    id++
}

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}


class Multiplier {
    constructor(x, y, value, classe, id) {
        this.x = x
        this.y = y
        this.value = value
        this.class = classe

        this.id = id

        this.multiplier = document.createElement('div')

        this.drawMultiplier()
    }

    drawMultiplier() {
        const plinko = document.getElementById('plinko-container')
        
        this.multiplier.id = 'multiplier' + this.id
        this.multiplier.classList.add('multiplier')
        this.multiplier.classList.add(this.class)

        this.multiplier.innerText = 'x'+this.value

        this.multiplier.style.left = `${this.x}px`
        this.multiplier.style.top = `${this.y}px`

        plinko.appendChild(this.multiplier)
    }

    async doAnimation() {
        await $(`#multiplier${this.id}`).animate({top: `${this.y+15}px`}, 100).promise()
        this.multiplier.style.top = `${this.y+15}px`
        await $(`#multiplier${this.id}`).animate({top: `${this.y}px`}, 100).promise()
        this.multiplier.style.top = `${this.y}px`
    }
}

function drawMultipliers() {
    const plinko = document.getElementById('plinko-container')
    const multipliers = document.createElement('div')
    multipliers.classList.add('multipliers')

    multipliers.appendChild(plinko)
}

function updateBalance() {
    $.ajax({
        url: '/get-balance',
        type: 'POST',
        headers: defHeaders,
        success: function (data) {
            document.getElementById('balance').innerText = `${parseFloat(data.balance.toFixed(2)).toLocaleString()}`
        },
        error: function (err) {
            console.log(err)
            updateBalance()
        }
    })
}

function fakeBalance(toAdd) {
    const balance = document.getElementById('balance').innerText

    //replace dots, and commas to dots
    let bal = parseFloat(balance.replace(/\./g, '').replace(/,/g, '.'))
    bal += toAdd
    document.getElementById('balance').innerText = parseFloat(bal.toFixed(2)).toLocaleString()
}

function placeBet() {
    const balance = parseFloat(document.getElementById('balance').innerText.replace(/\./g, '').replace(/,/g, '.'))
    const bet = parseFloat(document.getElementById('bet-amount').value)
    if (bet < balance) {
        const bet = parseFloat(document.getElementById('bet-amount').value) ? parseFloat(document.getElementById('bet-amount').value) : 0
        newBall(bet)
    }
}

function setCookie(name,value,days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}
  function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

function playSound() {
    const random = Math.floor(Math.random() * 4) + 1
    const audio = new Audio(`/audio/plinko/plinko${random}.mp3`)
    audio.volume = 0.5
    audio.play()
}

class Notyf {
    constructor(amount) {
        this.amount = amount
        this.notyf = document.createElement('div')
        this.drawNotyf()
    }

    drawNotyf() {
        const notyf = document.getElementById('plinko-wins')
        this.notyf.classList.add('plinko-notyf')

        if (this.amount < 0) {
            this.notyf.classList.add('notyf-lose')
            this.notyf.innerText = `-$${parseFloat(Math.abs(this.amount).toFixed(2)).toLocaleString()}`
        } else {
            this.notyf.classList.add('notyf-win')
            this.notyf.innerText = `+$${parseFloat(this.amount.toFixed(2)).toLocaleString()}`
        }

        notyf.appendChild(this.notyf)
        this.newNotyfAnimation()
    }

    async newNotyfAnimation() {
        this.notyf.style.marginLeft = '-15%'
        this.notyf.style.width = '72%'
        this.notyf.style.opacity = '0'

        await $(this.notyf).animate({marginLeft: '0', width: '87%', opacity: '1'}, 150).promise()

        this.notyf.style.marginLeft = '0'
        this.notyf.style.width = '87%'
        this.notyf.style.opacity = '1'
    }

    async deleteAnimation() {
        this.notyf.style.position = 'absolute'
        this.notyf.style.top = '90%'
        this.notyf.style.left = '0'

        await $(this.notyf).animate({left: '-6em', opacity: '0'}, 150).promise()

        this.notyf.style.left = '-3em'
        this.notyf.remove()
    }
}

class NotyfManager {
    constructor(maxSize) {
        this.notyfs = []
        this.maxSize = maxSize
    }

    newNotyf(amount) {
        this.notyfs.push(new Notyf(amount))
        if (this.notyfs.length > this.maxSize) {
            this.notyfs[0].deleteAnimation()
            this.notyfs.shift()
        }
    }
}

const notyfManager = new NotyfManager(9)

$("#select-risk").change(function() {
    risk = $(this).val()
    $('#plinko-container').empty()
    drawPlinko()
})

updateBalance()
drawPlinko()