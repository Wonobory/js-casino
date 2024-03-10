const express = require("express");
const app = express();

const path = require('path');

const fs = require('fs')

const partida = "test";
const mysql = require('mysql');
const bodyParser = require('body-parser')


const cors = require('cors');
const { json } = require("body-parser");
const cookieParser = require('cookie-parser');

const crypto = require("crypto")

const { promisify } = require('util')

const {execSync} = require('child_process');

const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: { origin: 'http://26.120.11.243:777', credentials: true},
    cookie: true
});

http.listen(7777, () => {
    console.log('listening on *:7777');
});

const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "js-casino"
})

pool.query = promisify(pool.query)

app.listen(777, () => {
    console.log("Servidor modo facherito al port 777😎");
});

app.use(cookieParser());

//app.use(express.json());
app.use(cors({ origin: '*' }));
app.use(function(req, res, next){
    res.header('Acess-Control-Allow-Origin', "*")
    res.header('Acess-Control-Allow-Methods', "GET,PUT,POST,DELETE")
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next()
})
app.use(bodyParser.urlencoded({
    extended: true
}));



app.use(bodyParser.json());
app.use(express.static('public'))

app.get('/minesweeper', (req, res) => {
    res.sendFile(path.join(__dirname + '/client/buscaminas.html'));
})

app.get('/minesweeper-game/:hex', (req, res) => {
    fs.readFile(path.join(__dirname + '/client/buscaminas-game.html'), async (err, html) => {
        if (err) {
            console.log(err)
            return res.end()
        } else {
            res.send(`<script>var hex = '${req.params.hex}';</script>${html}`)
        }
    })
})

app.post('/minesweeper-game/:hex/get-game', async (req, res) => {
    if (!req.params.hex) {
        res.status(403).json({ error: "No se ha encontrado la partida" })
        return res.end()
    }
    if (!req.cookies.user_id) {
        res.status(403).json({ error: "No estás logeado" })
        return res.end()
    }

    const query = `SELECT * FROM minesweeper WHERE hash = '${req.params.hex}'`
    pool.query(query, (err, result) => {
        if (err) {
            res.status(500)
            return res.end()
        }

        if (!result.length) {
            res.status(403)
            return res.end()
        }

        if (result[0].user_id != req.cookies.user_id) {
            res.status(403)
            return res.end()
        }

        res.status(200).json({ game: result[0].checkedCells, size: result[0].size, isGameActive: result[0].isGameActive, bet: result[0].bet, mines: result[0].mines })
        return res.end()
    })
})

app.post('/get-balance', async (req, res) => {
    if (!req.cookies.user_id) {
        res.status(403).json({ error: "No estás logeado" })
        return res.end()
    }

    const query = `SELECT * FROM users WHERE id = '${req.cookies.user_id}'`
    pool.query(query, (err, result) => {
        if (err) {
            res.status(500)
            return res.end()
        }

        if (!result.length) {
            res.status(403)
            return res.end()
        }

        res.status(200).json({ balance: result[0].money })
        return res.end()
    })
})

