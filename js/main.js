// hay un error que hacer que se siga almacenando el contador de alert counter con su valor aunque no haya alarmas, habria que hacer que si los arreglos estan vacios, mande 0 como counterforStorage

/* Variables */ 

let btcPrice = 0;
let EthPrice = 0;
let btcVolume = 0;
let ethVolume = 0;
let cryptoRadioChoice = 'bitcoin';
let alertTypeChoice = 'double';
let mute = false;

const arrBtcHigherAlerts = JSON.parse(localStorage.getItem('arrBtcHigherAlerts')) || [];
const arrBtcLowerAlerts = JSON.parse(localStorage.getItem('arrBtcLowerAlerts')) || [];
const arrBtcVolumeAlerts = JSON.parse(localStorage.getItem('arrBtcVolumeAlerts')) || [];
const arrEthHigherAlerts = JSON.parse(localStorage.getItem('arrEthHigherAlerts')) || [];
const arrEthLowerAlerts = JSON.parse(localStorage.getItem('arrEthLowerAlerts')) || [];
const arrEthVolumeAlerts = JSON.parse(localStorage.getItem('arrEthVolumeAlerts')) || [];
const counterForStorage = JSON.parse(localStorage.getItem('AlertCounter')) || 0;

const logIdDontRepeat = [];
let logContent = [];
let hourSimple;
let dateSimple;

const log = (value) => console.log(value); // console.log()

class Alert {
    
    static counter = counterForStorage;
    
    constructor(price, currency, description, type) {
        
        this._id = ++Alert.counter;
        this._price = price;
        this._currency = currency;
        this._description = description;
        this._type = type;
        this._status = false;
    }
    
    get id() {
        return this._id;
    }
    
    get price() {
        return this._price;
    }
    set price(price) {
        this._price = price;
    }

    get currency() {
        return this._currency;
    }
    set currency(currency) {
        this._currency = currency;
    }
    
    get description() {
        return this._description;
    }
    set description(description) {
        this._description = description;
    }

    get type() {
        return this._type;
    }
    set type(type) {
        this._type = type;
    }

    get status() {
        return this._status;
    }
    set status(status) {
        this._status = status;
    }
    
    toString() {
        return `---- Nº: ${this._id} / D: ${this._description} / CUR: ${this._currency} / P: ${this._price} / T: ${this._type} / S: ${this._status}`;
    }
    
    toJSON() { //apuntes
        return {
            id: this._id,
            price: this._price,
            currency: this._currency,
            description: this._description,
            type: this._type,
            status: this._status,
        };
    }
}





$(document).ready(function () {
    showDate(); // manda crear la hora y mostrarla
    getPriceAndVolume(); // recoge los datos desde binance
    modifiedAlertCamps(); // configura los inputs según las opciones a elegir
    logs('start'); // imprime el texto de inicio en el log
    
    setTimeout(function () {
        checkdata(); // comprueba el estado de la API de Binance
    }, 2000)
    
    setInterval(function () {
        alertFunctionPrice(); // chequea si hay alarma de precio
        showAlertsLi(); // muestra los LI con todas las alarmas creadas
    }, 1000)
    
    setInterval(function () {
        alertFunctionVolume(); // chequea si hay alarma de volumen
    }, 60000)

    setTimeout(function () {
        if (counterForStorage != 0 && counterForStorage != null && counterForStorage != undefined) {  
         logs('getLocalStorage'); // imprime en el log si se han cargado las alertas desde el localStorage
        }
    }, 1000)

    $("#add-alert-btn").on("click", function () { // funcionamiento del botón añadir alerta
        setAlertsForArrays(cryptoRadioChoice, alertTypeChoice);
    });

    $("#togBtn").on("change", function () { // boton silenciar
        mute = $(this).prop("checked"); 
    });
});


