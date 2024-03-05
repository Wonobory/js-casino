document.addEventListener('DOMContentLoaded', async () => {

    const canvas = document.getElementById('render')
    const ctx = canvas.getContext('2d');

    // Datos para el gráfico lineal (solo como ejemplo)




    // Configuración del gráfico
    const margen = 40;
    const ancho = canvas.width - 2 * margen;
    const alto = canvas.height - 2 * margen;


    const img = new Image();
    img.src = '/img/crash_rocket.png';

    // Función para dibujar el gráfico lineal con curvas de Bézier
    function dibujarGraficoLinealConBezier(datos, seconds) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Calcular la distancia horizontal entre los puntos
        const pasoX = Math.min(ancho / (datos.length - 1), 5);
        ctx.lineWidth = 2;

        // Encontrar el valor máximo en los datos
        const valorMaximo = Math.max(Math.max(...datos), 1.8);
        const valorMinimo = Math.min(Math.min(...datos), 0); // Valor mínimo en los datos

        ctx.strokeStyle = 'rgb(68,69,84)'
        ctx.fillStyle = 'rgb(68,69,84)'
        

        ctx.beginPath();
        ctx.moveTo(margen, canvas.height - margen*0.4);
        ctx.lineTo(margen, canvas.height - margen*0.75);
        ctx.fillText(`0s`, margen-5, canvas.height - 4);
        ctx.stroke();

        seconds = seconds / 1000


        let modificador = 1
        if (seconds > 20) {
            modificador = 2
        }
        if (seconds > 30) {
            modificador = 5
        }
        if (seconds > 60) {
            modificador = 10
        }

        seconds = seconds * 1000

        let lineas = Math.floor(((seconds / 40) / 25) / modificador)

        const pasoX2 = Math.min(ancho / ((seconds/40) - 1), 5);

        // Dibujar líneas de tiempo para los 2 segundos
        for (let i = 0; i < lineas; i++) {
            const x = margen + (i + 1) * modificador * 25 * pasoX2;
            
            ctx.beginPath();
            ctx.moveTo(x, canvas.height - margen*0.4);
            ctx.lineTo(x, canvas.height - margen*0.75);
            ctx.fillText(`${(i+1) * modificador}s`, x-5, canvas.height - 4);
            ctx.stroke();
        }

        // Dibujar líneas y etiquetas en el eje y
        ctx.fillStyle = 'red'; // Cambiar color del texto
        ctx.textAlign = 'start'; // Alinear el texto a la izquierda
        ctx.textBaseline = 'middle'; // Alinear verticalmente el texto al centro

        const valorRange = valorMaximo - valorMinimo;
        const numLineasY = Math.ceil(1.25*valorRange); // Número de líneas y etiquetas en el eje y
        const pasoY = (alto) / (1.25*valorRange); // Paso entre líneas en el eje y
        let incremento = numLineasY > 10 ? 2 : 1;

        if (numLineasY > 500) {
            incremento = 100
        } else if (numLineasY > 200) {
            incremento = 50
        } else if (numLineasY > 100) {
            incremento = 20
        } else if (numLineasY > 50) {
            incremento = 10
        } else if (numLineasY > 20) {
            incremento = 5
        } else if (numLineasY > 10) {
            incremento = 2
        } else if  (numLineasY > 5){
            incremento = 1
        } else if (numLineasY > 2) {
            incremento = 0.5
        }

        incremento = getIncremento(numLineasY)/10

        for (let i = 0; i <= numLineasY; i += incremento) {
            const y = canvas.height - margen - i * pasoY;
            const valorY = valorMinimo + i+1; // Valor correspondiente a la línea y

            // Dibujar línea en el eje y
            ctx.beginPath();
            ctx.moveTo(canvas.width - 0.8* margen, y);
            ctx.lineTo(canvas.width - 0.6* margen, y);
            ctx.stroke();

            // Escribir valor en el eje y
            ctx.fillText(`x${valorY}`, canvas.width - 20, y);
        }        
        

        // Dibujar curva de Bézier
        ctx.beginPath();

        ctx.strokeStyle = 'rgb(123,108,168)';
        ctx.lineWidth = 4;

        ctx.moveTo(margen, canvas.height - margen - (datos[0]-1) * (alto / (1.25*valorMaximo)));

        for (let i = 0; i < datos.length - 1; i++) {
            // Puntos de control para la curva de Bézier
            const x1 = margen + (i + 1) * pasoX + pasoX / 2;
            const y1 = canvas.height - margen - (datos[i + 1]-1) * (alto / (1.25*valorMaximo));
            const x2 = margen + i * pasoX - pasoX / 2;
            const y2 = canvas.height - margen - (datos[i]-1) * (alto / (1.25*valorMaximo));
            const x = margen + (i + 1) * pasoX;
            const y = canvas.height - margen - (datos[i + 1]-1) * (alto / (1.25*valorMaximo));

            // Dibujar curva de Bézier
            ctx.bezierCurveTo(x1, y1, x2, y2, x, y);
        }

        ctx.stroke();


        //DRAW ROCKET
        
        ctx.drawImage(img, margen + (datos.length - 1) * pasoX - 32.5, canvas.height - margen - (datos[datos.length - 1]-1) * (alto / (1.25*valorMaximo))- 38, 75, 75);
    }

    function multiplierAnimation() {
        if (!document.getElementById('multiplier').style.fontSize) {
            document.getElementById('multiplier').style.fontSize = '50px'
        }
        currentSize = parseInt(document.getElementById('multiplier').style.fontSize)
        currentSize += 60
        document.getElementById('multiplier').style.fontSize = currentSize + 'px'
        setTimeout(() => {
            currentSize -= 60
            document.getElementById('multiplier').style.fontSize = currentSize + 'px'
        }, 300)
    }

    function getIncremento(numLineasY) {
        // Inicia una matriz de incrementos con el valor 1
        const incrementos = [1];
    
        // Mientras que el último valor de la matriz sea menor que numLineasY
        while (incrementos[incrementos.length - 1] < numLineasY) {
            // Multiplica el último valor por un factor y añade el resultado a la matriz
            let ultimoValor = incrementos[incrementos.length - 1];
            let factor = ultimoValor === 1 || ultimoValor === 5 ? 2 : 5;
            incrementos.push(ultimoValor * factor);
        }
    
        // Usa el último valor de la matriz como incremento
        let incremento = incrementos[incrementos.length - 1];
    
        return incremento;
    }

    function promedioMovil(datos, N) {
        const longitud = Math.min(N, datos.length);
        const valoresUltimos = datos.slice(-longitud);
        const suma = valoresUltimos.reduce((acumulador, valor) => acumulador + valor, 0);
        return suma / longitud;
    }

    // Llamar a la función para dibujar el gráfico lineal con curvas de Bézier


    var multiplier = 1
    var lastMultiplier = 1

    var iteration = 1
    var goal = 9999999

    

    var rate = 50

    var segons = 10;

    let gameStarted = false

    const socket = io('ws://localhost:7777/crash', {
        withCredentials: true
    })

    let localTempo = 0
    let serverTempo = 0

    socket.emit('join', 100)

    socket.on('multiplier', (data) => {
        lastMultiplier = multiplier
        multiplier = data.multiplier
        iteration = data.iteration
        serverTempo = data.tempo
        datos.push(multiplier)
        setTimeout(() => {
        datos.push(multiplier)}, 40)

        if (!gameStarted) {
            startGame()
        }
    })

    

    socket.on('newGame', (data) => {
        console.log('New Game', data)
        datos = []
        keepGoing = true
        multiplier = 1
        lastMultiplier = 1
        segons = 0
        startGame()
    })

    datos = []

    function modalNewGame(remaningTime) {
        //TODO
        console.log('New Game', remaningTime)
    }

    function updateJoiningPlayers(joinedPlayers) {
        //TODO
    }

    $.ajax({
        url: '/crash/get-status',
        method: 'POST',
        success: function (data) {
            switch (data.status) {
                case 1:
                    modalNewGame(data.remaningTime)
                    updateJoiningPlayers(data.joinedPlayers)
                    datos = data.graphData
            }
        }
    })

    async function startGame() {
        socket.on('crash', (data) => {
            console.log('Crash', data)
            keepGoing = false
            
            multiplier = data
            datos[datos.length-1] = multiplier
            document.getElementById('multiplier').innerHTML = 'x'+multiplier.toFixed(2)

            iteration = 0
            localTempo = 0
            serverTempo = 0

            gameStarted = false
        })

        gameStarted = true
        var keepGoing = true

        var lastMultiplierDivisible = 0;

        while (keepGoing) {
            await timeout(rate)
            if (multiplier > goal) {
                keepGoing = false
            }
            
            if (datos.length > 5000) {
                datos.shift()
            }


            document.getElementById('multiplier').innerHTML = 'x'+datos[datos.length-1].toFixed(2)
            if (lastMultiplier != multiplier && parseInt(multiplier) > lastMultiplierDivisible) {
                multiplierAnimation()
                console.log('animation')
                lastMultiplierDivisible = parseInt(multiplier)
            }
            
            iteration++
            segons += rate
            document.getElementById('segons').innerHTML = (segons/1000).toFixed(1)+'s'
            dibujarGraficoLinealConBezier(datos, segons)
        }
    }
})

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

