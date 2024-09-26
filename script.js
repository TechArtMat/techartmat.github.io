let availablePlayers = [];
let currentTeamA = [];
let currentTeamB = [];
let previousTeamA = [];
let previousTeamB = [];

// Инициализация состояния по умолчанию (например, "Trials" выбрано изначально)
document.getElementById('btnTrials').classList.add('checked');

// Добавляем слушатели кликов для обеих кнопок
document.querySelectorAll('.radio-btn').forEach(button => {
    button.addEventListener('click', function() {
        document.querySelectorAll('.radio-btn').forEach(btn => btn.classList.remove('checked'));
        
        this.classList.add('checked');
        
        // Обновляем выбранный тип (например, для сортировки по Trials или Crucible)
        let selectedType = this.getAttribute('data-type');
        
        handleTypeSelection(selectedType);
    });
});

// Функция для обработки логики выбора
function handleTypeSelection(selectedType) {
    if (selectedType === 'trials') {
        console.log("Trials selected");
        // Ваша логика для работы с Trials
    } else if (selectedType === 'crucible') {
        console.log("Crucible selected");
        // Ваша логика для работы с Crucible
    }
}

// Добавление игрока в доступные игроки
function addPlayer() {
    const name = document.getElementById('playerName').value;
    const kdTrials = parseFloat(document.getElementById('playerKDTrials').value.replace(',', '.')) || 0;
    const kdCrucible = parseFloat(document.getElementById('playerKDCrucible').value.replace(',', '.')) || 0;

    const player = { name, kdTrials, kdCrucible };
    availablePlayers.push(player);
    updateAvailablePlayers();
    
}

// Импорт базы игроков
function importPlayers() {
    const baseText = document.getElementById('playerBaseInput').value;
    const lines = baseText.split('\n');

    lines.forEach(line => {
        const [name, kdTrials, kdCrucible] = line.split(/\s+/);
        const player = {
            name,
            kdTrials: parseFloat(kdTrials.replace(',', '.')) || 0,
            kdCrucible: parseFloat(kdCrucible.replace(',', '.')) || 0
        };
        availablePlayers.push(player);
    });

    updateAvailablePlayers();
}

// Обновление текста и значения слайдера в зависимости от выбранного режима
// function updateSliderLabel() {
//     let isSortByTrials = document.querySelector('input[name="sortBy"]:checked').value === 'trials';
//     const kdDiffValue = parseFloat(document.getElementById('kdDiffSlider').value).toFixed(2);

//     // Обновляем текст в зависимости от выбранного режима
//     const kdDiffLabel = document.getElementById('kdDiffLabel');
//     kdDiffLabel.innerText = isSortByTrials ? "Max K/D Trials Difference:" : "Max K/D Crucible Difference:";
    
//     // Отображаем текущее значение слайдера
//     document.getElementById('kdDiffDisplay').innerText = kdDiffValue;
// }

// Обновление текста и значения слайдера в зависимости от выбранного режима
function updateSliderLabel() {
    // Проверяем, какая кнопка выбрана (Trials или Crucible)
    let isSortByTrials = document.getElementById('btnTrials').classList.contains('checked');
    const kdDiffValue = parseFloat(document.getElementById('kdDiffSlider').value).toFixed(2);

    // Обновляем текст в зависимости от выбранного режима
    const kdDiffLabel = document.getElementById('kdDiffLabel');
    kdDiffLabel.innerText = isSortByTrials ? "Max K/D Trials Difference:" : "Max K/D Crucible Difference:";

    // Обновляем цвет фона слайдера в зависимости от режима
    const slider = document.getElementById('kdDiffSlider');
    const percentage = (slider.value - slider.min) / (slider.max - slider.min) * 100;

    if (isSortByTrials) {
        slider.style.background = `linear-gradient(to right, #f0f0f0 ${percentage}%, #FFD45E ${percentage}%)`; // Фон для Trials
    } else {
        slider.style.background = `linear-gradient(to right, #f0f0f0 ${percentage}%, #FF4646 ${percentage}%)`; // Фон для Crucible
    }

    // Отображаем текущее значение слайдера
    document.getElementById('kdDiffDisplay').innerText = kdDiffValue;
}



