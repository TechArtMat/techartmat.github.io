let availablePlayers = [];
let currentTeamA = [];
let currentTeamB = [];
let previousTeamA = [];
let previousTeamB = [];
let rerollAttempts = 0;

let currentContextPlayer = null;
let lockedPlayers = new Set();
importPlayers()

document.addEventListener('contextmenu', function(event) {
    event.preventDefault();

    const playerCard = event.target.closest('.player-card');
    if (playerCard) {
        currentContextPlayer = playerCard;
        const playerName = playerCard.querySelector('.player-name').innerText;

        const lockButton = document.getElementById('lockPlayerBtn');
        if (lockedPlayers.has(playerName)) {
            lockButton.innerText = 'Unlock';
            lockButton.innerText = 'Lock';
        }

        showContextMenu(event.pageX, event.pageY);
    } else {
        hideContextMenu();
    }
});

function showContextMenu(x, y) {
    const menu = document.getElementById('contextMenu');
    menu.style.top = `${y}px`;
    menu.style.left = `${x}px`;
    menu.style.display = 'block';
}

function hideContextMenu() {
    const menu = document.getElementById('contextMenu');
    menu.style.display = 'none';
}

document.addEventListener('click', function() {
    hideContextMenu();
});

document.getElementById('lockPlayerBtn').addEventListener('click', function() {
    if (currentContextPlayer) {
        const playerName = currentContextPlayer.querySelector('.player-name').innerText;

        if (lockedPlayers.has(playerName)) {
            lockedPlayers.delete(playerName);
            currentContextPlayer.classList.remove('locked');
            currentContextPlayer.style.backgroundColor = '';
        } else {
            lockedPlayers.add(playerName);
            currentContextPlayer.classList.add('locked');
            currentContextPlayer.style.backgroundColor = 'rgb(0 0 0 / 25%)';
        }

        hideContextMenu();
    }
});


document.getElementById('btnTrials').classList.add('checked');
document.querySelectorAll('.radio-btn').forEach(button => {
    button.addEventListener('click', function() {
        document.querySelectorAll('.radio-btn').forEach(btn => btn.classList.remove('checked'));
        this.classList.add('checked');
        let selectedType = this.getAttribute('data-type');
        updateSliderLabel();
        handleTypeSelection(selectedType);
    });
});

function handleTypeSelection(selectedType) {
    if (selectedType === 'trials') {
        console.log("Trials selected");
    } else if (selectedType === 'crucible') {
        console.log("Crucible selected");
    }
}

function addPlayer() {
    const name = document.getElementById('playerName').value;
    const kdTrials = parseFloat(document.getElementById('playerKDTrials').value.replace(',', '.')) || 0;
    const kdCrucible = parseFloat(document.getElementById('playerKDCrucible').value.replace(',', '.')) || 0;
    const clanTag = document.getElementById('clanTag').value;

    const player = { name, clanTag, kdTrials, kdCrucible };
    availablePlayers.push(player);
    updateAvailablePlayers();

    document.getElementById('playerName').value = "";
    document.getElementById('playerKDTrials').value = "";
    document.getElementById('playerKDCrucible').value = "";
    document.getElementById('clanTag').value = "";
    
}

