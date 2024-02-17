const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const gameSchema = new Schema({
    id: {
        type: String,
        required: true
    },
    user: {
        type: String,
        required: true
    },
    bet: {
        type: Number,
        required: true
    },
    dimension: {
        type: Number,
        required: true
    },
    mines: {
        type: Number,
        required: true
    },
    matrix: {
        type: Array,
        required: true
    },
    isGameActive: {
        type: Boolean,
        required: true
    },
    checkedCells: {
        type: Array,
        required: true
    }
}, { timestamps: true });

const Game = mongoose.model('Game', gameSchema);
module.exports = Game;