function updateSliderValues() {
    let kdTrialsDifference = parseFloat(document.getElementById("maxDiffTrials").value).toFixed(2);
    let kdCrucibleDifference = parseFloat(document.getElementById("maxDiffCrucible").value).toFixed(2);

    document.getElementById("trialsDiffDisplay").textContent = kdTrialsDifference;
    document.getElementById("crucibleDiffDisplay").textContent = kdCrucibleDifference;
}

// Обновление доступных игроков
function updateAvailablePlayers(filteredPlayers = availablePlayers.map((player, index) => ({ player, index }))) {
    const availablePlayersDiv = document.getElementById('availablePlayers');
    availablePlayersDiv.innerHTML = '';

    filteredPlayers.forEach(({ player, index }) => {
        const playerCard = createPlayerCard(player, index); // Создаем карточку без кнопки
        availablePlayersDiv.appendChild(playerCard);
    });
}

// Фильтрация доступных игроков по имени
function filterAvailablePlayers() {
    const searchValue = document.getElementById('searchPlayerInput').value.toLowerCase();
    const filteredPlayers = availablePlayers
        .map((player, index) => ({ player, index }))  // Сохраняем игрока и его индекс
        .filter(({ player }) => player.name.toLowerCase().includes(searchValue));

    // Обновляем список доступных игроков на основе фильтра
    updateAvailablePlayers(filteredPlayers);
}

// Добавление игрока в команду
function addToTeam(player, index) {
    if (currentTeamA.length <= currentTeamB.length) {
        currentTeamA.push(player);
    } else {
        currentTeamB.push(player);
    }

    availablePlayers.splice(index, 1);
    filterAvailablePlayers();
    updateTeam('A', currentTeamA);
    updateTeam('B', currentTeamB);
}

function updateKDDifference() {
    const avgKDTrialsA = parseFloat(document.getElementById('avgKDTrialsA').innerText);
    const avgKDTrialsB = parseFloat(document.getElementById('avgKDTrialsB').innerText);
    const avgKDCrucibleA = parseFloat(document.getElementById('avgKDCrucibleA').innerText);
    const avgKDCrucibleB = parseFloat(document.getElementById('avgKDCrucibleB').innerText);

    let kdDifferenceTrials = Math.abs(avgKDTrialsA - avgKDTrialsB).toFixed(2);
    let kdDifferenceCrucible = Math.abs(avgKDCrucibleA - avgKDCrucibleB).toFixed(2);

    // Проверяем, что выбрано для расчета (Trials или Crucible)
    let isSortByTrials = document.getElementById('btnTrials').classList.contains('checked');

    let kdDifferenceText = isSortByTrials 
        ? `K/D Trials Difference Between Teams: ${kdDifferenceTrials}` 
        : `K/D Crucible Difference Between Teams: ${kdDifferenceCrucible}`;

    document.getElementById('kdDifferenceDisplay').innerText = kdDifferenceText;
}

// Смена команды игрока
function switchPlayerTeam(currentTeam, oppositeTeam, index) {
    const currentTeamArray = currentTeam === 'A' ? currentTeamA : currentTeamB;
    const oppositeTeamArray = oppositeTeam === 'A' ? currentTeamA : currentTeamB;

    // Удаляем игрока из текущей команды и добавляем в противоположную
    const player = currentTeamArray.splice(index, 1)[0];
    oppositeTeamArray.push(player);

    // Обновляем обе команды
    updateTeam(currentTeam, currentTeamArray);
    updateTeam(oppositeTeam, oppositeTeamArray);
}

