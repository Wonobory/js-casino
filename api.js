const express = require("express");
const app = express();

const path = require('path');

const fs = require('fs')

const partida = "test";
const mysql = require('mysql');
const bodyParser = require('body-parser')


const cors = require('cors');
const { json } = require("body-parser");

const crypto = require("crypto")

const { promisify } = require('util')


const mongoose = require('mongoose')
const Game = require('./models/game');
const res = require("express/lib/response");

dbURI = "mongodb://localhost:27017/minesweeper"


mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((result) => {
        console.log("Conectat a la base de dades")
        app.listen(777, () => {
            console.log("Servidor modo facherito al port 777😎");
        });
        
    })
    .catch((err) => console.log(err)
);

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

app.get('/codelearn-decrypt', (req, res) => {
    res.sendFile(path.join(__dirname + '/client/codelearn-decrypt.html'));
})

app.post('/minesweeper/create-game', async (req, res) => {
    if (req.body.user == undefined || req.body.bet == undefined || req.body.dimension == undefined || req.body.mines == undefined ) {
        res.status(400).json({ error: "Faltan parametros" })
        return res.end()
    }

    if (req.body.bet < 0) {
        res.status(400).json({ error: "La apuesta no puede ser negativa" })
        return res.end()
    }

    if (req.body.mines > 5) {
        res.status(400).json({ error: "El numero de minas no puede ser superior a 5" })
        return res.end()
    }

    //remove money from user
    gameExists = await Game.exists({ user: req.body.user, isGameActive: true })
    if (gameExists) {
        var toSend = await Game.findById(gameExists._id)
        res.status(400).json({error: "Ya estás en una partida", id: toSend.id})
        return res.end();
    }
    


    matrix = []
    for (var i = 0; i < req.body.dimension; i++) {
        matrix[i] = []
        for (var j = 0; j < req.body.dimension; j++) {
            matrix[i][j] = 0
        }
    }
    
    //put mines
    for (var i = 0; i < req.body.mines; i++) {
        var x = Math.floor(Math.random() * req.body.dimension)
        var y = Math.floor(Math.random() * req.body.dimension)
        if (matrix[x][y] == 0) {
            matrix[x][y] = 1
        } else {
            i--
        }
    }

    checkedCells = []
    for (var i = 0; i < req.body.dimension; i++) {
        checkedCells[i] = []
        for (var j = 0; j < req.body.dimension; j++) {
            checkedCells[i][j] = 0
        }
    }

    const id = crypto.randomBytes(16).toString("hex")

    const game = new Game({
        id: id,
        user: req.body.user,
        bet: req.body.bet,
        dimension: req.body.dimension,
        mines: req.body.mines,
        matrix: matrix,
        isGameActive: true,
        checkedCells: checkedCells
    })
    
    game.save().then((result) => {
        res.status(200).json({ id: result.id})
    }).catch((err) => {
        res.status(400).json({ error: err })
    })
})

app.post('/minesweeper/check-cell', async (req, res) => {
    if (req.body.id == undefined || req.body.x == undefined || req.body.y == undefined || req.body.user == undefined) {
        res.status(400).json({ error: "Faltan parametros" })
        return res.end()
    }

    gameExists = await Game.exists({ user: req.body.user, isGameActive: true })

    if (!gameExists) {
        res.status(400).json({ error: "No existe ninguna partida activa" })
        return res.end()
    }

    game = await Game.findById(gameExists._id)

    game.checkedCells[req.body.x][req.body.y] = 1
    if (game.matrix[req.body.x][req.body.y] == 1) {
        game.isGameActive = false
        res.status(200).json({ cellResult: 1, currentGame: game.checkedCells })
    }
    else {
        res.status(200).json({ cellResult: 0, currentGame: game.checkedCells })
    }
})