app.post('/minesweeper/create-game', async (req, res) => {
    console.log(req.body)
    if (!req.body.bet || !req.body.size || !req.body.mines) {
        res.status(400).json({ error: "Faltan parametros (bet, size, mines)" })
        return res.end()
    }

    req.body.bet = parseFloat(req.body.bet)
    req.body.mines = parseInt(req.body.mines)

    if (req.body.bet <= 0) {
        res.status(402).json({ error: "Bet cannot be negative" })
        return res.end()
    }

    if (req.body.mines > 24) {
        res.status(401).json({ error: "Mines cannot be more than 24" })
        return res.end()
    }
    if (req.body.mines < 1) {
        res.status(401).json({ error: "Mines cannot be less than 1" })
        return res.end()
    }

    if (req.body.size < 3 || req.body.size > 8) {
        res.status(400).json({ error: "El tamaño del tablero debe estar entre 4 y 7" })
        return res.end()
    }

    if (!req.cookies.user_id) {
        res.status(400).json({ error: "No estás logeado" })
        return res.end()
    }

    //remove money from user
    
    //TODO: var si l'usuari ja esta en una partida de buscamines o no

    const gameexists = await gameExists(req.cookies.user_id, 1)
    if (gameexists) {
        res.status(409).json({error: "Ya estás en una partida", hash: gameexists})
        return res.end();
    }

    const queryUsers = `SELECT * FROM users WHERE id = '${req.cookies.user_id}'`
    const resultsUsers = await pool.query(queryUsers)

    if (!resultsUsers.length) {
        res.status(400).json({ error: "No se ha encontrado el usuario" })
        return res.end()
    }

    if (resultsUsers[0].money < req.body.bet) {
        res.status(402).json({ error: "No tienes suficiente dinero" })
        return res.end()
    }

    const queryMoney = `UPDATE users SET money = ${resultsUsers[0].money - req.body.bet} WHERE id = '${req.cookies.user_id}'`
    pool.query(queryMoney)

    matrix = []
    for (var i = 0; i < req.body.size; i++) {
        matrix[i] = []
        for (var j = 0; j < req.body.size; j++) {
            matrix[i][j] = 0
        }
    }
    
    //put mines
    for (var i = 0; i < req.body.mines; i++) {
        var x = Math.floor(Math.random() * req.body.size)
        var y = Math.floor(Math.random() * req.body.size)
        if (matrix[x][y] == 0) {
            matrix[x][y] = 1
        } else {
            i--
        }
    }

    checkedCells = []
    for (var i = 0; i < req.body.size; i++) {
        checkedCells[i] = []
        for (var j = 0; j < req.body.size; j++) {
            checkedCells[i][j] = 0
        }
    }

    const hash = crypto.randomBytes(16).toString("hex")

    const query = `INSERT INTO minesweeper (hash, user_id, bet, size, mines, matrix, isGameActive, checkedCells) VALUES ('${hash}', '${req.cookies.user_id}', '${req.body.bet}', '${req.body.size}', '${req.body.mines}', '${JSON.stringify(matrix)}', '1', '${JSON.stringify(checkedCells)}')`
    pool.query(query, (err, result) => {
        if (err) {
            res.status(500).json({ error: "Error intern al crear la partida" })
            return res.end()
        }
        res.status(200).json({ id: hash})
        return res.end()
    })
})

app.post('/minesweeper-game/:hex/end-game', async (req, res) => {
    if (!req.params.hex) {
        res.status(400).json({ error: "Faltan parametros" })
        return res.end()
    }

    const query = `SELECT * FROM minesweeper WHERE hash = '${req.params.hex}'`
    result = await pool.query(query)

    if (!result.length) {
        res.status(400).json({ error: "No se ha encontrado la partida" })
        return res.end()
    }

    const partida = result[0]

    if (partida.user_id != req.cookies.user_id) {
        res.status(400).json({ error: "No tienes permisos para jugar esta partida" })
        return res.end()
    }

    if (partida.isGameActive == 0) {
        res.status(400).json({ error: "La partida ya ha terminado" })
        return res.end()
    }

    partida.checkedCells = JSON.parse(partida.checkedCells)

    const query2 = `UPDATE minesweeper SET isGameActive = 0 WHERE hash = '${req.params.hex}'`
    await pool.query(query2)

    const multiplier = getMultiplier(partida.size**2, partida.checkedCells.reduce((a, b) => a.concat(b)).filter(x => x == 1).length, partida.mines)

    const query3 = `UPDATE users SET money = money + ${partida.bet * multiplier} WHERE id = '${req.cookies.user_id}'`
    await pool.query(query3)

    res.status(200).json({ message: "Partida terminada", multiplier: multiplier, bet: partida.bet })
    return res.end()
})


app.post('/minesweeper-game/:hex/reveal-mines', async (req, res) => {
    if (!req.params.hex) {
        res.status(400).json({ error: "Faltan parametros" })
        return res.end()
    }

    const query = `SELECT * FROM minesweeper WHERE hash = '${req.params.hex}'`
    result = await pool.query(query)

    if (!result.length) {
        res.status(400).json({ error: "No se ha encontrado la partida" })
        return res.end()
    }

    const partida = result[0]

    if (partida.user_id != req.cookies.user_id) {
        res.status(400).json({ error: "No tienes permisos para jugar esta partida" })
        return res.end()
    }

    if (partida.isGameActive == 1) {
        res.status(400).json({ error: "La partida aún no ha terminado" })
        return res.end()
    }

    res.status(200).json({ mines: partida.matrix })
    return res.end()
})


