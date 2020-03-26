const chatForm = document.getElementById("chat-form");
const chatMsgDiv = document.querySelector(".chat-messages");
const socket = io();

const roomName = document.getElementById("roomName");
const usersList = document.getElementById("users");

// get username and chatroom from url
const { username, room } = Qs.parse(location.search, {
	ignoreQueryPrefix: true
});

console.log(username, room);

// join chatroom
socket.emit("joinRoom", { username, room });

// get room users
socket.on("roomUsers", ({ room, users }) => {
	// console.log("roomUsers called");

	diaplayRoomName(room);
	diaplayUsers(users);
});

socket.on("message", message => {
	// console.log("message called", message);
	diaplayMessage(message);

	chatMsgDiv.scrollTop = chatMsgDiv.scrollHeight;
});

chatForm.addEventListener("submit", e => {
	e.preventDefault();

	const msg = e.target.elements.msg.value;
	// console.log(msg);

	// Emit message to server
	socket.emit("chatMsg", msg);
	e.target.elements.msg.value = "";
	e.target.elements.msg.focus;
});

function diaplayMessage(message) {
	const div = document.createElement("div");
	div.className = message.username === username ? "current-user" : "";

	div.innerHTML += `
		<div>
			<p class="msg-info">From : ${message.username} at <time>${message.time}</time></p>
			<p class='msg-text'>${message.text}</p>
		</div>
  `;

	chatMsgDiv.appendChild(div);
}

// add room name to DOM
function diaplayRoomName(room) {
	roomName.innerText = room;
}

// add users to dDOM
function diaplayUsers(users) {
	usersList.innerHTML = `
   ${users.map(user => `<li>${user.username}</li>`).join("")}
  `;
}
