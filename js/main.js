'use strict'
const GAME_ON = '😀'
const LOSS = '🤯'
const VICTORY = '😎'
const MINE_IMG = '💣'
const EMPTY = ' '
const FLAG_IMG = '🚩'
const LIFE = '❤'
const HINT = '💡'

var gLevel = {
    size: 4,
    mines: 2,
}
var gGame = {
    isOn: false,
    isVictory: false,
    revealedCount: 0,
    markedCount: 0,
    secsPassed: 0,
    flagsNum: gLevel.mines,
    lives: 3,
    hintsLeft: 3,
    hintsPressed: false,
    safeClicksRemain: 3,
}
var gDifficultySettings = [
    { difficulty: 'easy', size: 4, mines: 2 },
    { difficulty: 'medium', size: 8, mines: 14 },
    { difficulty: 'hard', size: 12, mines: 32 },
]
var gTimerInterval
var gStartTime
var gGameTime
var gBoard
var gSavedBoardState = []

function onInit() {
    var elSmiley = document.querySelector('.smiley-btn')
    elSmiley.innerText = GAME_ON

    gGame = {
        isOn: false,
        isVictory: false,
        revealedCount: 0,
        markedCount: 0,
        secsPassed: 0,
        flagsNum: gLevel.mines,
        lives: 3,
        hintsLeft: 3,
        hintsPressed: false,
        safeClicksRemain: 3,
    }

    renderDifficultyBtns()
    gBoard = buildBoard(gLevel.size)
    renderBoard(gBoard)
    renderLives(gGame.lives)
    renderRemainingFlagsCount()
    renderHints()
    resetTimer()
    checkBestScore()
    hideModal()
    resetClasses()
}

function buildBoard(boardSize) {
    var board = []

    for (var i = 0; i < boardSize; i++) {
        board[i] = []
        for (var j = 0; j < boardSize; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isRevealed: false,
                isMine: false,
                isMarked: false,
            }
        }
    }
    return board
}

function renderBoard(board) {
    var strHTML = ''

    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'

        for (var j = 0; j < board[0].length; j++) {
            var cellClass = `cell-${i}-${j} `

            cellClass += EMPTY

            strHTML += `<td class="cell ${cellClass}" 
            onclick="onCellClicked(this,${i},${j})" 
            oncontextmenu="onCellMarked(this,${i},${j})">`
        }

        strHTML += '</tr>'
    }
    const elContainer = document.querySelector('.board')
    elContainer.innerHTML = strHTML
}

function renderCell(location, value) {
    const elCell = document.querySelector(`.cell-${location.i}-${location.j}`)
    elCell.innerHTML = value
}

function setMinesNegsCount(board) {
    var negsCount = 0
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            var currCell = board[i][j]

            negsCount = searchNegsForMines(board, i, j)
            currCell.minesAroundCount = negsCount
        }
    }
}

function searchNegsForMines(board, rowIdx, colIdx) {
    var negsMinesCount = 0

    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue

        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            var currCell = board[i][j]

            if (j < 0 || j >= board[0].length) continue
            if (i === rowIdx && j === colIdx) continue
            if (currCell.isMine === true) negsMinesCount++
        }
    }
    return negsMinesCount
}

function onCellClicked(elCell, i, j) {
    if (gGame.lives === 0) return
    if (gGame.isVictory) return
    if (elCell.isRevealed) return
    if (elCell.isMarked) return

    var currCell
    var rowIdx = i
    var colIdx = j
    var currCellLoc = { i, j }

    if (gGame.hintsPressed) {
        if (gGame.hintsLeft <= 0) return
        useHint(rowIdx, colIdx)
        gGame.hintsLeft--
        renderHints()
        return
    }

    currCell = gBoard[rowIdx][colIdx]
    currCell.isRevealed = true

    if (!gGame.isOn) {
        addRandMines(gBoard, rowIdx, colIdx)
        // addStaticMines(gBoard)
        gGame.isOn = true
        gGame.revealedCount++
        if (currCell.minesAroundCount === 0) noMinesNegs(gBoard, rowIdx, colIdx)
        renderCell(currCellLoc, currCell.minesAroundCount)
        startTimer()
        return
    }

    if (currCell.isMine) {
        gGame.lives--
        renderLives()
        renderCell(currCellLoc, MINE_IMG)
        checkGameOver()
        if (gGame.lives > 0) {
            elCell.classList.add('hit-mine')
            setTimeout(() => {
                currCell.isRevealed = false
                elCell.classList.remove('hit-mine')
                renderCell(currCellLoc, EMPTY)
            }, 1000)
        }
    } else {
        gGame.revealedCount++
        checkGameOver()
        renderCell(currCellLoc, currCell.minesAroundCount)
        if (currCell.minesAroundCount === 0) noMinesNegs(gBoard, rowIdx, colIdx)
    }
}

