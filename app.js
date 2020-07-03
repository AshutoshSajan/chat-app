require("dotenv").config();
const express = require("express");
const http = require("http");
const path = require("path");
const socketio = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = socketio(server);
const formatMsg = require("./utils/message");
const chalk = require("chalk");
const Chat = require("./models/Chat");

const db = require("./config/connectDb");
db();

const {
	userJoin,
	getCurrnetUser,
	userLeave,
	getRoomUsers,
} = require("./utils/users");

const BOT = "CHAT_BOT";
app.use(express.static(path.join(__dirname, "public")));

io.on("connection", (socket) => {
	socket.on("joinRoom", ({ username, room }) => {
		// console.log(chalk.red.bold("check 1 on connection"));

		const user = userJoin(socket.id, username, room);
		socket.join(user.room);

		// emiting to a chat room
		socket.emit(
			"message",
			formatMsg(BOT, `hello ${user.username} welcome to chat`)
		);

		// bradcast when an user connects
		// emit to all the clients accept user
		// brodacasting to a specific chatroom
		socket.broadcast
			.to(user.room)
			.emit("message", formatMsg(BOT, `${user.username} has joind the chat`));

		// send users and room info to client
		io.to(user.room).emit("roomUsers", {
			room: user.room,
			users: getRoomUsers(user.room),
		});
	});

	// console.log(socket, "socket connected");
	// welcome new user
	// broadcast to single user
	// socket.emit("message", formatMsg(BOT, "hello welcome to chat")); // moved inside joinRoom to badcast to a specific chat room

	// bradcast when an user connects
	// emit to all the clients accept user
	// broadcast to everywhere
	// socket.broadcast.emit(
	// 	"message",
	// 	formatMsg(BOT, "an user has joind the chat")
	// );// moved inside joinRoom to badcast to a specific chat room

	// listen for chat msg send from the client
	// v1 before implimenting rooms functionality
	// socket.on("chatMsg", msg => {
	// 	console.log(msg);
	// 	io.emit("message", formatMsg("user", msg));
	// });

	// v2 after implimenting rooms functionality
	socket.on("chatMsg", async (msg) => {
		// console.log(chalk.red.bold("check 2 on msg"));

		const user = getCurrnetUser(socket.id);
		const chat = await Chat.create({ username: user.username, msg });
		chat.save();
		io.to(user.room).emit("message", formatMsg(user.username, msg));
	});

	// runs when client disconencts
	// v1 before implimenting rooms functionality
	// socket.on("disconnect", () => {
	// 	// emit to all the clients
	// 	io.emit("message", formatMsg(BOT, "an user has left the chat"));
	// });

	// v2 after implimenting rooms functionality
	socket.on("disconnect", () => {
		// console.log(chalk.red.bold("check 3 on disconnect"));

		const user = userLeave(socket.id);
		if (user) {
			// emit to all the clients
			io.to(user.room).emit(
				"message",
				formatMsg(BOT, `${user.username} has left the chat`)
			);

			// send users and rooms info
			io.to(user.room).emit("roomUsers", {
				room: user.room,
				users: getRoomUsers(user.room),
			});
		}
	});
});

server.listen(3000, () => console.log("server is listning on port 3000..."));