function showDate() {
    actualTime = new Date();
    
    const twoDigitsHour = (hour) => {
        if (hour < 10)
        hour = '0' + hour;
        return hour
    } // Esta función hace que si el valor tiene 1 digito se le añada un 0 a la izquierda
    
    function getWeekDay(actualTime) {
        const days = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
        return days[actualTime.getDay()];
    } //Comparamos el valor de una variable para segun la casilla del arreglo retornar un valor.
    
    hourSimple = `${twoDigitsHour(actualTime.getHours())}:${twoDigitsHour(actualTime.getMinutes())}:${twoDigitsHour(actualTime.getSeconds())}`;
    dateSimple = `${actualTime.getDate()} / ${actualTime.getMonth() + 1}`;
    
    $('#hour-div').html(`<p> ${hourSimple} </p>`)
    
    setTimeout('showDate()', 1000);
}

function saveLocalStorage() { 

    // Se encarga de almacenar en el local storage todos los arreglos que contienen las alertas

    const arrTypes = ['BtcHigher', 'BtcLower', 'BtcVolume', 'EthHigher', 'EthLower', 'EthVolume'];

    arrTypes.forEach(type => {
        localStorage.setItem(`arr${type}Alerts`, JSON.stringify(eval(`arr${type}Alerts`), (key, value) => { 
            if (value instanceof Alert) {
                return value.toJSON();
            }
            return value;
        }));
    });
}

async function getPriceAndVolume() {

    // APIs de binance, se configuran editando la url
    const urlBtcPrice = 'https://fapi.binance.com/fapi/v1/ticker/24hr?symbol=BTCUSDT';
    const urlEthPrice = 'https://fapi.binance.com/fapi/v1/ticker/24hr?symbol=ETHUSDT';
    const urlBtcVolume = 'https://fapi.binance.com/fapi/v1/klines/?symbol=BTCUSDT&contractType=PERPETUAL&interval=1m&limit=2';
    const urlEthVolume = 'https://fapi.binance.com/fapi/v1/klines/?symbol=ETHUSDT&contractType=PERPETUAL&interval=1m&limit=2';

    try {
        const [btcPriceResponse, ethPriceResponse, btcVolumeResponse, ethVolumeResponse] = await Promise.all([
            fetch(urlBtcPrice),
            fetch(urlEthPrice),
            fetch(urlBtcVolume),
            fetch(urlEthVolume)
        ]); 

        if (!btcPriceResponse.ok || !ethPriceResponse.ok || !btcVolumeResponse.ok || !ethVolumeResponse.ok) {
            throw new Error('Error getting data from Binance');
        }

        btcPrice = await btcPriceResponse.json();
        ethPrice = await ethPriceResponse.json();
        btcVolume = await btcVolumeResponse.json();
        ethVolume = await ethVolumeResponse.json();

        btcPrice = parseFloat(btcPrice.lastPrice),
        ethPrice = parseFloat(ethPrice.lastPrice),
        btcVolume = Math.floor(btcVolume[0][5]),
        ethVolume = Math.floor(ethVolume[0][5])

        $('.bar').css('display', 'block');

    } catch (error) {
        console.error(error);
        logs('getPriceError');
        $('.bar').css('display', 'none');
    }

    $('#btc-price').html(addDecimal(btcPrice, 1));
    $('#eth-price').html(addDecimal(ethPrice, 2));
    $('#btc-volume').html('<span class="h-vol"> Volumen M1: </span>' + btcVolume);
    $('#eth-volume').html('<span class="h-vol"> Volumen M1: &nbsp  </span>' + ethVolume);

    setTimeout('getPriceAndVolume()', 1000);
}

function addDecimal(num, dec) {
    // Añade un decimal 

    if (!num.toString().includes(".") && dec == 1) {
        return num.toFixed(dec);
    }
    else if (dec == 2) {
        return num.toFixed(dec);
    }
    return num;
}

