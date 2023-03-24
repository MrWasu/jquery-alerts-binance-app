
// hay un error que hacer que se siga almacenando el contador de alert counter con su valor aunque no haya alarmas, habria que hacer que si los arreglos estan vacios, mande 0 como counterforStorage


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


