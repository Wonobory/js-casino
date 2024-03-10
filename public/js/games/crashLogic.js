const canvas = document.getElementById('render')
const ctx = canvas.getContext('2d');


const defHeaders = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
}

// Datos para el gráfico lineal (solo como ejemplo)




// Configuración del gráfico
const margen = 40;
const ancho = canvas.width - 2 * margen;
const alto = canvas.height - 2 * margen;


const img = new Image();
img.src = '/img/crash_rocket.png';

// Función para dibujar el gráfico lineal con curvas de Bézier
function dibujarGraficoLinealConBezier(datos, seconds) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calcular la distancia horizontal entre los puntos
    const pasoX = Math.min(ancho / (datos.length - 1), 5);
    ctx.lineWidth = 2;

    // Encontrar el valor máximo en los datos
    const valorMaximo = Math.max(Math.max(...datos), 1.8);
    const valorMinimo = Math.min(Math.min(...datos), 0); // Valor mínimo en los datos

    ctx.strokeStyle = 'rgb(68,69,84)'
    ctx.fillStyle = 'rgb(68,69,84)'
    

    ctx.beginPath();
    ctx.moveTo(margen, canvas.height - margen*0.4);
    ctx.lineTo(margen, canvas.height - margen*0.75);
    ctx.fillText(`0s`, margen-5, canvas.height - 4);
    ctx.stroke();

    seconds = seconds / 1000


    let modificador = 1
    if (seconds > 20) {
        modificador = 2
    }
    if (seconds > 30) {
        modificador = 5
    }
    if (seconds > 60) {
        modificador = 10
    }

    seconds = seconds * 1000

    let lineas = Math.floor(((seconds / 40) / 25) / modificador)

    const pasoX2 = Math.min(ancho / ((seconds/40) - 1), 5);

    // Dibujar líneas de tiempo para los 2 segundos
    for (let i = 0; i < lineas; i++) {
        const x = margen + (i + 1) * modificador * 25 * pasoX2;
        
        ctx.beginPath();
        ctx.moveTo(x, canvas.height - margen*0.4);
        ctx.lineTo(x, canvas.height - margen*0.75);
        ctx.fillText(`${(i+1) * modificador}s`, x-5, canvas.height - 4);
        ctx.stroke();
    }

    // Dibujar líneas y etiquetas en el eje y
    ctx.fillStyle = 'rgb(68,69,84)'; // Cambiar color del texto
    ctx.textAlign = 'start'; // Alinear el texto a la izquierda
    ctx.textBaseline = 'middle'; // Alinear verticalmente el texto al centro

    const valorRange = valorMaximo - valorMinimo;
    const numLineasY = Math.ceil(1.25*valorRange); // Número de líneas y etiquetas en el eje y
    const pasoY = (alto) / (1.25*valorRange); // Paso entre líneas en el eje y
    let incremento = numLineasY > 10 ? 2 : 1;

    if (numLineasY > 500) {
        incremento = 100
    } else if (numLineasY > 200) {
        incremento = 50
    } else if (numLineasY > 100) {
        incremento = 20
    } else if (numLineasY > 50) {
        incremento = 10
    } else if (numLineasY > 20) {
        incremento = 5
    } else if (numLineasY > 10) {
        incremento = 2
    } else if  (numLineasY > 5){
        incremento = 1
    } else if (numLineasY > 2) {
        incremento = 0.5
    }

    incremento = getIncremento(numLineasY)/10

    for (let i = 0; i <= numLineasY; i += incremento) {
        const y = canvas.height - margen - i * pasoY;
        const valorY = valorMinimo + i+1; // Valor correspondiente a la línea y

        // Dibujar línea en el eje y
        ctx.beginPath();
        ctx.moveTo(canvas.width - 0.8* margen, y);
        ctx.lineTo(canvas.width - 0.6* margen, y);
        ctx.stroke();

        // Escribir valor en el eje y
        ctx.fillText(`x${valorY}`, canvas.width - 20, y);
    }        
    

    // Dibujar curva de Bézier
    ctx.beginPath();

    ctx.strokeStyle = 'rgb(123,108,168)';
    ctx.lineWidth = 4;

    ctx.moveTo(margen, canvas.height - margen - (datos[0]-1) * (alto / (1.25*valorMaximo)));

    for (let i = 0; i < datos.length - 1; i++) {
        // Puntos de control para la curva de Bézier
        const x1 = margen + (i + 1) * pasoX + pasoX / 2;
        const y1 = canvas.height - margen - (datos[i + 1]-1) * (alto / (1.25*valorMaximo));
        const x2 = margen + i * pasoX - pasoX / 2;
        const y2 = canvas.height - margen - (datos[i]-1) * (alto / (1.25*valorMaximo));
        const x = margen + (i + 1) * pasoX;
        const y = canvas.height - margen - (datos[i + 1]-1) * (alto / (1.25*valorMaximo));

        // Dibujar curva de Bézier
        ctx.bezierCurveTo(x1, y1, x2, y2, x, y);
    }

    ctx.stroke();

    //CALCULAR LA ROTACIO
    
    /*
    let x0 = margen + (datos.length - 2) * pasoX;
    let y0 = canvas.height - margen - (datos[datos.length - 4]-1) * (alto / (1.25*valorMaximo));

    let x1 = margen + (datos.length - 1) * pasoX;
    let y1 = canvas.height - margen - (datos[datos.length - 4]-1) * (alto / (1.25*valorMaximo));

    let x2 = margen + (datos.length - 1) * pasoX;
    let y2 = canvas.height - margen - (datos[datos.length - 1]-1) * (alto / (1.25*valorMaximo));

    let a = Math.abs(x0-x1)
    let b = Math.abs(y1-y2)
    let c = Math.sqrt(a*a + b*b)

    let angle = Math.acos(a/c)
    ctx.rotate(-angle)

    //cos(x) = a / sqrt(a^2 + b^2)

    //DRAW ROCKET
    console.log('Angle', angle)
    ctx.drawImage(img, margen + (datos.length - 1) * pasoX - 32.5, canvas.height - margen - (datos[datos.length - 1]-1) * (alto / (1.25*valorMaximo))- 38, 75, 75);
    ctx.rotate(angle)
    */

    ctx.beginPath();
    ctx.arc(margen + (datos.length - 1) * pasoX , canvas.height - margen - (datos[datos.length - 1]-1) * (alto / (1.25*valorMaximo))-1, 6, 0, Math.PI * 2);
    ctx.fillStyle = 'rgb(123,108,168)'
    ctx.strokeStyle = 'rgb(123,108,168)'
    ctx.fill();
    ctx.stroke();
}

