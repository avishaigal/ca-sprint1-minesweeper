'use strict'

const MINE_IMG = '💣'
const EMPTY = ''
const FLAG = '🚩'
const LIFE = '❤'

const gLevel = {
    size: 4,
    mines: 2,
}
const gGame = {
    isOn: false,
    revealedCount: 0,
    markedCount: 0,
    secsPassed: 0,
    isVictory: false,
}

var gLives = 3
var gBoard

function onInit() {
    gGame.isOn = false
    gGame.revealedCount = 0
    gLives = 3
    renderLives(gLives)
    gBoard = buildBoard(gLevel.size)
    renderBoard(gBoard)
    // window.addEventListener(`contextmenu`, (e) => e.preventDefault())

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

            if (currCell.isFlagged) cellClass += 'flag'
            if (currCell.isMine) cellClass += 'mine'
            else cellClass += 'floor'

            strHTML += `<td class="cell ${cellClass}" 
            onclick="onCellClicked(this,${i},${j})" 
            oncontextmenu="onCellMarked(this,${i},${j})">`

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

    return
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

    if (gLives === 0 || gGame.isVictory === true) return
    if (elCell.isRevealed) return
    if (gGame.isOn === false) {
        // addRandMines(gBoard, i, j)
        addStaticMines(gBoard)
        gGame.isOn = true
    }

    var rowIdx = i
    var colIdx = j
    var currCell = gBoard[rowIdx][colIdx]

    currCell.isRevealed = true

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
    // var rowIdx = i
    // var colIdx = j
    var currCell = gBoard[i][j]

    gGame.markedCount++

    if (currCell.isMarked === true) {
        elCell.innerText = FLAG
    } else {
        currCell.innerText = EMPTY
    }
    renderBoard(gBoard)
}

function checkGameOver() {
    var msg = ''
    if (gGame.revealedCount = (gLevel.size ** 2) - gLevel.mines) {
        console.log('hi')
        
    }
        if (gLives === 0) {
            msg = 'Game Over'
            openModal(msg)
            revealMines(gBoard)
            renderBoard(gBoard)
            // gGame.isOn = false
        }
}

function expandReveal(board, elCell, i, j) {

}

function getEmptyLocation(board) {
    var emptyLocations = []

    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            if (board[i][j].isMine === false) {
                emptyLocations.push({ i, j })
            }
        }
    }
    if (!emptyLocations.length) return null
    var randIdx = getRandomInt(0, emptyLocations.length)

    return emptyLocations[randIdx]
}

function addRandMines(board, i, j) {
    // var currCell = board[i][j]
    var emptyCell
    var rowIdx
    var colIdx

    for (var i = 0; i < gLevel.mines; i++) {
        emptyCell = getEmptyLocation(board)
        rowIdx = emptyCell.i
        colIdx = emptyCell.j

        board[rowIdx][colIdx].isMine = true

    }
    setMinesNegsCount(board)
    // onCellClicked(i, j)
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

function openModal(msg) {
    const elModal = document.querySelector('.modal')
    // const elMsg = elModal.querySelector('.msg')

    elModal.innerText = msg
    elModal.style.display = 'block'
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