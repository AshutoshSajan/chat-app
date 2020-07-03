require("dotenv").config();
const express = require("express");
const http = require("http");
const path = require("path");
const socketio = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = socketio(server);
const formatMsg = require("./utils/message");
const Chat = require("./models/Chat");

const db = require("./config/connectDb");
db();

const {
	userJoin,
	getCurrnetUser,
	userLeave,
	getRoomUsers,
} = require("./utils/users");
const { model } = require("./models/Chat");

const bot = "chatBot";
app.use(express.static(path.join(__dirname, "public")));

io.on("connection", (socket) => {
	socket.on("joinRoom", ({ username, room }) => {
		const user = userJoin(socket.id, username, room);
		socket.join(user.room);

		// emiting to a chat room
		socket.emit(
			"message",
			formatMsg(bot, `hello ${user.username} welcome to chat`)
		);

		// bradcast when an user connects
		// emit to all the clients accept user
		// brodacasting to a specific chatroom
		socket.broadcast
			.to(user.room)
			.emit("message", formatMsg(bot, `${user.username} has joind the chat`));

		// send users and room info to client
		io.to(user.room).emit("roomUsers", {
			room: user.room,
			users: getRoomUsers(user.room),
		});
	});

	// console.log(socket, "socket connected");
	// welcome new user
	// broadcast to single user
	// socket.emit("message", formatMsg(bot, "hello welcome to chat")); // moved inside joinRoom to badcast to a specific chat room

	// bradcast when an user connects
	// emit to all the clients accept user
	// broadcast to everywhere
	// socket.broadcast.emit(
	// 	"message",
	// 	formatMsg(bot, "an user has joind the chat")
	// );// moved inside joinRoom to badcast to a specific chat room

	// listen for chat msg send from the client
	// v1 before implimenting rooms functionality
	// socket.on("chatMsg", msg => {
	// 	console.log(msg);
	// 	io.emit("message", formatMsg("user", msg));
	// });

	// v2 after implimenting rooms functionality
	socket.on("chatMsg", async (msg) => {
		const user = getCurrnetUser(socket.id);
		const chat = await Chat.create({ username: user.username, msg });
		await chat.save();
		io.to(user.room).emit("message", formatMsg(user.username, msg));
	});

	// runs when client disconencts
	// v1 before implimenting rooms functionality
	// socket.on("disconnect", () => {
	// 	// emit to all the clients
	// 	io.emit("message", formatMsg(bot, "an user has left the chat"));
	// });

	// v2 after implimenting rooms functionality
	socket.on("disconnect", () => {
		const user = userLeave(socket.id);
		if (user) {
			// emit to all the clients
			io.to(user.room).emit(
				"message",
				formatMsg(bot, `${user.username} has left the chat`)
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
