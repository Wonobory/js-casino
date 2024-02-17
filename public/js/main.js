const defHeaders = {
  'Accept': 'application/json',
  'Content-Type': 'application/json'
}

function drawMinesweeper(game) {
    var where = document.getElementById("minesweeper");
    
    game = JSON.parse(game)
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
            element.className = "cell unchecked";
            element.id = "cell" + i + j;
            
            element.setAttribute("data-x", j);
            element.setAttribute("data-y", i);

            element.onclick = function() {
              checkCell(this.getAttribute("data-x"), this.getAttribute("data-y"));
            };

            document.getElementById("row" + i).appendChild(element);
          } else if (game[i][j] == 1) {
            element = document.createElement("div");
            element.className = "cell checked";
            element.id = "cell" + i + j;

            document.getElementById("row" + i).appendChild(element);
          } else if (game[i][j] == 2) {
            element = document.createElement("div");
            element.className = "cell mine";
            element.id = "cell" + i + j;

            document.getElementById("row" + i).appendChild(element);
            hasToBlock = true
          }
        }
    }

    if (hasToBlock) {
      blockCells(game)
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

      for (var j = 0; j < dimension; j++) {
        element = document.createElement("div");
        element.className = "cell disabled";
        element.id = "cell" + i + j;

        document.getElementById("row" + i).appendChild(element);
      }
  }
}

//when ready
document.addEventListener("DOMContentLoaded", function(event) {
  disabledMinesweeper(5)
});

function checkCell(x, y) {
  $.ajax({
    url: `${hex}/check-cell`,
    type: 'POST',
    headers: defHeaders,
    data: JSON.stringify({
      x: x,
      y: y,
    }),
    success: function (data) {
      if (data.cellResult == 0) {
        document.getElementById("cell" + y + x).className = "cell checked";
        document.getElementById("cell" + y + x).onclick = null;
      } else if (data.cellResult == 1) {
        document.getElementById("cell" + y + x).className = "cell mine";
        document.getElementById("cell" + y + x).onclick = null;
        blockCells(5)
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

