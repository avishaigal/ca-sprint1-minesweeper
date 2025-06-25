'use strict'

// randoms

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