function multiplierAnimation() {
    const multiplier = document.getElementById('multiplier')
    multiplier.classList.add('multiplier-animation')
    setTimeout(() => {
        multiplier.classList.remove('multiplier-animation')
    }, 300)
}

function getIncremento(numLineasY) {
    // Inicia una matriz de incrementos con el valor 1
    const incrementos = [1];

    // Mientras que el último valor de la matriz sea menor que numLineasY
    while (incrementos[incrementos.length - 1] < numLineasY) {
        // Multiplica el último valor por un factor y añade el resultado a la matriz
        let ultimoValor = incrementos[incrementos.length - 1];
        let factor = ultimoValor === 1 || ultimoValor === 5 ? 2 : 5;
        incrementos.push(ultimoValor * factor);
    }

    // Usa el último valor de la matriz como incremento
    let incremento = incrementos[incrementos.length - 1];

    return incremento;
}

function promedioMovil(datos, N) {
    const longitud = Math.min(N, datos.length);
    const valoresUltimos = datos.slice(-longitud);
    const suma = valoresUltimos.reduce((acumulador, valor) => acumulador + valor, 0);
    return suma / longitud;
}

// Llamar a la función para dibujar el gráfico lineal con curvas de Bézier


let localGameState = 1

var multiplier = 1
var lastMultiplier = 1