// Сортировка команд при реролле
function rerollTeams() {
    let maxDiff = parseFloat(document.getElementById('kdDiffSlider').value);  // Используем одно значение слайдера
    let isSortByTrials = document.getElementById('btnTrials').classList.contains('checked');

    // Сохраняем текущее состояние команд
    previousTeamA = [...currentTeamA];
    previousTeamB = [...currentTeamB];

    const allPlayers = currentTeamA.concat(currentTeamB);
    currentTeamA = [];
    currentTeamB = [];

    shuffleArray(allPlayers);

    let totalPlayers = allPlayers.length;
    let teamASize = Math.ceil(totalPlayers / 2);
    let teamBSize = totalPlayers - teamASize;

    allPlayers.forEach(player => {
        let avgKDTrialsA = calculateAverageKD(currentTeamA, 'trials');
        let avgKDTrialsB = calculateAverageKD(currentTeamB, 'trials');
        let avgKDCrucibleA = calculateAverageKD(currentTeamA, 'crucible');
        let avgKDCrucibleB = calculateAverageKD(currentTeamB, 'crucible');

        if (isSortByTrials) {
            if (currentTeamA.length < teamASize && Math.abs(avgKDTrialsA - avgKDTrialsB) <= maxDiff) {
                currentTeamA.push(player);
            } else if (currentTeamB.length < teamBSize && Math.abs(avgKDTrialsB - avgKDTrialsA) <= maxDiff) {
                currentTeamB.push(player);
            } else {
                if (currentTeamA.length < teamASize) {
                    currentTeamA.push(player);
                } else {
                    currentTeamB.push(player);
                }
            }
        } else {
            if (currentTeamA.length < teamASize && Math.abs(avgKDCrucibleA - avgKDCrucibleB) <= maxDiff) {
                currentTeamA.push(player);
            } else if (currentTeamB.length < teamBSize && Math.abs(avgKDCrucibleB - avgKDCrucibleA) <= maxDiff) {
                currentTeamB.push(player);
            } else {
                if (currentTeamA.length < teamASize) {
                    currentTeamA.push(player);
                } else {
                    currentTeamB.push(player);
                }
            }
        }
    });

    updateTeam('A', currentTeamA, previousTeamA || []);
    updateTeam('B', currentTeamB, previousTeamB || []);
}

// function updateTeam(team, teamArray, previousTeamArray) {
//     const teamPlayersDiv = document.getElementById(`team${team}`);
//     teamPlayersDiv.innerHTML = '';

//     let totalKDTrials = 0;
//     let totalKDCrucible = 0;

//     teamArray.forEach((player, index) => {
//         const playerDiv = document.createElement('div');
//         const oppositeTeam = team === 'A' ? 'B' : 'A';

//         // Проверка, поменял ли игрок команду
//         const playerMoved = previousTeamArray && previousTeamArray.length > 0 
//             ? !previousTeamArray.some(prevPlayer => prevPlayer && prevPlayer.name === player.name)
//             : false;

//         // Добавляем CSS-класс для игрока, если он переместился
//         playerDiv.style.backgroundColor = playerMoved ? 'red' : '';

//         playerDiv.innerHTML = `
//             ${player.name} (K/D Trials: ${player.kdTrials}, K/D Crucible: ${player.kdCrucible})
//             <button onclick="switchPlayerTeam('${team}', '${oppositeTeam}', ${index})">Change team</button>
//         `;

//         teamPlayersDiv.appendChild(playerDiv);

//         totalKDTrials += player.kdTrials;
//         totalKDCrucible += player.kdCrucible;
//     });

//     const avgKDTrials = teamArray.length ? (totalKDTrials / teamArray.length).toFixed(2) : '0.00';
//     const avgKDCrucible = teamArray.length ? (totalKDCrucible / teamArray.length).toFixed(2) : '0.00';

//     document.getElementById(`avgKDTrials${team}`).innerText = avgKDTrials;
//     document.getElementById(`avgKDCrucible${team}`).innerText = avgKDCrucible;

//     updateKDDifference();
// }

function updateTeam(team, teamArray, previousTeamArray = []) {
    const teamDiv = document.getElementById(`team${team}`);
    teamDiv.innerHTML = '';  // Очищаем содержимое команды

    let totalKDTrials = 0;
    let totalKDCrucible = 0;

    teamArray.forEach((player, index) => {
        const oppositeTeam = team === 'A' ? 'B' : 'A';

        // Проверка, поменял ли игрок команду
        const playerMoved = previousTeamArray.length > 0 
            ? !previousTeamArray.some(prevPlayer => prevPlayer && prevPlayer.name === player.name)
            : false;

        // Создание карточки игрока
        const playerCard = createPlayerCard(player, index, true, team, oppositeTeam);

        // Находим элемент с классом 'player-avatar' и изменяем его фон, если игрок переместился
        const playerAvatar = playerCard.querySelector('.player-avatar');
        if (playerMoved && playerAvatar) {
            playerAvatar.style.backgroundColor = '#A77373';  // Окрашиваем фон только аватара в красный
            playerCard.style.backgroundColor = 'rgb(92 0 0 / 25%)';
        }

        teamDiv.appendChild(playerCard);

        // Считаем суммарное K/D
        totalKDTrials += player.kdTrials;
        totalKDCrucible += player.kdCrucible;
    });

    // Вычисляем средние значения K/D для команды
    const avgKDTrials = teamArray.length ? (totalKDTrials / teamArray.length).toFixed(2) : '0.00';
    const avgKDCrucible = teamArray.length ? (totalKDCrucible / teamArray.length).toFixed(2) : '0.00';

    // Обновляем отображение средних значений K/D
    document.getElementById(`avgKDTrials${team}`).innerText = avgKDTrials;
    document.getElementById(`avgKDCrucible${team}`).innerText = avgKDCrucible;

    // Обновляем разницу K/D между командами
    updateKDDifference();
}

