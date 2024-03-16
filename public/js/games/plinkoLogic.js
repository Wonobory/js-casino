let plinko = []

const DOTS = 15
const WIDTH = 1000
const HEIGHT = 800

let multiplierList= [
    {value: 620, class: "m1"}, 
    {value: 83, class: "m2"}, 
    {value: 27, class: "m3"}, 
    {value: 8, class: "m4"}, 
    {value: 3, class: "m5"}, 
    {value: 0.5, class: "m6"}, 
    {value: 0.2, class: "m7"}, 
    {value: 0.2, class: "m7"}, 
    {value: 0.2, class: "m7"},
    {value: 0.2, class: "m7"},  
    {value: 0.5, class: "m6"}, 
    {value: 3, class: "m5"}, 
    {value: 8, class: "m4"}, 
    {value: 27, class: "m3"}, 
    {value: 83, class: "m2"}, 
    {value: 620, class: "m1"}
];

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
            tempPlinko.push(new Dot(j * 55 + WIDTH / 2 - i * (55/2), 30 + i * 40))
        }
        plinko.push(tempPlinko)
    }

    
    for (let i = 0; i < plinko.length; i++) {
        for (let j = 0; j < plinko[i].length; j++) {
            plinko[i][j].drawPlinko()
        }
    }

    
    for (var i = 0; i < DOTS; i++) {
        new Dot(WIDTH / 2 - i * (55/2) - 75, 30 + i * 40 + 40).drawPlinko()
        new Dot(WIDTH / 2 - i * (55/2) - 30 + 55 * plinko[i].length-1, 30 + i * 40 + 40).drawPlinko()
    }

    
    for (var i = 0; i < DOTS+1; i++) {
        if (i == DOTS) {
            multipliers.push(new Multiplier(plinko[plinko.length-1][i-1].x - 15 - (i*(-0.3)) + 25, plinko[plinko.length-1][i-1].y + 40, multiplierList[i].value, multiplierList[i].class))
            continue
        }

        multipliers.push(new Multiplier(plinko[plinko.length-1][i].x - 45 - (i*(-0.3)), plinko[plinko.length-1][i].y + 40, multiplierList[i].value, multiplierList[i].class, i))
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
        this.x = WIDTH / 2 - (50/2) +1
        this.y = 30 + 10 -20

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
                await $(`#${this.id}`).animate({left: `${multipliers[y].x+15}px`, top: `${multipliers[y].y - 8}px`}, 350).promise()
                this.ball.style.left = `${multipliers[y].x+20}px`
                this.ball.style.top = `${multipliers[y].y -8}px`
                
                fakeBalance(this.result.prize)
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


            await $(`#${this.id}`).animate({left: `${plinko[x][y].x + 4}px`, top: `${plinko[x][y].y - 8}px`}, 350).promise()
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
                    risk: 1
                },
            })

            console.log(result)

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
            console.log(data)
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
    const bet = parseFloat(document.getElementById('bet-amount').value) ? parseFloat(document.getElementById('bet-amount').value) : 0
    newBall(bet)
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

updateBalance()
drawPlinko()