function importPlayers() {
    const baseText = document.getElementById('playerBaseInput').value;
    const lines = baseText.split('\n');

    lines.forEach(line => {
        console.log(line)
        if (line.includes('#')) {
            let [name, other] = line.split("#");
            if (!other) return;
    
            let parts = other.split("\t");
            name = name + "#" + (parts[0] || '');
            let [clanTag, kdTrials, kdCrucible] = parts.slice(1);
    
            const player = {
                name,
                clanTag,
                kdTrials: parseFloat(kdTrials) || 0,
                kdCrucible: parseFloat(kdCrucible) || 0
            };
            availablePlayers.push(player);
        } else {
            let parts = line.split(/\s+/);
            let [name, clanTag, kdTrials, kdCrucible] = parts;
    
            const player = {
                name,
                clanTag,
                kdTrials: parseFloat(kdTrials) || 0,
                kdCrucible: parseFloat(kdCrucible) || 0
            };
            availablePlayers.push(player);
        }
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

function updateAvailablePlayers(filteredPlayers = availablePlayers.map((player, index) => ({ player, index }))) {
    const availablePlayersDiv = document.getElementById('availablePlayers');
    availablePlayersDiv.innerHTML = '';

    filteredPlayers.forEach(({ player, index }) => {
        const playerCard = createPlayerCard(player, index);
        availablePlayersDiv.appendChild(playerCard);
    });
}

function filterAvailablePlayers() {
    const searchValue = document.getElementById('searchPlayerInput').value.toLowerCase();
    const filteredPlayers = availablePlayers
        .map((player, index) => ({ player, index }))
        .filter(({ player }) => player.name.toLowerCase().includes(searchValue));

    updateAvailablePlayers(filteredPlayers);
}

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

function switchPlayerTeam(currentTeam, oppositeTeam, index) {
    const currentTeamArray = currentTeam === 'A' ? currentTeamA : currentTeamB;
    const oppositeTeamArray = oppositeTeam === 'A' ? currentTeamA : currentTeamB;

    const player = currentTeamArray.splice(index, 1)[0];
    oppositeTeamArray.push(player);

    updateTeam(currentTeam, currentTeamArray);
    updateTeam(oppositeTeam, oppositeTeamArray);
    sortTeamsByKD()
}

function rerollTeams() {
    let maxDiff = parseFloat(document.getElementById('kdDiffSlider').value);
    let isSortByTrials = document.getElementById('btnTrials').classList.contains('checked');

    previousTeamA = [...currentTeamA];
    previousTeamB = [...currentTeamB];

    const unlockedPlayers = [...currentTeamA.filter(p => !lockedPlayers.has(p.name)), ...currentTeamB.filter(p => !lockedPlayers.has(p.name))];
    currentTeamA = [...currentTeamA.filter(p => lockedPlayers.has(p.name))];
    currentTeamB = [...currentTeamB.filter(p => lockedPlayers.has(p.name))];

    shuffleArray(unlockedPlayers);

    let totalPlayers = unlockedPlayers.length + currentTeamA.length + currentTeamB.length;
    let teamASize = Math.ceil(totalPlayers / 2);
    let teamBSize = totalPlayers - teamASize;

    unlockedPlayers.forEach(player => {
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

    sortTeamsByKD();
    updateTeam('A', currentTeamA, previousTeamA || []);
    updateTeam('B', currentTeamB, previousTeamB || []);
}

function lockedPlayersInTeam(team) {
    if (team === 'A') {
        return previousTeamA.filter(player => lockedPlayers.has(player.name));
    } else if (team === 'B') {
        return previousTeamB.filter(player => lockedPlayers.has(player.name));
    }
    return [];
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
            playerAvatar.style.backgroundColor = '#A77373';
            playerCard.style.backgroundColor = 'rgb(92 0 0 / 25%)';
        }

        if (lockedPlayers.has(player.name)) {
            playerCard.classList.add('locked');
            playerCard.style.backgroundColor = 'rgb(0 0 0 / 25%)';
        } else {
            playerCard.style.backgroundColor = '';
        }

        teamDiv.appendChild(playerCard);

        totalKDTrials += player.kdTrials;
        totalKDCrucible += player.kdCrucible;
    });

    for (let i = teamArray.length; i < 6; i++) {
        const emptySlot = document.createElement('div');
        emptySlot.className = 'slot';
        // emptySlot.innerText = `Slot ${i + 1}`;
        teamDiv.appendChild(emptySlot);
    }

    const avgKDTrials = teamArray.length ? (totalKDTrials / teamArray.length).toFixed(2) : '0.00';
    const avgKDCrucible = teamArray.length ? (totalKDCrucible / teamArray.length).toFixed(2) : '0.00';

    document.getElementById(`avgKDTrials${team}`).innerText = avgKDTrials;
    document.getElementById(`avgKDCrucible${team}`).innerText = avgKDCrucible;

    updateKDDifference();
}



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

function resetTeams() {
    availablePlayers = availablePlayers.concat(currentTeamA, currentTeamB);
    currentTeamA.length = 0;
    currentTeamB.length = 0;
    updateAvailablePlayers();
    sortPlayersByKD()
    updateTeam('A', currentTeamA);
    updateTeam('B', currentTeamB);
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function calculateAverageKD(team, type) {
    const totalKD = team.reduce((acc, player) => {
        const kd = parseFloat(player[`kd${type.charAt(0).toUpperCase() + type.slice(1)}`]);
        return acc + kd;
    }, 0);
    return (team.length > 0) ? (totalKD / team.length) : 0;
}

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
