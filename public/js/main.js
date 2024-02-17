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