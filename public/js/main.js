function drawMinesweeper(dimension) {
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
            element.className = "cell";
            element.id = "cell" + i + j;
            element.onclick = function() {
                console.log("puta")
            };

            document.getElementById("row" + i).appendChild(element);
        }
    }
    
    (async () => {
        const rawResponse = await fetch('/minesweeper/create-game', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            user: "wonobory",
            bet: parseFloat(document.getElementById("bet-amount").value),
            dimension: dimension,
            mines: parseInt(document.getElementById("mines").value)
          })
        })

        const res = await rawResponse
        if (res.status == 400) {
          alert("Ya estás en una partida")
          setCookie("game", res.json().id, 30)
          return
        } 
        if (res.status == 200) {
          setCookie("game", await res.json().id, 30)
          disableButtons();
          return
        }
    })();
    
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

function disableButtons() {
  document.getElementById("bet-amount").disabled = true;
  document.getElementById("mines").disabled = true;
  document.getElementById("start").innerHTML = "Check-out";
  document.getElementById("start").className = "check-out";
  document.getElementById("start").style.backgroundColor = "#44A64A";
  document.getElementById("start").style.color = "black";
}

//when ready
document.addEventListener("DOMContentLoaded", function(event) {
  disabledMinesweeper(5)
});

function checkCell(x, y) {
  (async () => {
    const rawResponse = await fetch('/minesweeper/check-cell', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user: "wonobory",
        id: ""
      })
    });
    const content = await rawResponse.json();
  
    console.log(content);
  })();
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

