
document.addEventListener('DOMContentLoaded', (event) => {
    loadGame(hex)

    const minesInput = document.getElementById('mines')
    const betInput = document.getElementById('bet-amount')

    function loadGame(hex) {
        $.ajax({
            url: `${hex}/get-game`,
            type: 'POST',
            headers: defHeaders,
            success: function (data) {
                console.log(data)
    
                minesInput.value = data.mines
                betInput.value = data.bet
                drawMinesweeper(data.game)
            },
            error: function (err) {
               console.log(err)
            }
        })
    }
})