function checkdata() {
    // comprueba el estado de la API de Binance y manda imprilo en el log

    if (btcPrice !== null && btcPrice !== undefined && btcPrice != 0 && ethPrice !== null && ethPrice !== undefined && ethPrice != 0 && btcVolume !== null && btcVolume !== undefined && btcVolume != 0 && ethVolume !== null && ethVolume !== undefined && ethVolume != 0) {
        logs('getPrice');
    }
    else {
        logs('getPriceError');
    }
}

function modifiedAlertCamps() {
    // Se modifican los inputs y los valores según la eleccion en los radios

    $("#input-alert-simple, #input-alert-1, #input-alert-2").focus(function () {
        $(this).val(btcPrice);
    });

    $("#btc-radio").change(function () {
        cryptoRadioChoice = this.value;

        $("#input-alert-simple, #input-alert-1, #input-alert-2").focus(function () {
            $(this).val(btcPrice);
        });
    });

    $("#eth-radio").change(function () {
        cryptoRadioChoice = this.value;

        $("#input-alert-simple, #input-alert-1, #input-alert-2").focus(function () {
            $(this).val(ethPrice);
        });
    });

    $("#radio-simple").change(function () {
        $('#input-alert-simple').css('display', 'block');
        $('#input-alert-1').css('display', 'none');
        $('#input-alert-2').css('display', 'none');
        $('#input-volume-alert').css('display', 'none');
        $("#formu input[name='input-alert-price']").val("");
        $('#alert-desc').val("");
        alertTypeChoice = 'simple';
    });

    $("#radio-doble").change(function () {
        $('#input-alert-simple').css('display', 'none');
        $('#input-alert-1').css('display', 'block');
        $('#input-alert-2').css('display', 'block');
        $('#input-volume-alert').css('display', 'none');
        $("#formu input[name='input-alert-price']").val("");
        $('#alert-desc').val("");
        alertTypeChoice = 'double';
    });

    $("#radio-volume").change(function () {
        $('#input-alert-simple').css('display', 'none');
        $('#input-alert-1').css('display', 'none');
        $('#input-alert-2').css('display', 'none');
        $('#input-volume-alert').css('display', 'block');
        $("#formu input[name='input-alert-price']").val("");
        $('#alert-desc').val("");
        alertTypeChoice = 'volume';
    });
}

