const express = require('express');
const fetch = require('node-fetch');
const app = express();
const port = 3000; // Сервер будет работать на порту 3000

// Разрешаем запросы с любого источника (для CORS)
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// Эндпоинт для получения данных об игроке
app.get('/player/:membershipType/:displayName', async (req, res) => {
    const { membershipType, displayName } = req.params;
    const apiKey = 'твой_api_ключ'; // Замени на свой API ключ

    try {
        const response = await fetch(`https://www.bungie.net/Platform/Destiny2/SearchDestinyPlayer/${membershipType}/${encodeURIComponent(displayName)}/`, {
            headers: {
                'X-API-Key': apiKey
            }
        });
        const data = await response.json();
        res.json(data); // Отправляем полученные данные на клиент
    } catch (error) {
        console.error('Ошибка при запросе к Bungie API:', error);
        res.status(500).send('Ошибка при запросе данных');
    }
});

app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});