// Сортировка игроков в обеих командах по убыванию K/D
function sortTeamsByKD() {
    let isSortByTrials = document.getElementById('btnTrials').classList.contains('checked');

    if (isSortByTrials) {
        // Сортировка по Trials
        currentTeamA.sort((a, b) => b.kdTrials - a.kdTrials);
        currentTeamB.sort((a, b) => b.kdTrials - a.kdTrials);
    } else {
        // Сортировка по Crucible
        currentTeamA.sort((a, b) => b.kdCrucible - a.kdCrucible);
        currentTeamB.sort((a, b) => b.kdCrucible - a.kdCrucible);
    }

    // Обновляем команды после сортировки
    updateTeam('A', currentTeamA);
    updateTeam('B', currentTeamB);
}

// Сброс команд
function resetTeams() {
    availablePlayers = availablePlayers.concat(currentTeamA, currentTeamB);
    currentTeamA.length = 0;
    currentTeamB.length = 0;
    updateAvailablePlayers();
    updateTeam('A', currentTeamA);
    updateTeam('B', currentTeamB);
}

// Перемешивание массива
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Расчет среднего K/D
function calculateAverageKD(team, type) {
    const totalKD = team.reduce((acc, player) => {
        const kd = parseFloat(player[`kd${type.charAt(0).toUpperCase() + type.slice(1)}`]);
        return acc + kd;
    }, 0);
    return (team.length > 0) ? (totalKD / team.length) : 0;
}


// Создание карточки игрока
function createPlayerCard(player, index, inTeam = false, team = '', oppositeTeam = '') {
    const playerCard = document.createElement('div');
    playerCard.className = 'player-card';

    playerCard.innerHTML = `
        <div class="player-avatar"></div>
        <div class="player-info">
            <span class="player-name">${player.name}</span>
            <span class="player-clan">[Sky]</span>
        </div>
        <div class="player-kd">
            <div class="player-decoration"></div>
            <span class="kd-trials">${player.kdTrials}</span>
            <div class="player-decoration"></div>
            <span class="kd-crucible">${player.kdCrucible}</span>
            <div class="player-decoration"></div>
        </div>
    `;

    if (inTeam) {
        // Добавляем кнопку для переключения команды
        const switchButton = document.createElement('button');
        switchButton.className = 'switch-btn';
        switchButton.innerHTML = '&#8646;';
        switchButton.onclick = (event) => {
            event.stopPropagation();  // Останавливаем всплытие события клика
            switchPlayerTeam(team, oppositeTeam, index); // Переключаем команду
        };
        playerCard.appendChild(switchButton);

        // Добавляем возможность вернуть игрока в список доступных при клике на карточку
        playerCard.onclick = () => returnToAvailable(player, team, index);
    } else {
        const switchButton = document.createElement('button');
        switchButton.className = 'switch-btn';
        switchButton.innerHTML = '';
        switchButton.onclick = () => switchPlayerTeam(team, oppositeTeam, index);
        playerCard.appendChild(switchButton);
        playerCard.onclick = () => addToTeam(player, index); // Если игрок доступен
    }

    return playerCard;
}

// Функция возвращения игрока в список доступных
function returnToAvailable(player, team, index) {
    const currentTeamArray = team === 'A' ? currentTeamA : currentTeamB;
    
    // Удаляем игрока из команды и возвращаем в список доступных игроков
    currentTeamArray.splice(index, 1);
    availablePlayers.push(player);
    
    // Обновляем список доступных игроков и команд
    filterAvailablePlayers();
    updateTeam('A', currentTeamA);
    updateTeam('B', currentTeamB);
}
