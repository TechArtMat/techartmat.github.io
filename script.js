let availablePlayers = [];
let currentTeamA = [];
let currentTeamB = [];
let previousTeamA = [];
let previousTeamB = [];
let rerollAttempts = 0;

// Инициализация состояния по умолчанию (например, "Trials" выбрано изначально)
document.getElementById('btnTrials').classList.add('checked');

// Добавляем слушатели кликов для обеих кнопок
document.querySelectorAll('.radio-btn').forEach(button => {
    button.addEventListener('click', function() {
        document.querySelectorAll('.radio-btn').forEach(btn => btn.classList.remove('checked'));
        this.classList.add('checked');
        let selectedType = this.getAttribute('data-type');
        
        handleTypeSelection(selectedType);
    });
});

// Функция для обработки логики выбора
function handleTypeSelection(selectedType) {
    if (selectedType === 'trials') {
        console.log("Trials selected");
    } else if (selectedType === 'crucible') {
        console.log("Crucible selected");
    }
}

// Добавление игрока в доступные игроки
function addPlayer() {
    const name = document.getElementById('playerName').value;
    const kdTrials = parseFloat(document.getElementById('playerKDTrials').value.replace(',', '.')) || 0;
    const kdCrucible = parseFloat(document.getElementById('playerKDCrucible').value.replace(',', '.')) || 0;
    const clanTag = document.getElementById('clanTag').value;

    const player = { name, clanTag, kdTrials, kdCrucible };
    availablePlayers.push(player);
    updateAvailablePlayers();
    
}

// Импорт базы игроков
function importPlayers() {
    const baseText = document.getElementById('playerBaseInput').value;
    const lines = baseText.split('\n');

    lines.forEach(line => {
        let [nameSplit, other] = line.split("#");
        let parts = other.split("\t");
        let [name, clanTag, kdTrials, kdCrucible] = parts.slice(" ");
        name = nameSplit + "#" + parts[0];
        const player = {
            name,
            clanTag,
            kdTrials: parseFloat(kdTrials) || 0,
            kdCrucible: parseFloat(kdCrucible) || 0
        };
        availablePlayers.push(player);

        
    });
    

    updateAvailablePlayers();
    sortPlayersByKD()
    document.getElementById('playerBaseInput').value = '';
}

function updateSliderLabel() {
    let isSortByTrials = document.getElementById('btnTrials').classList.contains('checked');
    const kdDiffValue = parseFloat(document.getElementById('kdDiffSlider').value).toFixed(2);

    const kdDiffLabel = document.getElementById('kdDiffLabel');
    kdDiffLabel.innerText = isSortByTrials ? "Max K/D Trials Difference:" : "Max K/D Crucible Difference:";

    const slider = document.getElementById('kdDiffSlider');
    const percentage = (slider.value - slider.min) / (slider.max - slider.min) * 100;

    if (isSortByTrials) {
        slider.style.background = `linear-gradient(to right, #f0f0f0 ${percentage}%, #FFD45E ${percentage}%)`;
    } else {
        slider.style.background = `linear-gradient(to right, #f0f0f0 ${percentage}%, #FF4646 ${percentage}%)`;
    }
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
        .map((player, index) => ({ player, index }))
        .filter(({ player }) => player.name.toLowerCase().includes(searchValue));

    updateAvailablePlayers(filteredPlayers);
}

// Добавление игрока в команду
function addToTeam(player, index) {
    // getPlayerCrucibleTime(player.name); // Получение времени в Горниле для игрока
    console.log(player.name);
    console.log(encodeURIComponent(player.name));

    if (currentTeamA.length <= currentTeamB.length) {
        currentTeamA.push(player);
    } else {
        currentTeamB.push(player);
    }

    availablePlayers.splice(index, 1);
    filterAvailablePlayers();
    updateTeam('A', currentTeamA);
    updateTeam('B', currentTeamB);
    sortTeamsByKD()
}