function setAlertsForArrays(cryptoChoice, alertType) {
    // Se almacenan las alarmas en los arreglos.

    const inputAlertSimple = parseFloat($('#input-alert-simple').val());
    const inputAlertOne = parseFloat($('#input-alert-1').val());
    const inputAlertTwo = parseFloat($('#input-alert-2').val());
    const inputAlertVolume = parseInt($('#input-volume-alert').val());
    const inputDesc = $('#alert-desc').val();

    // Si el valor del input es superior se añade al arreglo de alarmas por encima del precio, si es inferior al arreglo de alarmas inferiores, 
    // y si es de volumen, al arreglo de alertas de volumen.
    if (cryptoChoice === 'bitcoin') {
        if (alertType === 'simple' && inputAlertSimple > 0) {
            btcPrice < inputAlertSimple ? arrBtcHigherAlerts.push(new Alert(inputAlertSimple, cryptoChoice, inputDesc, 'Superior')) : arrBtcLowerAlerts.push(new Alert(inputAlertSimple, cryptoChoice, inputDesc, 'Inferior'));
            logs('alert', 'price', cryptoChoice);
        }
        else if (alertType === 'double' && inputAlertOne > 0 && inputAlertTwo > 0) {
            if (btcPrice > inputAlertOne || btcPrice < inputAlertTwo) {
                alert('Ingresa los campos correctamente')
            } else {
                arrBtcHigherAlerts.push(new Alert(inputAlertOne, cryptoChoice, inputDesc, 'Superior'));
                arrBtcLowerAlerts.push(new Alert(inputAlertTwo, cryptoChoice, inputDesc, 'Inferior'));
                logs('alert', 'price', cryptoChoice);
            }
        }
        else if (alertType === 'volume' && inputAlertVolume > 0) {
            arrBtcVolumeAlerts.push(new Alert(inputAlertVolume, cryptoChoice, inputDesc, 'Volumen'));
            logs('alert', 'volume', cryptoChoice);
        }
        else {
            alert('Rellena los campos');
        }
    }

    else if (cryptoChoice === 'ethereum') {
        if (alertType === 'simple' && inputAlertSimple > 0) {
            ethPrice < inputAlertSimple ? arrEthHigherAlerts.push(new Alert(inputAlertSimple, cryptoChoice, inputDesc, 'Superior')) : arrEthLowerAlerts.push(new Alert(inputAlertSimple, cryptoChoice, inputDesc, 'Inferior'));
            logs('alert', 'price', cryptoChoice);
        }
        else if (alertType === 'double' && inputAlertOne > 0 && inputAlertTwo > 0) {
            if (ethPrice > inputAlertOne || ethPrice < inputAlertTwo) {
                alert('Ingresa los campos correctamente');
            } else {
                arrEthHigherAlerts.push(new Alert(inputAlertOne, cryptoChoice, inputDesc, 'Superior'));
                arrEthLowerAlerts.push(new Alert(inputAlertTwo, cryptoChoice, inputDesc, 'Inferior'));
                logs('alert', 'price', cryptoChoice);
            }
        }
        else if (alertType === 'volume' && inputAlertVolume > 0) {
            arrEthVolumeAlerts.push(new Alert(inputAlertVolume, cryptoChoice, inputDesc, 'Volumen'));
            logs('alert', 'volume', cryptoChoice);
        }
        else {
            alert('Rellena los campos');
        }
    }

    showAlertsLi();
    showAlertOnConsole();

    // mandamos al localStorage el contador de alarmas creadas, para que al reiniciar la página las alarmas y sus id no se sustituyan, y asi funcionen los btn-remove
    const AlertCounter = Alert.counter;
    localStorage.setItem('AlertCounter', AlertCounter);
}

function alertFunctionPrice() {
    // Se revisan las alarmas comparandolas con el precio actual, si hay alarma, se le cambia la propiedad status a la alarma y se manda a imprimir en el log

    for (let element of arrBtcHigherAlerts) {
        if (btcPrice > element.price) {
            element.status = true;
            logs('alert-match', element);
        }
    }

    for (let element of arrBtcLowerAlerts) {
        if (btcPrice < element.price) {
            element.status = true;
            logs('alert-match', element);
        }
    }

    for (let element of arrEthHigherAlerts) {
        if (ethPrice > element.price) {
            element.status = true;
            logs('alert-match', element);
        }
    }

    for (let element of arrEthLowerAlerts) {
        if (ethPrice < element.price) {
            element.status = true;
            logs('alert-match', element);
        }
    }

    soundAlert(); // funcion de sonido de la alarma
}

function alertFunctionVolume() {
    // Se revisan las alarmas comparandolas con el volumen actual, si hay alarma, se le cambia la propiedad status a la alarma y se manda a imprimir en el log

    for (let element of arrBtcVolumeAlerts) {
        if (btcVolume > element.price) {
            element.status = true;
            volumeAlertBtnReset();
            logs('alert-match', element, 'volumen');
        }
    }

    for (let element of arrEthVolumeAlerts) {
        if (ethVolume > element.price) {
            element.status = true;
            volumeAlertBtnReset();
            logs('alert-match', element, 'volumen');
        }
    }

    soundAlert();
}

