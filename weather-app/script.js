document.addEventListener('DOMContentLoaded', () => {
    const citySelector = document.getElementById('city-selector');

    /**
     * 選択された都市の天気情報をAPIから取得する
     */
    function fetchWeather() {
        // 現在選択されている <option> 要素を取得
        const selectedOption = citySelector.options[citySelector.selectedIndex];
        
        // <option> の data-* 属性から緯度経度と都市名を取得
        const latitude = selectedOption.dataset.lat;
        const longitude = selectedOption.dataset.lon;
        const cityName = selectedOption.textContent;

        // API URL (現在天気 + 週間予報)
        // 週間予報のために daily パラメータを追加
        const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=Asia%2FTokyo`;

        // 読み込み中表示
        document.getElementById('city-name').textContent = `${cityName}の天気`;
        document.getElementById('current-weather').innerHTML = '<p>データを読み込み中...</p>';
        document.getElementById('weekly-forecast').innerHTML = '<p>データを読み込み中...</p>';

        // APIにリクエストを送信
        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('ネットワークの応答が正しくありませんでした');
                }
                return response.json();
            })
            .then(data => {
                console.log(data); // 取得したデータを確認
                displayWeather(data); // 天気表示関数を呼び出す
            })
            .catch(error => {
                console.error('データの取得に失敗しました:', error);
                document.getElementById('current-weather').innerHTML = '<p>天気情報の取得に失敗しました。</p>';
                document.getElementById('weekly-forecast').innerHTML = '';
            });
    }

    // 都市選択が変更されたときに fetchWeather を実行
    citySelector.addEventListener('change', fetchWeather);

    // ページ読み込み時にも、デフォルトで選択されている都市（東京）の天気を取得
    fetchWeather();
});

/**
 * 取得した天気データをHTMLに表示する関数
 * @param {object} data APIから取得したデータ
 */
function displayWeather(data) {
    
    // --- 1. 現在の天気を表示 ---
    const currentWeatherDiv = document.getElementById('current-weather');
    const current = data.current_weather;
    const currentTemp = current.temperature;
    const currentCode = current.weathercode;
    // getWeatherDescription を呼び出し (アイコン付きのフルテキスト)
    const currentDescription = getWeatherDescription(currentCode, false);

    currentWeatherDiv.innerHTML = `
        <h3>現在の天気</h3>
        <p class="description">${currentDescription}</p>
        <p class="temperature">${currentTemp} °C</p>
    `;

    // --- 2. 週間予報を表示 ---
    const weeklyForecastDiv = document.getElementById('weekly-forecast');
    const daily = data.daily;
    
    let weeklyHtml = ''; // 週間予報のHTMLを格納する変数

    // 7日間のデータをループ処理
    for (let i = 0; i < daily.time.length; i++) {
        const date = new Date(daily.time[i]);
        // 日付を「月/日 (曜)」形式にフォーマット
        const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
        const displayDate = `${date.getMonth() + 1}/${date.getDate()} (${dayOfWeek})`;
        
        const maxTemp = daily.temperature_2m_max[i];
        const minTemp = daily.temperature_2m_min[i];
        const weatherCode = daily.weathercode[i];
        // getWeatherDescription を呼び出し (アイコンのみ取得)
        const weatherIcon = getWeatherDescription(weatherCode, true);

        weeklyHtml += `
            <div class="forecast-day">
                <div class="date">${displayDate}</div>
                <div class="icon">${weatherIcon}</div>
                <div class="temp-max">${maxTemp} °C</div>
                <div class="temp-min">${minTemp} °C</div>
            </div>
        `;
    }

    weeklyForecastDiv.innerHTML = weeklyHtml;
}

/**
 * WMO 天気コードを日本語の説明または絵文字に変換する関数
 * @param {number} code 天気コード
 * @param {boolean} [iconOnly=false] trueの場合、絵文字のみを返す
 * @returns {string} 天気の説明または絵文字
 */
function getWeatherDescription(code, iconOnly = false) {
    // Open-MeteoのWMOコードに基づいたマッピング (雪なども追加)
    const weatherMap = {
        0: ['快晴', '☀️'],
        1: ['晴れ', '🌤️'],
        2: ['ところにより曇り', '🌥️'],
        3: ['曇り', '☁️'],
        45: ['霧', '🌫️'],
        48: ['霧氷', '🌫️'],
        51: ['霧雨 (弱)', '🌧️'],
        53: ['霧雨 (中)', '🌧️'],
        55: ['霧雨 (強)', '🌧️'],
        61: ['雨 (弱)', '🌧️'],
        63: ['雨 (中)', '🌧️'],
        65: ['雨 (強)', '🌧️'],
        71: ['雪 (弱)', '🌨️'],
        73: ['雪 (中)', '🌨️'],
        75: ['雪 (強)', '🌨️'],
        77: ['雪粒', '🌨️'],
        80: ['にわか雨 (弱)',D '🌦️'],
        81: ['にわか雨 (中)', '🌦️'],
        82: ['にわか雨 (強)', '🌦️'],
        85: ['にわか雪 (弱)', '🌨️'],
        86: ['にわか雪 (強)', '🌨️'],
        95: ['雷雨', '⛈️'],
        96: ['雷雨 (弱)', '⛈️'],
        99: ['雷雨 (強)', '⛈️'],
    };

    const mapping = weatherMap[code] || [`不明 (${code})`, '❓'];
    
    // iconOnly が true なら絵文字 (mapping[1]) を、false なら説明 (mapping[0] + mapping[1]) を返す
    return iconOnly ? mapping[1] : `${mapping[0]} ${mapping[1]}`;
}