function updateKDDifference() {
    const avgKDTrialsA = parseFloat(document.getElementById('avgKDTrialsA').innerText);
    const avgKDTrialsB = parseFloat(document.getElementById('avgKDTrialsB').innerText);
    const avgKDCrucibleA = parseFloat(document.getElementById('avgKDCrucibleA').innerText);
    const avgKDCrucibleB = parseFloat(document.getElementById('avgKDCrucibleB').innerText);

    let kdDifferenceTrials = Math.abs(avgKDTrialsA - avgKDTrialsB).toFixed(2);
    let kdDifferenceCrucible = Math.abs(avgKDCrucibleA - avgKDCrucibleB).toFixed(2);

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
    sortTeamsByKD()
}

// Сортировка команд при реролле
function rerollTeams() {
    let maxDiff = parseFloat(document.getElementById('kdDiffSlider').value);
    let isSortByTrials = document.getElementById('btnTrials').classList.contains('checked');

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
    shouldRerollAgain ()
    sortTeamsByKD()
    updateTeam('A', currentTeamA, previousTeamA || []);
    updateTeam('B', currentTeamB, previousTeamB || []);
}

function shouldRerollAgain (){
    document.getElementById('kdDifferenceDisplay').classList.remove('kdDifferenceDisplay-error')
    const maxRerollCount = 20;

    let isSortByTrials = document.getElementById('btnTrials').classList.contains('checked');
    let KDDiff = parseFloat(document.getElementById('kdDiffSlider').value);
    let avgKDTrialsA = calculateAverageKD(currentTeamA, 'trials');
    let avgKDTrialsB = calculateAverageKD(currentTeamB, 'trials');
    let avgKDCrucibleA = calculateAverageKD(currentTeamA, 'crucible');
    let avgKDCrucibleB = calculateAverageKD(currentTeamB, 'crucible');

    if (rerollAttempts >= maxRerollCount) {
        console.log('Maximum number of reroll attempts reached');
        document.getElementById('kdDifferenceDisplay').classList.add('kdDifferenceDisplay-error')
        rerollAttempts = 0
    } else {
        if (isSortByTrials){
            if (Math.abs(avgKDTrialsA - avgKDTrialsB) <= KDDiff){
            } else {
                console.log('Wrong! Again')
                rerollAttempts++;
                rerollTeams()
            }
        } else {
            if (Math.abs(avgKDCrucibleA - avgKDCrucibleB) <= KDDiff){
            } else {
                console.log('Wrong! Again')
                rerollAttempts++;
                rerollTeams()
            }        
        }
    }
    



    
}

function updateTeam(team, teamArray, previousTeamArray = []) {
    const teamDiv = document.getElementById(`team${team}`);
    teamDiv.innerHTML = '';

    let totalKDTrials = 0;
    let totalKDCrucible = 0;

    teamArray.forEach((player, index) => {
        const oppositeTeam = team === 'A' ? 'B' : 'A';

        const playerMoved = previousTeamArray.length > 0 
            ? !previousTeamArray.some(prevPlayer => prevPlayer && prevPlayer.name === player.name)
            : false;

        const playerCard = createPlayerCard(player, index, true, team, oppositeTeam);

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
        currentTeamA.sort((a, b) => b.kdTrials - a.kdTrials);
        currentTeamB.sort((a, b) => b.kdTrials - a.kdTrials);
    } else {
        currentTeamA.sort((a, b) => b.kdCrucible - a.kdCrucible);
        currentTeamB.sort((a, b) => b.kdCrucible - a.kdCrucible);
    }

    updateTeam('A', currentTeamA);
    updateTeam('B', currentTeamB);
}

function sortPlayersByKD() {
    availablePlayers.sort((a, b) => b.kdTrials - a.kdTrials);
    updateAvailablePlayers();
}

// Сброс команд
function resetTeams() {
    availablePlayers = availablePlayers.concat(currentTeamA, currentTeamB);
    currentTeamA.length = 0;
    currentTeamB.length = 0;
    updateAvailablePlayers();
    sortPlayersByKD()
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
            <span class="player-clan">[${player.clanTag}]</span>
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
        const switchButton = document.createElement('button');
        switchButton.className = 'switch-btn';
        switchButton.innerHTML = '&#8646;';
        switchButton.onclick = (event) => {
            event.stopPropagation();
            switchPlayerTeam(team, oppositeTeam, index);
        };
        playerCard.appendChild(switchButton);

        playerCard.onclick = () => returnToAvailable(player, team, index);
    } else {
        const switchButton = document.createElement('button');
        switchButton.className = 'switch-btn';
        switchButton.innerHTML = '';
        switchButton.onclick = () => switchPlayerTeam(team, oppositeTeam, index);
        playerCard.appendChild(switchButton);
        playerCard.onclick = () => addToTeam(player, index);
    }

    return playerCard;
}

