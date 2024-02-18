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

app.post('/minesweeper/create-game', async (req, res) => {
    if (!req.body.bet || !req.body.size || !req.body.mines) {
        res.status(400).json({ error: "Faltan parametros (bet, size, mines)" })
        return res.end()
    }

    req.body.bet = parseFloat(req.body.bet)
    req.body.mines = parseInt(req.body.mines)

    if (req.body.bet < 0) {
        res.status(400).json({ error: "La apuesta no puede ser negativa" })
        return res.end()
    }

    if (req.body.mines > 20 && req.body.mines > 1) {
        res.status(400).json({ error: "El numero de minas no puede ser superior a 20 o inferior a 1" })
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
        res.status(400).json({error: "Ya estás en una partida"})
        return res.end();
    }


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
        res.status(400).json({ error: "La ya ha terminado" })
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

        res.status(200).json({ cellResult: 1, currentGame: partida.checkedCells })
        return res.end()
    }

    const maxCells = partida.size**2
    const checkedCells =partida.checkedCells.reduce((a, b) => a.concat(b)).filter(x => x == 1).length

    const multiplier = getMultiplier(maxCells, checkedCells, partida.mines)

    const query2 = `UPDATE minesweeper SET checkedCells = '${JSON.stringify(partida.checkedCells)}' WHERE hash = '${req.params.hex}'`
    await pool.query(query2)

    res.status(200).json({ cellResult: 0, currentGame: JSON.stringify(partida.checkedCells), multiplier: multiplier, bet: partida.bet })
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
                return result[0].id
            }
            return 0
    }
}

function getMultiplier(maxCells, checkedCells, mines) {
    const numerador = probForm(maxCells - checkedCells, maxCells - checkedCells-mines)
    const denominador = probForm(maxCells, maxCells - mines)

    const win_prob = numerador/denominador

    const fairMultiplier = 1/win_prob

    //Si es vol configurar, aqui hi ha el dumb_tax
    const houseEdge = 0.03
    const multiplier = Math.max(Math.floor(fairMultiplier * (1 - houseEdge)*100)/100, 1)

    return multiplier
}

//NO TOCAR; D'ALGUNA MANERA FUNCIONA, es una funcio per a calcular el multiplicador del buscamines
function probForm(a, b) {
    var a1 = a-b
    var a2 = a

    for (var i = 0; i < a1; i++) {
        if (!a2) {
            a2 = a-i
            continue
        }
        a2*=a-i
    }
    return a2
}