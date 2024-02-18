const defHeaders = {
  'Accept': 'application/json',
  'Content-Type': 'application/json'
}

let Game = [[0,0,0,0,0],
            [0,0,0,0,0],
            [0,0,0,0,0],
            [0,0,0,0,0],
            [0,0,0,0,0]]

function drawMinesweeper(game) {
    var where = document.getElementById("minesweeper");
    
    game = JSON.parse(game)
    Game = game
    //clear minesweeper
    while (where.firstChild) {
        where.removeChild(where.firstChild);
    }

    let hasToBlock = false

    for (var i = 0; i < game.length; i++) {
        element = document.createElement("div");
        element.className = "row";
        element.id = "row" + i;

        where.appendChild(element);

        //i = y axis
        //j = x axis

        for (var j = 0; j < game[i].length; j++) {
          if (game[i][j] == 0) {
            element = document.createElement("div");
            img = document.createElement("img");

            element.className = "cell unchecked";
            element.id = "cell" + i + j;
            
            element.setAttribute("data-x", j);
            element.setAttribute("data-y", i);

            element.onclick = function() {
              checkCell(this.getAttribute("data-x"), this.getAttribute("data-y"));
            };

            img.src = "/svg/espinaca-gray.png";
            img.className = "img-cell unchecked-img";
            img.id = "img-cell" + i + j;
            img.setAttribute("draggable", "false")
            
            element.appendChild(img);

            document.getElementById("row" + i).appendChild(element);
          } else if (game[i][j] == 1) {
            element = document.createElement("div");
            element.className = "cell checked";
            element.id = "cell" + i + j;

            img = document.createElement("img");
            img.src = "/svg/star.svg";
            img.className = "img-cell";
            img.id = "img-cell" + i + j;
            img.setAttribute("draggable", "false")
            
            element.appendChild(img);

            document.getElementById("row" + i).appendChild(element);
          } else if (game[i][j] == 2) {
            element = document.createElement("div");
            element.className = "cell mine";
            element.id = "cell" + i + j;

            img = document.createElement("img");
            img.src = "/svg/bomba.png";
            img.className = "bomb-img img-cell";
            img.id = "img-cell" + i + j;
            img.setAttribute("draggable", "false")

            element.appendChild(img);

            document.getElementById("row" + i).appendChild(element);
            hasToBlock = true
          }
        }
    }

    if (hasToBlock) {
      blockCells(game)
      revealMines(hex, Game)
      switchToNewGame()
    } else {
      $.ajax({
        url: `${hex}/get-multiplier`,
        type: 'POST',
        headers: defHeaders,
        success: function (data2) {
            const checkout = document.getElementById("check-out")
            const prize = data2.bet * data2.multiplier

            checkout.innerText = `Cash-Out $${parseFloat(prize.toFixed(3)).toLocaleString()}`
        },
        error: function (err) {
            console.log('Error:' + err)
        }
      })
    }
}

function switchToNewGame() {
  const checkout = document.getElementById('check-out')
  checkout.className = 'start-game'
  checkout.innerText = 'Start Game'
  checkout.onclick = function() {
    createGame(document.getElementById('bet-amount').value, document.getElementById('mines').value, 5)
  }

  const minesInput = document.getElementById('mines')
  const betInput = document.getElementById('bet-amount')

  minesInput.disabled = false
  betInput.disabled = false

  minesInput.value = ''
  betInput.value = ''

  betInput.classList.remove('blocked')

  $('.mine-input-number').each(function() {
    this.classList.remove('selected')
    this.classList.remove('blocked')
    if (this.id == 'custom-mines') {
      this.onclick = function() {
        switchCustom(this)
      }
    } else {
      this.onclick = function() {
        selectMine(this, this.innerText)
      }
    }
    
  })
  document.getElementById('custom-mines-input').disabled = false
  document.getElementById('custom-mines-input').classList.remove('blocked')

  if (document.getElementById('custom-mines-input')) {
    switchCustom(document.getElementById('custom-mines'))
  }
}

function changeImg(img, type) {
    if (type == "unchecked") {
      img.src = "/svg/espinaca-gray.png";
      img.className = "img-cell unchecked-img";
    } 
    else if (type == "checked") {
      img.src = "/svg/star.svg";
      img.className = "img-cell";
    }
    else if (type == "bomb") {
      img.src = "/svg/bomba.png";
      img.className = "bomb-img img-cell";
    }
  }

function blockCells(game) {
  for (var i = 0; i < game.length; i++) {
    for (var j = 0; j < game[i].length; j++) {
      document.getElementById("cell" + i + j).onclick = null;
      document.getElementById("cell" + i + j).style.cursor = "not-allowed";
    }
  }
}

