const defHeaders = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
}

document.getElementById('multiply-bet').onclick = function() {
    const BET = document.getElementById('bet-amount');
    var balance = document.getElementById('balance');
    var balanceValue = parseFloat(balance.innerText.replace(/\./g, '').replace(/,/g, '.'));

    var changeTo = parseFloat(BET.value) * 2;

    if (changeTo > balanceValue) {
        changeTo = balanceValue;
    }

    BET.value = changeTo;
}

document.getElementById('halve-bet').onclick = function() {
    const BET = document.getElementById('bet-amount');
    var changeTo = parseFloat((parseFloat(BET.value) / 2).toFixed(2));

    if (changeTo < 0.01) {
        changeTo = 0.01;
    }

    BET.value = changeTo;
}

document.getElementById('bet-amount').onchange = function() {
    const BET = document.getElementById('bet-amount');
    var balance = document.getElementById('balance');
    var balanceValue = parseFloat(balance.innerText.replace(/\./g, '').replace(/,/g, '.'));

    if (!BET.value) {
        BET.value = 0;
    }

    if (parseFloat(BET.value) > balanceValue) {
        BET.value = balanceValue;
    }

    BET.value = parseFloat(BET.value).toFixed(2);
}

function updateBalance() {
    $.ajax({
        url: '/get-balance',
        type: 'POST',
        headers: defHeaders,
        success: function (data) {
            document.getElementById('balance').innerText = `${parseFloat(data.balance.toFixed(2)).toLocaleString()}`
        },
        error: function (err) {
            console.log(err)
            updateBalance()
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

async function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}