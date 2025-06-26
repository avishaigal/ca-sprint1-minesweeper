'use strict'
const GAME_ON = '😀'
const LOSS = '🤯'
const VICTORY = '😎'
const MINE_IMG = '💣'
const EMPTY = ' '
const FLAG = '🚩'
const LIFE = '❤'

var gLevel = {
    size: 4,
    mines: 2,
}
var gGame = {
    isOn: false,
    revealedCount: 0,
    markedCount: 0,
    isMarked: false,
    secsPassed: 0,
    isVictory: false,
    firstTurn: true,
}
var gTimerInterval
var gStartTime
var gFlagsNum = gLevel.mines
var gLives = 3
var gBoard

function onInit() {
    resetTimer()
    var elSmiley = document.querySelector('.smiley-btn')
    elSmiley.innerText = GAME_ON
    gGame = {
        isOn: false,
        revealedCount: 0,
        markedCount: 0,
        isMarked: false,
        secsPassed: 0,
        isVictory: false,
    }
    gBoard = buildBoard(gLevel.size)
    gLives = 3
    renderLives(gLives)
    gFlagsNum = gLevel.mines
    getFlagsCount()
    renderFlagsCount()
    renderBoard(gBoard)
    hideModal()
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

    for (var i = 0; i < gLevel.size; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < gLevel.size; j++) {
            const currCell = board[i][j]
            var cellClass = `cell-${i}-${j} `

            if (currCell.isMarked) cellClass += 'flag'
            if (currCell.isMine) cellClass += 'mine'
            else cellClass += 'floor'

            strHTML += `<td class="cell ${cellClass}" 
            onclick="onCellClicked(this,${i},${j})" 
            oncontextmenu="onCellMarked(this,${i},${j})">`

            if (!currCell.isRevealed) {
                if (currCell.isMarked) {
                    strHTML += FLAG
                    gFlagsNum--
                } else {
                    strHTML += EMPTY
                    gFlagsNum++
                }
            }

            if (currCell.isRevealed) {
                if (currCell.isMine) {
                    strHTML += MINE_IMG
                } else if (currCell.minesAroundCount >= 0) {
                    strHTML += currCell.minesAroundCount
                }
            }

        }
        strHTML += '</td>'
    }
    strHTML += '</tr>'

    const elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML
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

    if (gLives === 0 || gGame.isVictory) return
    if (elCell.isRevealed) return

    var rowIdx = i
    var colIdx = j
    var currCell = gBoard[rowIdx][colIdx]




    if (!gGame.isOn) {
        addRandMines(gBoard, rowIdx, colIdx)
        // addStaticMines(gBoard)
        gGame.isOn = true
        currCell.isRevealed = true
        gGame.revealedCount++
        if (currCell.minesAroundCount === 0) noMinesNegs(gBoard, rowIdx, colIdx)
        renderBoard(gBoard)
        startTimer()
        return
    }

    currCell.isRevealed = true

    if (currCell.minesAroundCount === 0) noMinesNegs(gBoard, rowIdx, colIdx)

    if (!currCell.isMine) {
        gGame.revealedCount++
        checkGameOver()
    }

    if (currCell.isMine) {
        gLives--
        renderLives()
        if (gLives > 0) {
            setTimeout(() => {
                currCell.isRevealed = false
                renderBoard(gBoard)
            }, 1000)
        }
    }
    renderBoard(gBoard)

}

function onCellMarked(elCell, i, j) {
    event.preventDefault()
    if (!gGame.isOn) return
   
    var currCell = gBoard[i][j]

    if (currCell.isMarked) {
        currCell.isMarked = false
        gGame.markedCount--
        gFlagsNum++
        renderBoard()

    } else {
        currCell.isMarked = true
        gGame.markedCount++
        if (gFlagsNum <= 0) return
        else gFlagsNum--
    }

    checkGameOver()
    renderBoard(gBoard)
}

function checkGameOver() {
    var msg = ''
    var elSmiley = document.querySelector('.smiley-btn')

    if (gGame.revealedCount === ((gLevel.size ** 2) - gGame.markedCount)) {
        elSmiley.innerText = VICTORY
        msg = 'Victory!'
        showModal(msg)
        gGame.isOn = false
        clearInterval(gTimerInterval)
    }
    if (gLives === 0) {
        elSmiley.innerText = LOSS
        msg = 'Game Over'
        showModal(msg)
        revealMines(gBoard)
        renderBoard(gBoard)
        gGame.isOn = false
        clearInterval(gTimerInterval)
    }
}

function expandReveal(board, elCell, i, j) {

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
    var getLives = document.querySelector('.lives')
    getLives.innerText = `Lives: ${gLives}`
    checkGameOver()
}

function showModal(msg) {

    var elModal = document.querySelector('.modal h2').innerText = msg
    // elModal.innerText = msg

    elModal = document.querySelector('.modal')
    elModal.classList.remove('hidden')


}

function hideModal() {
    var elModal = document.querySelector('.modal')
    elModal.classList.add('hidden')
}

function revealMines(board) {

    for (var i = 0; i < gLevel.size; i++) {
        for (var j = 0; j < gLevel.size; j++) {
            var currCell = board[i][j]
            if (currCell.isMine === true) {
                currCell.isRevealed = true
            }
        }

    }
}

function getRandomInt(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled)
}

function getFlagsCount() {
    var strHTML = ''
    for (var i = 0; i < gLevel.mines; i++) {
        strHTML += FLAG
    }
    return strHTML
}

function renderFlagsCount() {
    var getFlags = document.querySelector('.flags')
    getFlags.innerText = `Flags Remaining: ${gFlagsNum}`
}

function noMinesNegs(board, rowIdx, colIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= gLevel.size) continue

        for (var j = colIdx - 1; j <= colIdx + 1; j++) {

            if (j < 0 || j >= gLevel.size) continue
            if (i === rowIdx && j === colIdx) continue
            if (board[i][j].isRevealed) continue
            board[i][j].isRevealed = true
            gGame.revealedCount++

        }
    }
    renderBoard(gBoard)
}

function setDifficulty(boardSize, minesNum) {
    gLevel = {
        size: boardSize,
        mines: minesNum,
    }
    onInit()
    return gLevel
}

function startTimer() {
    gStartTime = Date.now()
    gTimerInterval = setInterval(updateTimer, 1000)
}

function updateTimer() {
    const now = Date.now()
    const diff = (now - gStartTime) / 1000

    document.querySelector('.timer').innerText = `Time: ${diff.toFixed(0)}`
}

function resetTimer() {
    clearInterval(gTimerInterval)
    document.querySelector('.timer').innerText = `Time: 00`
}