var iteration = 1
var goal = 9999999

var didJoin = false

var rate = 50
const SERVER_RATE = 100

var segons = 10;

let gameStarted = false

const socket = io('ws://26.120.11.243:7777/crash', {
    withCredentials: true
})

let localTempo = 0
let serverTempo = 0

let alreadyChangedButtons = false
let alreadyChangedAlreacyChangedButtons = false // XD

let cashedOut = false

socket.on('multiplier', (data) => {
    if (!alreadyChangedAlreacyChangedButtons) {
        alreadyChangedAlreacyChangedButtons = true
        alreadyChangedButtons = false
    }

    lastMultiplier = multiplier
    multiplier = data.multiplier
    iteration = data.iteration
    serverTempo = data.tempo
    datos.push(multiplier)
    setTimeout(() => {
    datos.push(multiplier)}, 20)

    if (data.playerList) {
        updateJoiningPlayers(data.playerList)
    }    

    if (!gameStarted) {
        startGame()
    }

    if (localGameState == 1) {
        localGameState = 2
        modalNewGame(0, true)
    }

    if (!alreadyChangedButtons && didJoin && !cashedOut) {
        alreadyChangedButtons = true
        console.log("SetJoinedButton")
        setJoinedButton()
    }

    if (!alreadyChangedButtons && !didJoin && !cashedOut) {
        alreadyChangedButtons = true
        console.log("SetBetButton")
        disableBet()
    }
})

socket.on('newGameStarting', (data) => {
    modalNewGame(data.remaningTime, false)
    if (!alreadyChangedButtons) {
        alreadyChangedButtons = true
        hasCashOut = false
        setBetButton()
    }

    if (data.playerList) {
        updateJoiningPlayers(data.playerList)
    }
})

socket.on('newGame', (data) => {
    datos = []
    keepGoing = true
    multiplier = 1
    lastMultiplier = 1
    segons = 0
    startGame()
})

socket.on('autoCashOut', (data) => {
    if (data.user_id == getCookie('user_id')) {
        setBetButton()
        disableBet()
        didJoin = false
        bet = 0
        updateBalance()
        cashedOut = true
    }

    cashOutAnimation(data)
})

function cashOutAnimation(data) {
    const currentPlayers = $('.player')
    
    for (var i = 0; i < currentPlayers.length; i++) {
        if (currentPlayers[i].classList.contains('player') && currentPlayers[i].innerText == data.name) {
            const bet = currentPlayers[i].nextSibling
            bet.innerText = data.bet * data.multiplier

            currentPlayer = currentPlayers[i]

            bet.innerText = '+ $' + ((data.bet * data.multiplier).toFixed(2)).toLocaleString()
            currentPlayers[i].animate({
                color: '#44a64a'
            }, 1000).onfinish = () => {
                currentPlayer.style.color = '#44a64a'
                
            }
            bet.animate({
                color: '#44a64a'
            }, 1000).onfinish = () => {
                bet.style.color = '#44a64a'
            }
        }
    }
}

datos = []

function modalNewGame(remaningTime, hasToHide) {
    //TODO
    const modal = document.getElementById('new-game-modal')

    if (hasToHide) {
        if (!modal.classList.contains('hidden')) {
            modal.classList.add('hidden')
        }
        return
    }
    
    if (modal.classList.contains('hidden')) {
        modal.classList.remove('hidden') 
    }
    document.getElementById('new-game-timer').innerHTML = (remaningTime / 1000).toFixed(1) + 's'
}

