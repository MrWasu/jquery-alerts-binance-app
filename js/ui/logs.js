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