function returnToAvailable(player, team, index) {
    const currentTeamArray = team === 'A' ? currentTeamA : currentTeamB;
    
    currentTeamArray.splice(index, 1);
    availablePlayers.push(player);
    
    sortPlayersByKD()
    filterAvailablePlayers();
    updateTeam('A', currentTeamA);
    updateTeam('B', currentTeamB);
}

function takeScreenshot() {
    document.getElementById('screenshotBtn').addEventListener('click', function() {
        const teamWrapper = document.querySelector('.team-wrapper');
    
        html2canvas(teamWrapper, {
            backgroundColor: null,
            useCORS: true
        }).then(function(canvas) {
            canvas.toBlob(function(blob) {
                if (navigator.clipboard && navigator.clipboard.write) {
                    const item = new ClipboardItem({'image/png': blob});
                    navigator.clipboard.write([item]).then(function() {
                        console.log('The screenshot with the background has been successfully copied to the clipboard!');
                    }).catch(function(err) {
                        console.error('Error copying screenshot: ', err);
                    });
                } else {
                    console.error('Clipboard API is not supported in this browser.');
                }
            });
        });
    });
    
}

//

// Добавление функции для запроса данных из Bungie API
// async function getPlayerCrucibleTime(displayName, membershipType = 0) {
//     const apiKey = '4cd10d4ca2b44e438c20967dc56d1ec1';
//     try {
//         // Запрос на поиск игрока по имени
//         const playerResponse = await fetch(`https://www.bungie.net/Platform/Destiny2/SearchDestinyPlayer/${membershipType}/${encodeURIComponent(displayName)}/`, {
//             method: 'GET',
//             headers: {
//                 'X-API-Key': apiKey
//             }
//         });
//         const playerData = await playerResponse.json();

//         if (playerData.Response && playerData.Response.length > 0) {
//             const membershipId = playerData.Response[0].membershipId;

//             // Запрос на получение данных о профиле игрока
//             const profileResponse = await fetch(`https://www.bungie.net/Platform/Destiny2/3/Profile/${membershipId}/?components=202`, {
//                 method: 'GET',
//                 headers: {
//                     'X-API-Key': apiKey
//                 }
//             });
//             const profileData = await profileResponse.json();

//             // Извлечение времени в Горниле
//             const crucibleTime = profileData.Response.characterActivities.data[0].activities.find(activity => activity.activityHash === 4088006058).values.activityDurationSeconds.basic.value;
//             console.log(`Время в Горниле: ${crucibleTime} секунд`);
//         } else {
//             console.error('Игрок не найден');
//         }
//     } catch (error) {
//         console.error('Ошибка при запросе данных:', error);
//     }
// }

// // Вызов функции при добавлении игрока в команду
// function addToTeam(player, index) {
//     getPlayerCrucibleTime(player.name); // Получение времени в Горниле для игрока
//     // Существующая логика добавления игрока в команду...
//     if (currentTeamA.length <= currentTeamB.length) {
//         currentTeamA.push(player);
//     } else {
//         currentTeamB.push(player);
//     }

//     availablePlayers.splice(index, 1);
//     filterAvailablePlayers();
//     updateTeam('A', currentTeamA);
//     updateTeam('B', currentTeamB);
//     sortTeamsByKD();
// }
