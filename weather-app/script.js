// DOMが読み込まれたら実行
document.addEventListener('DOMContentLoaded', () => {
    // 東京の緯度経度
    const latitude = 35.6895;
    const longitude = 139.6917;

    // Open-Meteo APIのURL (現在の天気を取得)
    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;

    // APIにリクエストを送信
    fetch(apiUrl)
        .then(response => {
            // レスポンスが正常かチェック
            if (!response.ok) {
                throw new Error('ネットワークの応答が正しくありませんでした');
            }
            // レスポンスをJSON形式で解析
            return response.json();
        })
        .then(data => {
            // データをコンソールに表示（デバッグ用）
            console.log(data);

            // 取得したデータを表示
            displayWeather(data);
        })
        .catch(error => {
            // エラーが発生した場合
            console.error('データの取得に失敗しました:', error);
            const weatherInfoDiv = document.getElementById('weather-info');
            weatherInfoDiv.innerHTML = '<p>天気情報の取得に失敗しました。</p>';
        });
});

/**
 * 取得した天気データをHTMLに表示する関数
 * @param {object} data APIから取得したデータ
 */
function displayWeather(data) {
    const weatherInfoDiv = document.getElementById('weather-info');
    
    // APIからの生データ
    const temperature = data.current_weather.temperature;
    const weatherCode = data.current_weather.weathercode;

    // 天気コードを日本語の簡単な説明に変換
    const weatherDescription = getWeatherDescription(weatherCode);

    // HTMLを生成して挿入
    weatherInfoDiv.innerHTML = `
        <p class="temperature">${temperature} °C</p>
        <p class="description">${weatherDescription}</p>
    `;
}

/**
 * WMO 天気コードを簡単な日本語に変換する関数
 * @param {number} code 天気コード
 * @returns {string} 天気の説明
 */
function getWeatherDescription(code) {
    // Open-MeteoのWMOコードに基づいた簡易的なマッピング
    const weatherMap = {
        0: '快晴 ☀️',
        1: '晴れ 🌤️',
        2: 'ところにより曇り 🌥️',
        3: '曇り ☁️',
        45: '霧 🌫️',
        48: '霧氷 🌫️',
        51: '霧雨 (弱) 🌧️',
        53: '霧雨 (中) 🌧️',
        55: '霧雨 (強) 🌧️',
        61: '雨 (弱) 🌧️',
        63: '雨 (中) 🌧️',
        65: '雨 (強) 🌧️',
        80: 'にわか雨 (弱) 🌦️',
        81: 'にわか雨 (中) 🌦️',
        82: 'にわか雨 (強) 🌦️',
        95: '雷雨 ⛈️',
    };

    // マップに存在すればその説明を、なければ「不明 (コード: ${code})」を返す
    return weatherMap[code] || `不明 (コード: ${code})`;
}
