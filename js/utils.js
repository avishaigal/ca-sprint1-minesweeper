'use strict'

// create board

function buildBoard() {
    var board = []
    
    for (var i = 0; i < gLevel.size; i++) {
        board[i] = []
        for (var j = 0; j < gLevel.size; j++) {

        }
    }
    console.log(board)
    return board
}

function renderBoard(board) {
    var strHTML = '<table border="0"><tbody>'

    for (var i = 0; i < mat.length; i++) {

        strHTML += '<tr>'
        for (var j = 0; j < mat[0].length; j++) {

            const cell = mat[i][j]
            const className = 'cell cell-' + i + '-' + j
            strHTML += `<td class="${className}">${cell}</td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>'
    
    const elContainer = document.querySelector('.board')
    elContainer.innerHTML = strHTML
}

// location such as: {i: 2, j: 7}
function renderCell(location, value) {
    const elCell = document.querySelector(`.cell-${location.i}-${location.j}`)
    elCell.innerHTML = value
}

// randoms

function getRandomInt(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}

function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('')
    var color = '#'
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)]
    }
    return color
}

function generateRandId(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let id = ''
    for (let i = 0; i < length; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return id
}

function drawNum() {
    const idx = getRandomInt(0, gNums.length)
    const num = gNums[idx]
    gNums.splice(idx, 1)
    return num
}

// modal
function showModal() {
    const elModal = document.querySelector('.modal')
    elModal.classList.remove('hidden')
}

function hideModal() {
    const elModal = document.querySelector('.modal')
    elModal.classList.add('hidden')
}

// text change
function changeElText(selector, text) {
    document.querySelector(selector).innerText = text
}

// sounds
function playSound() {
    const audio = new Audio('audio/drop.mp3')
    audio.play()
}

// time
function getTime() {
    return new Date().toString().split(' ')[4]
}

function startTimer() {
    gStartTime = Date.now()
    gTimerInterval = setInterval(updateTimer, 25)
    // console.log(' gTimerInterval:', gTimerInterval)
}

function updateTimer() {
    
    const now = Date.now()
    //* Taking the difference between current time and start time
    //* and converting to seconds
    const diff = (now - gStartTime) / 1000
    document.querySelector('.timer span').innerText = diff.toFixed(3)
}

// misc
function getEmptyLocation(board) {
	var emptyLocations = []
	for (var i = 0; i < board.length; i++) {
		for (var j = 0; j < board[0].length; j++) {
			if (board[i][j] === EMPTY) {
				emptyLocations.push({ i, j })
			}
		}
	}
	if (!emptyLocations.length) return null
	var randIdx = getRandomIntInclusive(0, emptyLocations.length - 1)
	return emptyLocations[randIdx]
}

// neighbour loop
function printNeighbors(pos) {
    for (var i = pos.i - 1; i <= pos.i + 1; i++){
        if (i < 0 || i >= gBoard.length) continue

        for (var j = pos.j - 1; j <= pos.j + 1; j++){
            if (j < 0 || j >= gBoard[i].length) continue
            if (i === pos.i && j === pos.j) continue
            console.log(gBoard[i][j])
        }
    }
}