
document.addEventListener('DOMContentLoaded', (event) => {
    loadGame(hex)
    updateBalance()

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
                var changed = false

                for (var i = 0; i < $('.mine-input-number').length; i++) {
                    if ($('.mine-input-number')[i].innerHTML == data.mines) {
                        changed = true
                        $('.mine-input-number')[i].classList.add('selected')
                    }
                }

                if (!changed) {
                    switchCustom(document.getElementById('custom-mines'))

                    const input = document.getElementById('custom-mines-input')
                    document.getElementById('custom-mines').classList.add('selected')

                    input.classList.add('blocked')
                    input.disabled = true
                    input.value = data.mines
                    input.blur()
                }
                betInput.value = data.bet
                
                drawMinesweeper(data.game, data.isGameActive)
            },
            error: function (err) {
               console.log(err)
            }
        })
    }
})