function soundAlert() {
    // Se revisan los status de cada alarma y si es true se manda a reproducir el sonido

    for (let element of arrBtcHigherAlerts) {
        if (element.status == true) {
            alarmSettingsSounds('p');
        }
    }
    for (let element of arrBtcLowerAlerts) {
        if (element.status == true) {
            alarmSettingsSounds('p');
        }
    }
    for (let element of arrBtcVolumeAlerts) {
        if (element.status == true) {
            alarmSettingsSounds('v');
        }
    }

    for (let element of arrEthHigherAlerts) {
        if (element.status == true) {
            alarmSettingsSounds('p');
        }
    }
    for (let element of arrEthLowerAlerts) {
        if (element.status == true) {
            alarmSettingsSounds('p');
        }
    }
    for (let element of arrEthVolumeAlerts) {
        if (element.status == true) {
            alarmSettingsSounds('v');
        }
    }
}

function alarmSettingsSounds(arg) {
    // Se reproduce un sonido de alerta según el tipo de alerta
    let song1 = $('#sonido-1').get(0);
    let song2 = $('#sonido-2').get(0);

    if (arg == 'p' && mute == false) {
        song1.play();
    }

    if (arg == 'v' && mute == false) {
        song2.play();
    }
}

function volumeAlertBtnReset() {
    // Muestra el boton y pone status false a todas las alarmas de volumen (al minuto volveran a sonar)

    $('#reset-alert-volume').css('display', 'block');

    $('#reset-alert-volume').on("click", function () {
        for (let element of arrBtcVolumeAlerts) {
            element.status = false;
        }
        for (let element of arrEthVolumeAlerts) {
            element.status = false;
        }
        $('#reset-alert-volume').css('display', 'none');
    });
}

function showAlertsLi() {
    // Muestra todas alertas en los paneles junto con el boton de borrar

    let btcAlertsLi = '';
    let ethAlertsLi = '';

    const classAlert = 'blink rojo';
    const style = ' d-flex justify-content-between align-middle';

    // El boton se pasa junto con la id de la alarma que hace que posteriormente btnRemove() pase a borrar a alarma por el id del boton y la alarma
    const buildButton = (id) => `<button id="${id}" type="button" class="btn btn-danger btn-remove"> <span aria-hidden="true">&times;</span> </button>`;

    const arraysBtcList = [...arrBtcHigherAlerts, ...arrBtcLowerAlerts, ...arrBtcVolumeAlerts]; // apuntes
    const arraysEthList = [...arrEthHigherAlerts, ...arrEthLowerAlerts, ...arrEthVolumeAlerts];

    for (let element of arraysBtcList) {
        let status = element.status ? classAlert : '';
        btcAlertsLi += `<li class="${status} ${element.type} ${style}"> <div> <span class="type"> ${element.type}</span> ${element.price}  <span class="desc-li"> - ${element.description}</span> </div>  <div>  ${buildButton(element.id)} </div> </li> `;
    }
    $('#alarms-btc-list').html(btcAlertsLi).selectable();


    for (let element of arraysEthList) {
        let status = element.status ? classAlert : '';
        ethAlertsLi += `<li class="${status} ${element.type} ${style}"> <div> <span class="type">${element.type}</span> ${element.price}  <span class="desc-li"> - ${element.description}</span> </div> <div>  ${buildButton(element.id)} </div> </li> `;
    }
    $('#alarms-eth-list').html(ethAlertsLi);

    removeButtons();
}