function onCellMarked(elCell, i, j) {
    event.preventDefault()

    if (gGame.lives === 0) return
    if (gGame.isVictory) return
    if (!gGame.isOn) return

    var currCell = gBoard[i][j]
    var currCellLoc = { i, j }

    if (currCell.isRevealed) return
    if (currCell.isMarked) {
        currCell.isMarked = false
        gGame.markedCount--
        renderRemainingFlagsCount()
        renderCell(currCellLoc, EMPTY)

    } else if (gGame.markedCount < gLevel.mines) {
        currCell.isMarked = true
        gGame.markedCount++
        renderRemainingFlagsCount()
        renderCell(currCellLoc, FLAG_IMG)

    } else if (gGame.markedCount === gLevel.mines && currCell.isRevealed) {
        currCell.isMarked = false
        gGame.markedCount--
        renderRemainingFlagsCount()
        renderCell(currCellLoc, EMPTY)

    } else {
        return
    }

    checkGameOver()
}

function checkGameOver() {
    var msg = ''
    var elSmiley = document.querySelector('.smiley-btn')

    if (gGame.revealedCount === ((gLevel.size ** 2) - gGame.markedCount)) {
        elSmiley.innerText = VICTORY
        msg = 'Victory!'
        showModal(msg)
        gGame.isOn = false
        gGame.isVictory = true
        clearInterval(gTimerInterval)
        checkBestScore()
    }
    if (gGame.lives === 0) {
        elSmiley.innerText = LOSS
        msg = 'Game Over'
        showModal(msg)
        revealMines(gBoard)
        gGame.isOn = false
        clearInterval(gTimerInterval)
        checkBestScore()
    }


}

function getEmptyLocation(board, rowIdx, colIdx) {
    var emptyLocations = []
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            if (rowIdx === i && colIdx === j) continue
            emptyLocations.push({ i, j })
        }
    }
    var randIdx = getRandomInt(0, emptyLocations.length)
    return emptyLocations[randIdx]
}

function addRandMines(board, i, j) {
    var emptyCell
    var rowIdx
    var colIdx
    var clickedCellI = i
    var clickedCellJ = j
    i = 0

    while (i < gLevel.mines) {
        emptyCell = getEmptyLocation(board, clickedCellI, clickedCellJ)
        rowIdx = emptyCell.i
        colIdx = emptyCell.j

        if (board[rowIdx][colIdx].isMine) getEmptyLocation(board, clickedCellI, clickedCellJ)
        else {
            board[rowIdx][colIdx].isMine = true
            i++
        }

    }
    setMinesNegsCount(board)
}

function addStaticMines(board) {
    board[1][1].isMine = true
    board[1][3].isMine = true
    setMinesNegsCount(board)
}

function renderLives() {
    var strHTML = ''

    for (var i = 0; i < gGame.lives; i++) {
        strHTML += LIFE
    }

    var remainingLives = strHTML
    var getLives = document.querySelector('.lives')
    getLives.innerText = `Lives: ${remainingLives}`

}

function revealMines(board) {

    for (var i = 0; i < gLevel.size; i++) {
        for (var j = 0; j < gLevel.size; j++) {
            var currCell = board[i][j]
            var currCellLoc = { i, j }
            if (currCell.isMine === true) {
                currCell.isRevealed = true
                renderCell(currCellLoc, MINE_IMG)
            }
        }
    }
}

function renderRemainingFlagsCount() {
    var flagsToRender = renderFlagsCount()
    var getFlags = document.querySelector('.flags')
    getFlags.innerText = `Flags Remaining: ${flagsToRender}`
}

function renderFlagsCount() {
    var strHTML = ''
    var remainingFlags = (gLevel.mines - gGame.markedCount)

    for (var i = 0; i < remainingFlags; i++) {
        strHTML += FLAG_IMG
    }

    if (remainingFlags > 5) strHTML = '+' + FLAG_IMG + FLAG_IMG + FLAG_IMG + FLAG_IMG + FLAG_IMG
    return strHTML
}

function noMinesNegs(board, rowIdx, colIdx) {
    var currCellLoc
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= gLevel.size) continue

        for (var j = colIdx - 1; j <= colIdx + 1; j++) {

            if (j < 0 || j >= gLevel.size) continue
            if (i === rowIdx && j === colIdx) continue
            if (board[i][j].isRevealed) continue

            board[i][j].isRevealed = true
            gGame.revealedCount++
            currCellLoc = { i, j }
            renderCell(currCellLoc, board[i][j].minesAroundCount)

            if (board[i][j].minesAroundCount === 0) noMinesNegs(board, i, j)
        }
    }
}

function setDifficulty(boardSize, minesNum) {
    gLevel = {
        size: boardSize,
        mines: minesNum,
    }
    onInit()
    return gLevel
}

function renderDifficultyBtns() {
    const elBtns = document.querySelector('.second-line-btns')
    var btnsStrHTML = ''

    for (var i = 0; i < gDifficultySettings.length; i++) {
        btnsStrHTML += `<button class="difficulty-btns" onclick="setDifficulty(${gDifficultySettings[i].size},${gDifficultySettings[i].mines})">${gDifficultySettings[i].difficulty}</button>`
    }

    elBtns.innerHTML = btnsStrHTML
}

