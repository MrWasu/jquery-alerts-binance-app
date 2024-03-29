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