function updateJoiningPlayers(joinedPlayers) {
    document.getElementById('player-list').innerHTML = ''

    const totalBets = document.getElementById('bets-total')
    const totalPlayers = document.getElementById('player-total')

    let totalBet = 0
    let totalPlayer = 0

    joinedPlayers = joinedPlayers.sort((a, b) => b.bet - a.bet)

    for (var i = 0; i < joinedPlayers.length; i++) {
        const container = document.createElement('tr')
        const playerName = document.createElement('td') 
        const bet = document.createElement('td')

        playerName.innerText = joinedPlayers[i].name
        bet.innerText = '$' + joinedPlayers[i].bet.toLocaleString()

        playerName.classList.add('player')
        bet.classList.add('bet')

        container.appendChild(playerName)
        container.appendChild(bet)

        totalBet += joinedPlayers[i].bet
        totalPlayer++

        document.getElementById('player-list').appendChild(container)
    }

    totalBets.innerText = '$' + (parseFloat(totalBet.toFixed(2))).toLocaleString()
    totalPlayers.innerText = `${totalPlayer} players`
}

$.ajax({
    url: '/crash/get-status',
    method: 'POST',
    success: function (data) {
        console.log('Data', data)
        switch (data.status) {
            case 1:
                modalNewGame(data.remaningTime, false)
                updateJoiningPlayers(data.playerList)

                document.getElementById('bet-amount').value = data.bet

                didJoin = data.didJoin
                bet = data.bet
                if (didJoin) {
                    console.log('Did join!! DISABLE BUTTONS')
                    alreadyChangedButtons = true
                    disableBet()
                }
                
                localGameState = 1
                break
            case 2:
                datos = data.graphData
                segons = data.iteration * SERVER_RATE
                bet = data.bet
                document.getElementById('bet-amount').value = bet
                didJoin = data.didJoin
                localGameState = 2
                
                console.log(data)
                cashedOut = data.hasCashOut

                if (cashedOut) {
                    setBetButton()
                    disableBet()
                }

                if (!didJoin) {
                    console.log('Did not join!! DISABLE BET')
                    disableBet()
                } else if (didJoin && !data.hasCashOut) {
                    setJoinedButton()
                }

                updateJoiningPlayers(data.playerList)
                break
        }
    }
})

async function startGame() {
    socket.on('crash', (data) => {
        console.log('Crash', data)
        keepGoing = false
        
        multiplier = data
        datos[datos.length-1] = multiplier
        document.getElementById('multiplier').innerHTML = 'x'+multiplier.toFixed(2)

        iteration = 0
        localTempo = 0
        serverTempo = 0

        gameStarted = false

        alreadyChangedButtons = false
        alreadyChangedAlreacyChangedButtons = false

        localGameState = 1

        //Important resetear variables que mantenen en sincronia el joc
        console.log('didJoin set to false')
        didJoin = false
        bet = 0
        loadLastMultipliers()

        cashedOut = false
    })

    gameStarted = true
    var keepGoing = true

    var lastMultiplierDivisible = 0;

    while (keepGoing) {
        await timeout(rate)
        if (multiplier > goal) {
            keepGoing = false
        }
        
        if (datos.length > 5000) {
            datos.shift()
        }


        document.getElementById('multiplier').innerHTML = 'x'+datos[datos.length-1].toFixed(2)
        if (!cashedOut) {
            document.getElementById('profit').innerHTML = `+ $${(datos[datos.length-1] * bet).toFixed(2)}`
        } else {
            document.getElementById('profit').innerHTML = `Cashed Out!`
        }

        /*
        FER PETITA ANIMACIO AL AUGMENTAR EL MULTIPLIER PER 1
        desactivat per evitar que es mogui el text de 'current profit'
        */
        
        /*
        if (lastMultiplier != multiplier && parseInt(multiplier) > lastMultiplierDivisible) {
            multiplierAnimation()
            console.log('animation')
            lastMultiplierDivisible = parseInt(multiplier)
        }
        */
        
        iteration++
        segons += rate
        dibujarGraficoLinealConBezier(datos, segons)
    }
}

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let bet = 0

function placeBet() {
    const amount = parseFloat(document.getElementById('bet-amount').value)
    const autoCashOut = document.getElementById('auto-cashout').value
    
    console.log('Placing bet', amount, autoCashOut)
    $.ajax({
        url: '/crash/join',
        method: 'POST',
        data: {
            bet: amount,
            autoCashOut: autoCashOut
        },
        success: (data) => {
            console.log('placing bet', data)
            disableBet()
            bet = amount
            console.log('didJoin set to true')
            didJoin = true
            updateBalance()
        },
        error: (err) => {
            console.log('Error', err)
        }
    })
}