//Mantenc aquesta api, per a que si es recarrega la partida, es pugui calcular de quant és el check-out
app.post('/minesweeper-game/:hex/get-multiplier', async (req, res) => {
    if (!req.params.hex) {
        res.status(400).json({ error: "Faltan parametros" })
        return res.end()
    }

    const query = `SELECT * FROM minesweeper WHERE hash = '${req.params.hex}'`
    result = await pool.query(query)

    if (!result.length) {
        res.status(400).json({ error: "No se ha encontrado la partida" })
        return res.end()
    }

    const partida = result[0]

    if (partida.user_id != req.cookies.user_id) {
        res.status(400).json({ error: "No tienes permisos para jugar esta partida" })
        return res.end()
    }

    if (partida.isGameActive == 0) {
        res.status(400).json({ error: "La partida ya ha terminado" })
        return res.end()
    }

    const maxCells = partida.size**2
    const checkedCells = JSON.parse(partida.checkedCells).reduce((a, b) => a.concat(b)).filter(x => x == 1).length

    const multiplier = getMultiplier(maxCells, checkedCells, partida.mines)

    res.status(200).json({ multiplier: multiplier, bet: partida.bet })
})

app.post('/minesweeper-game/:hex/check-cell', async (req, res) => {
    if (!req.body.x || !req.body.y) {
        res.status(400).json({ error: "Faltan parametros" })
        return res.end()
    }

    const x = parseInt(req.body.x)
    const y = parseInt(req.body.y)

    if (!req.params.hex) {
        res.status(400).json({ error: "No se ha encontrado la partida" })
        return res.end()
    }

    gameexists = gameExists(req.cookies.user_id, 1)

    if (!gameExists) {
        res.status(400).json({ error: "No existe ninguna partida activa" })
        return res.end()
    }

    const query = `SELECT * FROM minesweeper WHERE hash = '${req.params.hex}'`
    result = await pool.query(query)

    if (!result.length) {
        res.status(400).json({ error: "No se ha encontrado la partida" })
        return res.end()
    }

    var partida = result[0]

    if (partida.user_id != req.cookies.user_id) {
        res.status(400).json({ error: "No tienes permisos para jugar esta partida" })
        return res.end()
    }

    if (partida.isGameActive == 0) {
        res.status(400).json({ error: "La partida ya ha terminado" })
        return res.end()
    }

    partida.checkedCells = JSON.parse(partida.checkedCells)
    partida.matrix = JSON.parse(partida.matrix)

    partida.checkedCells[y][x] = 1

    //revisa si la casilla es una mina, com ja es 1, no fa falta posar-ho explicitament, queda mes xuli
    if (partida.matrix[y][x]) {

        partida.isGameActive = false

        partida.checkedCells[y][x] = 2

        const query = `UPDATE minesweeper SET isGameActive = 0, checkedCells = '${JSON.stringify(partida.checkedCells)}' WHERE hash = '${req.params.hex}'`
        await pool.query(query)

        res.status(200).json({ cellResult: 1, currentGame: partida.checkedCells, isGameActive: 0})
        return res.end()
    }

    const maxCells = partida.size**2
    const checkedCells =partida.checkedCells.reduce((a, b) => a.concat(b)).filter(x => x == 1).length

    const multiplier = getMultiplier(maxCells, checkedCells, partida.mines)

    if (checkedCells == partida.size**2 - partida.mines) {
        partida.isGameActive = false

        const query = `UPDATE minesweeper SET isGameActive = 0, checkedCells = '${JSON.stringify(partida.checkedCells)}' WHERE hash = '${req.params.hex}'`
        await pool.query(query)

        const query3 = `UPDATE users SET money = money + ${partida.bet * multiplier} WHERE id = '${req.cookies.user_id}'`
        await pool.query(query3)

        res.status(200).json({ cellResult: 0, currentGame: partida.checkedCells, multiplier: multiplier, bet: partida.bet, isGameActive: 0})
        return res.end()
    }

    

    const query2 = `UPDATE minesweeper SET checkedCells = '${JSON.stringify(partida.checkedCells)}' WHERE hash = '${req.params.hex}'`
    await pool.query(query2)

    res.status(200).json({ cellResult: 0, currentGame: JSON.stringify(partida.checkedCells), multiplier: multiplier, bet: partida.bet, isGameActive: 1})
})

