'use strict'

const MINE_IMG = '💣'
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
    console.log(board);

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

            strHTML += `<td class="cell ${cellClass} ">`

            if (currCell.isMine) {
                strHTML += MINE_IMG
            } else if (gBoard[i][j].minesAroundCount > 0) {
                strHTML += gBoard[i][j].minesAroundCount
            }

            strHTML += '</td>'
        }
        strHTML += '</tr>'
    }

    const elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML
}

// setMinesNegsCount(gBoard)

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
if (gBoard[i][j].isRevealed === true) return


}

function onCellMarked(elCell, i, j) {

}

function checkGameOver() {

}

function expandReveal(board, elCell, i, j) {

}


