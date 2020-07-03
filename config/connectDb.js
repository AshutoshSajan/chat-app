const mongoose = require("mongoose");
const chalk = require("chalk");

const connectDB = async () => {
	try {
		const conn = await mongoose.connect(process.env.MONGO_URI, {
			useNewUrlParser: true,
			useCreateIndex: true,
			useFindAndModify: false,
			useUnifiedTopology: true,
		});

		console.log(
			chalk.blue.bold(`MongoDB Connected at host: ${conn.connection.host}`)
		);
	} catch (err) {
		console.log(
			"\n",
			chalk.red.bold(`MongoDB connection error ==>\n${err.message}`),
			"\n"
		);
		process.exit(1);
	}
};

module.exports = connectDB;
