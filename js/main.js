'use strict'

const MINE_IMG = '💣'
const EMPTY = ''
const gLevel = {
    size: 4,
    mines: 2,
}

var gBoard

function onInit() {
    const gGame = {
        isOn: false,
        revealedCount: 0,
        markedCount: 0,
        secsPassed: 0,
    }

    gBoard = buildBoard(gLevel.size)
    // random position mines:
    // addMines(gBoard)
    // setMinesNegsCount(gBoard)
    renderBoard(gBoard)
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
    // static mines
    board[1][1].isMine = true
    board[1][3].isMine = true
    setMinesNegsCount(board)

    return board
}

function renderBoard(board) {
    var strHTML = ''

    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < board[0].length; j++) {
            const currCell = board[i][j]
            var cellClass = `cell-${i}-${j} `

            if (currCell.isMine) cellClass += 'mine'
            else cellClass += 'floor'

            strHTML += `<td class="cell ${cellClass}" onclick="onCellClicked(this,${i},${j})">`

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
    // if (elCell.isRevealed) return
    var rowIdx = i
    var colIdx = j
    var currCell = gBoard[rowIdx][colIdx]

    currCell.isRevealed = true
    renderBoard(gBoard)
}


function onCellMarked(elCell, i, j) {

}

function checkGameOver() {

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

function getRandomInt(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled)
}

function addMines(board) {
    var emptyCell
    var rowIdx
    var colIdx

    for (var i = 0; i < gLevel.mines; i++) {
        emptyCell = getEmptyLocation(board)
        rowIdx = emptyCell.i
        colIdx = emptyCell.j

        board[rowIdx][colIdx].isMine = true

    }
}