function disableBet() {
    const betButton = document.getElementById('bet-button')

    betButton.classList.add('disabled-button')
}

function setBetButton() {
    try {
        const joinedButton = document.getElementById('check-out')
        joinedButton.remove()
    } catch (e) {}

    if (document.getElementById('bet-button')) {
        if (document.getElementById('bet-button').classList.contains('disabled-button')) {
            document.getElementById('bet-button').classList.remove('disabled-button')
            document.getElementById('bet-button').disabled = false
        }
        return
    }

    const betButton = document.createElement('button')
    betButton.classList.add('start-game')
    betButton.id = 'bet-button'

    betButton.onclick = () => {
        placeBet()
    }

    betButton.innerHTML = 'Place Bet'

    document.getElementById('spawn-button').appendChild(betButton)

}

function setJoinedButton() {
    try {
        const betButton = document.getElementById('bet-button')
        betButton.remove()
    } catch (e) {}


    if (document.getElementById('check-out')) {
        return
    }

    const joinedButton = document.createElement('button')
    joinedButton.classList.add('check-out')
    joinedButton.classList.add('joined-button')
    joinedButton.id = 'check-out'

    joinedButton.innerHTML = 'Cash-Out'
    joinedButton.onclick = cashOut

    document.getElementById('spawn-button').appendChild(joinedButton)
}

function cashOut() {
    $.ajax({
        url: '/crash/check-out',
        method: 'POST',
        success: (data) => {
            console.log('Cashing out', data)
            setBetButton()
            disableBet()
            didJoin = false
            bet = 0
            updateBalance()
            cashedOut = true
        },
        error: (err) => {
            console.log('Error', err)
        }
    })
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


function loadLastMultipliers() {
    $.ajax({
        url: '/crash/last-multipliers',
        method: 'GET',
        success: (data) => {
            console.log('Last multipliers', data)
            const lastMultipliers = document.getElementById('last-multipliers')
            lastMultipliers.innerHTML = '<div class="last-multipliers-cover"></div>'

            console.log(data.multipliers)

            for (var i = data.multipliers.length-1; i >= 0; i--) {
                const span = document.createElement('span')
                if (data.multipliers[i] > 2) {
                    span.classList.add('positive')
                } else {
                    span.classList.add('negative')
                }
                span.classList.add('last-multiplier')
                span.innerText = `x${parseFloat(data.multipliers[i]).toFixed(2)}`
                lastMultipliers.appendChild(span)
            }
        },
        error: (err) => {
            console.log('Error', err)
        }
    })
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

document.getElementById('auto-cashout').addEventListener('blur', (e) => {
    if (!e.target.value && e.target.value != '') {
        e.target.value = 1.01
    }

    if (parseFloat(e.target.value) < 1.01 && e.target.value != '') {
        e.target.value = 1.01
    }

    if (e.target.value == '') {
        desactivarAutoCashoutCreu()
    }
})

function activarAutoCashoutCreu() {
    const cross = document.getElementById('cross-auto-cashout')

    if (cross.classList.contains('hidden')) {
        cross.classList.remove('hidden')
    }
}

function desactivarAutoCashoutCreu() {
    const cross = document.getElementById('cross-auto-cashout')

    if (!cross.classList.contains('hidden')) {
        cross.classList.add('hidden') 
    }
}

document.getElementById('auto-cashout').addEventListener('keydown', (e) => {
    
    activarAutoCashoutCreu()
    
})

document.getElementById('cross-auto-cashout').addEventListener('click', (e) => {
    desactivarAutoCashoutCreu()
    treureAutoCashOut()
})

function treureAutoCashOut() {
    const autoCashOut = document.getElementById('auto-cashout')

    if (autoCashOut.value) {
        autoCashOut.value = ''
    }
}

updateBalance()
loadLastMultipliers()