function removeButtons() {
    // Botones de borrar para cada alarma 

    $('button').filter('.btn-remove').on("click", function () {

        let pos = -1
        for (let element of arrBtcHigherAlerts) {
            if (this.id == element.id) {
                pos = arrBtcHigherAlerts.indexOf(element);
            }
            if (pos != -1) {
                arrBtcHigherAlerts.splice(pos, 1);
                pos = -1; 
                logs('alert-deleted', element);
            }
        }
        for (let element of arrBtcLowerAlerts) {
            if (this.id == element.id) {
                pos = arrBtcLowerAlerts.indexOf(element);
            }
            if (pos != -1) {
                arrBtcLowerAlerts.splice(pos, 1);
                pos = -1;
                logs('alert-deleted', element);
            }
        }
        for (let element of arrBtcVolumeAlerts) {
            if (this.id == element.id) {
                pos = arrBtcVolumeAlerts.indexOf(element);
            }
            if (pos != -1) {
                arrBtcVolumeAlerts.splice(pos, 1);
                pos = -1;
                logs('alert-deleted', element);
            }
        }
        for (let element of arrEthHigherAlerts) {
            if (this.id == element.id) {
                pos = arrEthHigherAlerts.indexOf(element);
            }
            if (pos != -1) {
                arrEthHigherAlerts.splice(pos, 1);
                pos = -1;
                logs('alert-deleted', element);
            }
        }
        for (let element of arrEthLowerAlerts) {
            if (this.id == element.id) {
                pos = arrEthLowerAlerts.indexOf(element);
            }
            if (pos != -1) {
                arrEthLowerAlerts.splice(pos, 1);
                pos = -1;
                logs('alert-deleted', element);
            }
        }
        for (let element of arrEthVolumeAlerts) {
            if (this.id == element.id) {
                pos = arrEthVolumeAlerts.indexOf(element);
            }
            if (pos != -1) {
                arrEthVolumeAlerts.splice(pos, 1);
                pos = -1;
                logs('alert-deleted', element);
            }
        }
    });

    saveLocalStorage();
}

function logs(arg1, arg2, arg3) {
    // Añade registros al campo de log que emula una consola

    const hourAndDate = '<span class="date-log">' + dateSimple + ' - ' + hourSimple + '</span>';

    if (arg1 == 'start') logContent.push(`<li class="log-start">- ${hourAndDate} :: Iniciando Aplicación </li>`);
    else if (arg1 == 'getPrice') logContent.push(`<li class="log-start">- ${hourAndDate} :: Datos cargados CORRECTAMENTE desde Binance </li>`);
    else if (arg1 == 'getLocalStorage') logContent.push(`<li class="log-start">- ${hourAndDate} :: Datos cargados CORRECTAMENTE desde LocalStorage</li>`);
    else if (arg1 == 'getPriceError') logContent.push(`<li class="log-error">- ${hourAndDate} :: ERROR en la recogida de datos desde Binance </li>`);
    else if (arg1 == 'alert' && arg2 == 'price') logContent.push(`<li class="log-added">- ${hourAndDate} :: Alerta de precio añadida en ${arg3.toUpperCase()} </li>`);
    else if (arg1 == 'alert' && arg2 == 'volume') logContent.push(`<li class="log-added">- ${hourAndDate} :: Alerta de volumen añadida en ${arg3.toUpperCase()} </li>`);
    else if (arg1 == 'alert-match') {
        if (!logIdDontRepeat.includes(arg2.id)) {
            logContent.push(`<li class="log-match">- ${hourAndDate} :: Alerta alcanzada en ${arg2.price}  </li>`);
            logIdDontRepeat.push(arg2.id);
        }
    }
    else if (arg1 == 'alert-deleted') logContent.push(`<li class="log-deleted">- ${hourAndDate} :: Alerta eliminada </li>`);

    $('#logs-content').html(logContent);

    $("#reset-log").on("click", function () {
        logContent = [];
        $('#logs-content').html(logContent);
    });

    // Barra de scroll para el log que hace que se quede siempre en la parte inferior
    var container = $('#logs-content');
    container.scrollTop(container[0].scrollHeight - container.height()); 
}

function showAlertOnConsole() {
    log('-------------------------------------------------------');
    log('BTC price: ' + btcPrice);
    log('arreglo btc altas:' + arrBtcHigherAlerts);
    log('arreglo btc bajas: ' + arrBtcLowerAlerts);
    log('arreglo btc  volumen: ' + arrBtcVolumeAlerts);
    log('arreglo eth altas:' + arrEthHigherAlerts);
    log('arreglo eth bajas: ' + arrEthLowerAlerts);
    log('arreglo eth volumen: ' + arrEthVolumeAlerts);
}