async function gameExists(user_id, gamemode) {
    /*
    MINESWEEPER: 1
    */

    switch (gamemode) {
        case 1:
            const query = `SELECT * FROM minesweeper WHERE user_id = '${user_id}' AND isGameActive = 1`
            const result = await pool.query(query)

            if (result.length) {
                return result[0].hash
            }
            return 0
    }
}

function getMultiplier(maxCells, checkedCells, mines) {
    const fairMultiplier = 1/calcMultiplier(checkedCells, mines)

    //Si es vol configurar, aqui hi ha el dumb_tax
    const houseEdge = 0.03
    const multiplier = Math.max(Math.floor(fairMultiplier * (1 - houseEdge)*100)/100, 1)

    return multiplier
}

function calcMultiplier(checkedCells, mines) {
    const size = 25 //5x5 mine grid = 25 cells
    chance = 1
    
    for (i = 0; i < checkedCells; i++) {
        chance *= (size - mines - i) / (size - i)
    }

    return chance
}

/*

CRASH GAME

*/


//GET THE MAX MULTIPLIER

function divisible(hash, mod) {
    // We will read in 4 hex at a time, but the first chunk might be a bit smaller
    // So ABCDEFGHIJ should be chunked like  AB CDEF GHIJ
    var val = 0;
  
    var o = hash.length % 4;
    for (var i = o > 0 ? o - 4 : 0; i < hash.length; i += 4) {
        val = ((val << 16) + parseInt(hash.substring(i, i + 4), 16)) % mod;
        //this code checks if the hash is divisible by the mod
    }
  
    return val === 0;
}

const salt = "0xd2867566759e9158bda9bf93b343bbd9aa02ce1e0c5bc2b37a2d70d391b04f14";
  
function crashPointFromHash(serverSeed) {
    const hash = crypto
      .createHmac("sha256", serverSeed)
      .update(salt)
      .digest("hex");
  
    const hs = parseInt(100 / 4);
    if (divisible(hash, hs)) {
        return 1;
    }
  
    const h = parseInt(hash.slice(0, 52 / 4), 16);
    const e = Math.pow(2, 52);
  
    console.log(h, e);
  
    return Math.floor((100 * e - h) / (e - h)) / 100.0;
}

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const crashGameEnabled = true

const RATE = 100
const NEW_GAME_COOLDOWN = 10000

let iteration = 1

let multiplier = 1
let lastMultiplier = 1

let newGameStarting = true
let newGameCooldown = NEW_GAME_COOLDOWN

let joiningPlayers = []
let joinedPlayers = []
let hash = ""

let maxMultiplier = 1.00

let tempo = 0

const crashGame = io.of('/crash');

//Max 30 multipliers
let lastMultipliers = []

let crashStatus = 1;
let graphData = []

let hasToUpdatePlayerList = false

/*
    1: New game starting
    2: Game in progress
*/

app.post('/crash/get-status', (req, res) => {
    if (!req.cookies.user_id) {
        res.status(400).json({ error: "No estás logeado" })
        return res.end()
    }

    switch (crashStatus) {
        case 1:
            console.log('1')
            let didJoin = false
            let bet = 0
            for (var i = 0; i < joiningPlayers.length; i++) {
                if (joiningPlayers[i].user_id == req.cookies.user_id) {
                    didJoin = true
                    bet = joiningPlayers[i].bet
                }
            }

            res.status(200).json({ status: 1, remaningTime: newGameCooldown, playerList: joiningPlayers, didJoin: didJoin, bet: bet})
            res.end()
            break
        case 2:
            console.log('2')
            var didJoin2 = false
            var bet2 = 0
            var hasCashOut = false
            var cashedMultiplier = 0
            for (var i = 0; i < joinedPlayers.length; i++) {
                if (joinedPlayers[i].user_id == req.cookies.user_id) {
                    didJoin2 = true
                    bet2 = joinedPlayers[i].bet
                    hasCashOut = joinedPlayers[i].hasCashOut
                    cashedMultiplier = joinedPlayers[i].multiplier
                }
            }

            res.status(200).json({ status: 2, graphData: graphData, iteration: iteration, didJoin: didJoin2, bet: bet2, hasCashOut: hasCashOut, multiplier: multiplier, cashedMultiplier: cashedMultiplier, playerList: joinedPlayers})
            res.end()
            break
    }
});