function revealMines(hex, game) {
  $.ajax({
    url: `${hex}/reveal-mines`,
    type: 'POST',
    headers: defHeaders,
    success: function (data) {
      console.log(data)
      matrix = JSON.parse(data.mines)

      for (var i = 0; i < matrix.length; i++) {
        for (var j = 0; j < matrix[i].length; j++) {
          if (matrix[i][j] == 1 && game[i][j] == 0) {
            document.getElementById("cell" + i + j).className = "cell mine revealed";
            changeImg(document.getElementById("img-cell" + i + j), "bomb")
          }
          if (matrix[i][j] == 0 && game[i][j] == 0) {
            document.getElementById("cell" + i + j).className = "cell checked revealed";
            changeImg(document.getElementById("img-cell" + i + j), "checked")
          }
        }
      }
    },
    error: function (err) {
      console.log(err)
    }
  })
}


function disabledMinesweeper(dimension) {
  var where = document.getElementById("minesweeper");

  //clear minesweeper
  while (where.firstChild) {
      where.removeChild(where.firstChild);
  }

  for (var i = 0; i < dimension; i++) {
    element = document.createElement("div");
    element.className = "row";
    element.id = "row" + i;

    where.appendChild(element);

    //i = y axis
    //j = x axis

    for (var j = 0; j < dimension; j++) {
      element = document.createElement("div");
      img = document.createElement("img");

      element.className = "cell";
      element.id = "cell" + i + j;

      img.src = "/svg/espinaca-gray.png";
      img.className = "img-cell";
      img.setAttribute("draggable", "false")
      
      element.appendChild(img);

      document.getElementById("row" + i).appendChild(element);
    }
  }

  blockCells(Game)
}

//when ready
document.addEventListener("DOMContentLoaded", function(event) {
  disabledMinesweeper(5)
});

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function checkCell(x, y) {
  $.ajax({
    url: `${hex}/check-cell`,
    type: 'POST',
    headers: defHeaders,
    data: JSON.stringify({
      x: x,
      y: y,
    }),
    success: async function (data) {
      if (data.cellResult == 0) {

        document.getElementById("cell" + y + x).className = "cell checked";
        document.getElementById("cell" + y + x).onclick = null;
        Game[y][x] = 1
        changeImg(document.getElementById("img-cell" + y + x), "checked")

        const div = document.createElement("div")
        const span = document.createElement("span")

        div.className = "multiplier-container"
        span.className = "multiplier-text"
        span.innerText = data.multiplier+'x'

        const checkout = document.getElementById("check-out")
        const prize = data.bet * data.multiplier

        checkout.innerText = `Cash-Out $${parseFloat(prize.toFixed(3)).toLocaleString()}`

        div.appendChild(span)
        document.getElementById("cell" + y + x).appendChild(div)
        await timeout(1500)
        div.style.transform = "translateY(-25px)"
        await timeout(400)
        div.style.opacity = "0"
        await timeout(400)
        div.style.display = "none"

      } else if (data.cellResult == 1) {
        const cell = document.getElementById("cell" + y + x)
        cell.className = "cell mine";
        cell.onclick = null;
        Game[y][x] = 2

        changeImg(document.getElementById("img-cell" + y + x), "bomb")
        $('#cell' + y + x).effect("shake", {times: 5}, 500);
        revealMines(hex, Game)
        blockCells(Game)
        switchToNewGame()
      }
    },
    error: function (err) {
      console.log(err)
    }
  })
}

function createGame(bet, mines, size) {
  $.ajax({
    url: '/minesweeper/create-game',
    type: 'POST',
    headers: defHeaders,
    data: JSON.stringify({
      bet: bet,
      mines: mines,
      size: size
    }),
    success: function (data) {
      console.log(data)
      window.location.href = `/minesweeper-game/${data.id}`
    },
    error: function (err) {
      console.log(err)
    }
  })
}

function getMultiplier(hex) {
  $.ajax({
    url: `${hex}/get-multiplier`,
    type: 'POST',
    headers: defHeaders,
    success: function (data) {
      console.log(data)
    },
    error: function (err) {
      console.log(err)
    }
  })
}

function selectMine(selector, value) {

  if (document.getElementById('custom-mines').firstChild.className == 'custom-input' && selector != document.getElementById('custom-mines')) {
    switchCustom(document.getElementById('custom-mines'))
  }

  if (!selector.classList.contains('selected')) {
    selector.classList.add('selected')
  }

  const mines = document.getElementById('mines')
  mines.value = value
 
  $('.mine-input-number').each(function() {
    if (this !== selector) {
      this.classList.remove('selected')
    }
  })
}

function switchCustom(element) {
  console.log(element)
  if (element.firstChild.className == 'custom-input') {
    element.innerText = 'Custom'
    element.onclick = function() {
      switchCustom(this)
    }
  } else {
    const input = document.createElement('input') 
    input.type = 'number'
    input.className = 'custom-input'
    input.id = 'custom-mines-input'
    input.placeholder = ''
    input.oninput = function() {
      selectMine(this.parentElement, this.value)
    }
    element.innerText = ''
    element.appendChild(input)
    element.onclick = null
    input.focus()
    input.value = '1'
    selectMine(element, 1)
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