function startTimer() {
    gStartTime = Date.now()
    gTimerInterval = setInterval(updateTimer, 1000)
}

function updateTimer() {
    const now = Date.now()
    const diff = (now - gStartTime) / 1000
    gGameTime = diff
    document.querySelector('.timer').innerText = `Time: ${diff.toFixed(0)}`
}

function resetTimer() {
    clearInterval(gTimerInterval)
    document.querySelector('.timer').innerText = `Time: 00`
}

function renderHints() {
    var strHTML = ''
    var getHints = document.querySelector('.hints-div')

    for (var i = 0; i < gGame.hintsLeft; i++) {
        strHTML += HINT
    }
    getHints.innerText = `Hints: ${strHTML}`

    if (gGame.hintsLeft === 0) getHints.classList.add('no-more')
}

function pressHint() {
    const elHints = document.querySelector('.hints-div')

    if (!gGame.isOn) return
    if (gGame.hintsLeft === 0) return


    if (!gGame.hintsPressed) {
        gGame.hintsPressed = true
        elHints.style.backgroundColor = 'rgb(201, 201, 20)'
        elHints.style.color = 'black'
    } else {
        gGame.hintsPressed = false
        elHints.style.backgroundColor = 'rgb(12, 51, 24)'
        elHints.style.color = 'whitesmoke'
    }
}

function useHint(rowIdx, colIdx) {
    const elHints = document.querySelector('.hints-div')
    var currCellLoc

    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= gLevel.size) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= gLevel.size) continue
            if (gBoard[i][j].isRevealed) continue

            gBoard[i][j].isRevealed = true
            currCellLoc = { i, j }

            if (gBoard[i][j].isMine) {
                renderCell(currCellLoc, MINE_IMG)
            } else {
                renderCell(currCellLoc, gBoard[i][j].minesAroundCount)
            }

            gBoard[i][j].isRevealed = false
            gGame.hintsPressed = false
            elHints.style.backgroundColor = 'rgb(12, 51, 24)'
            elHints.style.color = 'whitesmoke'
            setTimeout(
                resetTempRevealed, 1500)
        }
    }


}

function resetTempRevealed() {
    for (var i = 0; i < gLevel.size; i++) {
        for (var j = 0; j < gLevel.size; j++) {
            if (gBoard[i][j].isRevealed) continue
            var currCellLoc = { i, j }
            if (gBoard[i][j].isMarked) {
                renderCell(currCellLoc, FLAG_IMG)
            } else {
                renderCell(currCellLoc, EMPTY)
            }
        }
    }
}

function checkBestScore() {
    var bestScore = localStorage.getItem('bestScore')
    var userName = localStorage.getItem('userName')

    if (bestScore === null) {
        localStorage.setItem('bestScore', 999)
    }
    if (userName === null) {
        localStorage.setItem('userName', 'Avishai')
    }

    gGameTime = (Date.now() - gStartTime) / 1000

    if (gGame.isVictory) {
        if (gGameTime < bestScore) {
            bestScore = gGameTime
            userName = prompt('Wow! A new best score! What is your name?')

            localStorage.setItem('userName', userName)
            localStorage.setItem('bestScore', bestScore)
        }
    }
    showBestScore()
}

function showBestScore() {
    var userName = localStorage.getItem('userName', userName)
    var bestScore = localStorage.getItem('bestScore', bestScore)

    document.querySelector('.best-score').innerText = `Best Score: ${bestScore} Seconds, made by: ${userName}`
}

function useSafeClick() {
    if (gGame.safeClicksRemain === 0) return
    if (!gGame.isOn) return

    const elDiv = document.querySelector('.safe-click')
    var unrevealedCells = []

    for (var i = 0; i < gLevel.size; i++) {
        for (var j = 0; j < gLevel.size; j++) {
            if (gBoard[i][j].isRevealed) continue
            if (gBoard[i][j].isMine) continue

            unrevealedCells.push({ i, j })
        }
    }
    var randIdx = drawNum(unrevealedCells)

    if (gGame.safeClicksRemain > 0) {
        const elCell = document.querySelector(`.cell-${randIdx.i}-${randIdx.j}`)
        elCell.classList.add('yellow')

        setTimeout(() => {
            elCell.classList.remove('yellow')
        }, 1500);
        gGame.safeClicksRemain--
        if (gGame.safeClicksRemain === 0) {
            elDiv.classList.add('no-more')
        }
    }
}

function toggleDarkMode() {
    const elBody = document.querySelector('.grad')
    const elButton = document.querySelector('.dark-mode-btn')
    var msg = ''

    elBody.classList.toggle('light')
    elBody.classList.toggle('dark')

    msg = elBody.classList.contains('light') ? 'Dark Mode' : 'Light Mode'
    elButton.innerText = msg
}

function resetClasses() {
    const elSafeClickBtn = document.querySelector('.safe-click')
    elSafeClickBtn.classList.remove('no-more')
    
    const elHintsDiv = document.querySelector('.hints-div')
    elHintsDiv.classList.remove('no-more')
}