(async ()=> {
    while (crashGameEnabled) {
        await timeout(RATE)
        tempo += RATE
        //temps fins a començar la següent partida
        if (newGameStarting) {
            iteration = 0
            if (newGameCooldown > 0) {
                newGameCooldown -= RATE
                if (hasToUpdatePlayerList) {
                    hasToUpdatePlayerList = false
                    crashGame.emit('newGameStarting', {remaningTime: newGameCooldown, playerList: joiningPlayers})
                }
                crashGame.emit('newGameStarting', {remaningTime: newGameCooldown})
                continue
            } else {
                newGameStarting = false
                newGameCooldown = NEW_GAME_COOLDOWN

                multiplier = 1

                hash = crypto.randomBytes(16).toString("hex")

                crashGame.emit('newGame')
                
                console.log("New game starting")
            }
        }
        
        if (iteration == 0) {
            maxMultiplier = crashPointFromHash(hash)
            joinedPlayers = joiningPlayers
            joiningPlayers = []
            crashStatus = 2
        }

        if (multiplier > maxMultiplier) {
            newGameStarting = true
            joiningPlayers = []

            //update all crash games where hash == hash, to set isGameActive to 0

            if (lastMultipliers.length > 30) {
                lastMultipliers.shift()
            }
            lastMultipliers.push(maxMultiplier)
            
            crashGame.emit('crash', maxMultiplier)
            hasToUpdatePlayerList = true

            tempo = 0
            crashStatus = 1
            graphData = []

            //AUTOCHECKOUT
            for (var i = 0; i < joinedPlayers.length; i++) {
                if (joinedPlayers[i].autoCashOut) {
                    if (joinedPlayers[i].autoCashOut < maxMultiplier && !joinedPlayers[i].hasCashOut && joinedPlayers[i].autoCashOut != 0) {
                        joinedPlayers[i].hasCashOut = true
                        joinedPlayers[i].multiplier = maxMultiplier
                        const query = `UPDATE users SET money = money + ${joinedPlayers[i].bet * maxMultiplier} WHERE id = '${joinedPlayers[i].user_id}'`
                        await pool.query(query)
                        crashGame.emit('autoCashOut', {user_id: joinedPlayers[i].user_id, name: joinedPlayers[i].name, multiplier: maxMultiplier, bet: joinedPlayers[i].bet})
                    }
                }
            }

            continue
        }

        //AUTOCHECKOUT
        for (var i = 0; i < joinedPlayers.length; i++) {
            if (joinedPlayers[i].autoCashOut) {
                if (multiplier >= joinedPlayers[i].autoCashOut && !joinedPlayers[i].hasCashOut && joinedPlayers[i].autoCashOut != 0) {
                    joinedPlayers[i].hasCashOut = true
                    joinedPlayers[i].multiplier = multiplier
                    const query = `UPDATE users SET money = money + ${joinedPlayers[i].bet * multiplier} WHERE id = '${joinedPlayers[i].user_id}'`
                    await pool.query(query)
                    crashGame.emit('autoCashOut', {user_id: joinedPlayers[i].user_id, name: joinedPlayers[i].name, multiplier: multiplier, bet: joinedPlayers[i].bet})
                }
            }
        }
        
        iteration++
        lastMultiplier = multiplier
        multiplier = 1+(((iteration*0.15)*(iteration*0.04)*(1+(iteration*0.002)))/400)*2

        //s'afegeix dos vegades pq sóc subnormal
        graphData.push(multiplier)
        graphData.push(multiplier)

        if (hasToUpdatePlayerList) {
            hasToUpdatePlayerList = false
            crashGame.emit('multiplier',  {multiplier: multiplier, iteration: iteration, tempo: tempo, playerList: joinedPlayers})
        } else {
            crashGame.emit('multiplier',  {multiplier: multiplier, iteration: iteration, tempo: tempo})
        }

        //console.log(`Multiplier: ${multiplier} / Max: ${maxMultiplier}`)
    }
})()

