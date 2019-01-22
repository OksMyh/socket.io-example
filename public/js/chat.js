let socket = io();

let messageBtn = document.getElementById('message-btn');
let messagesDiv = document.getElementById('messages');

messageBtn.onclick = function () {
    let messageInput = document.getElementById('message-input');
    const inputValue = messageInput.value;
    messageInput.value = '';
    socket.emit('message',{text: inputValue});
};

socket.on('message', function (message) {
    showMessage(message)
});
socket.on('init', function (messages) {
    for (const message of messages) {
        showMessage(message)
    }
});

function showMessage(message) {
    let messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.innerText = `${message.date} ${message.author}: ${message.text}`;
    messagesDiv.appendChild(messageDiv);

}