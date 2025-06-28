function drawNum(array) {
    const idx = getRandomInt(0, array.length)
    const num = array[idx]
    array.splice(idx, 1)
    return num
}

function getRandomInt(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled)
}

function showModal(msg) {
    var elModal = document.querySelector('.modal h2').innerText = msg

    elModal = document.querySelector('.modal')
    elModal.classList.remove('hidden')
}

function hideModal() {
    var elModal = document.querySelector('.modal')
    elModal.classList.add('hidden')
}