app.get('/crash', (req, res) => {
    res.sendFile(path.join(__dirname + '/client/games/crash/crash.html'));
})

app.post('/crash/join', async (req, res) => {
    console.log(req.cookies, req.body)
    if (!req.body.bet || !req.cookies.user_id) {
        res.status(400).json({ error: "Faltan parametros" })
        return res.end()
    }

    if (req.body.autoCashOut) {
        if (isNaN(parseFloat(req.body.autoCashOut))) {
            res.status(400).json({ error: "Autocashout no válido" })
            return res.end()
        }
        
        if (req.body.autoCashOut < 1) {
            res.status(400).json({ error: "El autocashout mínimo es de 1" })
            return res.end()
        }
    } else {
        req.body.autoCashOut = 0
    }
    
    if (req.body.bet < 1) {
        res.status(400).json({ error: "La apuesta mínima es de 1" })
        return res.end()
    }

    if (!await checkBalance(req.cookies.user_id, req.body.bet)) {
        res.status(400).json({ error: "No tienes suficiente dinero" })
        return res.end()
    }

    if (!newGameStarting) {
        res.status(400).json({ error: "La partida ya ha empezado" })
        return res.end()
    }

    for (var i = 0; i < joiningPlayers.length; i++) {
        if (joiningPlayers[i].user_id == req.cookies.user_id) {
            res.status(400).json({ error: "Ya estás en la partida" })
            return res.end()
        }
    }

    hasToUpdatePlayerList = true
    await removeMoney(req.cookies.user_id, req.body.bet)
    joiningPlayers.push({user_id: req.cookies.user_id, bet: parseFloat(req.body.bet), name: await getName(req.cookies.user_id), hasCashOut: false, multiplier: 0, autoCashOut: parseFloat(req.body.autoCashOut)})
    res.status(200).json({ message: "Te has unido a la partida" })
})

async function checkBalance(user_id, bet) {
    const query = `SELECT * FROM users WHERE id = '${user_id}'`
    const result = await pool.query(query)

    if (parseFloat(result[0].money) < parseFloat(bet)) {
        return false
    }
    return true
}

async function removeMoney(user_id, bet) {
    const query = `SELECT * FROM users WHERE id = '${user_id}'`
    const result = await pool.query(query)
    const newBalance = result[0].money - bet

    const query2 = `UPDATE users SET money = ${newBalance} WHERE id = '${user_id}'`
    await pool.query(query2)
}

app.post('/crash/check-out', async (req, res) => {
    if (!req.cookies.user_id) {
        res.status(400).json({ error: "No estás logeado" })
        return res.end()
    }

    if (crashStatus == 1) {
        res.status(400).json({ error: "La partida aún no ha empezado" })
        return res.end()
    }

    let bet = 0
    for (var i = 0; i < joinedPlayers.length; i++) {
        bet = parseFloat(joinedPlayers[i].bet)
        joinedPlayers[i].hasCashOut = true
        joinedPlayers[i].multiplier = multiplier
        break
    }
    bet *= multiplier

    const query = `UPDATE users SET money = money + ${bet} WHERE id = '${req.cookies.user_id}'`
    await pool.query(query)

    crashGame.emit('autoCashOut', {user_id: req.cookies.user_id, name: await getName(req.cookies.user_id), multiplier: multiplier, bet: bet})

    res.status(200).json({ message: "Has cobrado " + bet, prize: bet})
})

app.get('/crash/last-multipliers', (req, res) => {
    res.status(200).json({ multipliers: lastMultipliers })
    res.end()
})

function getName(user_id) {
    return new Promise((resolve, reject) => {
        const query = `SELECT * FROM users WHERE id = '${user_id}'`
        pool.query(query, (err, result) => {
            if (err) {
                reject(err)
            }
            resolve(result[0].name)
        })
    })
}