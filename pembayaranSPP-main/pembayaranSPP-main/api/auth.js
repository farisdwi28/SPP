const db = require("./models/index.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const config = require("./server.config.js");
var mysql = require('mysql2/promise');

//authorization : giving permission for someone with given identity

const authorize = async (level, username, plainPassword, callback) => {
	var response = {
		token: false,
		level: level,
		message: "",
	};
	var con = await mysql.createConnection({
		host: "localhost",
		user: "alipw",
		password: "werta3321",
		database: "db_spp"
	});

	if (username && plainPassword && level) {
		if (level == "admin" || level == "petugas") {
			const query = "select * from petugas where username=? and level=?";
			const [found,fields] = await con.execute(query, [username, level])
			//if username deoesn't exist in the database
			if (found.length <= 0) {
				response.message = "Username " + username + " as " + level + " not found";
			} else {
				const result = bcrypt.compareSync(
					plainPassword,
					found[0].password
				);
				if (!result) {
					response.message = "Wrong password";
				} else {
					response.message = "logged in";
					response.token = jwt.sign(
						{ username: username, level: level },
						(level === "admin" ? config.ADMIN_KEY : config.PETUGAS_KEY),
						{ expiresIn: "30d" }
					);
				}
			}
		} else {
			const query = "select * from siswa where nisn=?";
			const [found,fields] = await con.execute(query, [username])
			//if username deoesn't exist in the database
			if (found.length <= 0) {
				response.message = "NISN " + username + " as " + level + " not found";
			} else {
				const result = bcrypt.compareSync(
					plainPassword,
					found[0].password
				);
				if (!result) {
					response.message = "Wrong password";
				} else {
					response.message = "logged in";
					response.token = jwt.sign(
						{ username: username, level: level },
						config.SISWA_KEY,
						{ expiresIn: "30d" }
					);
					response.nisn = username;
					console.log(response)
				}
			}
		}
	} else {
		response.message = "Data incomplete";
	}
	con.close()
	callback(response);
};

/*
	authentication : making sure that person is the person that we want
	e.g : making sure the "admin" is not a hacker by checking their JWT
*/

const authenticate = async (level, token, callback) => {
	var authenticated = false;

	switch (level) {
		case "admin":
			jwt.verify(token, config.ADMIN_KEY, (err, decoded) => {
				callback(!err);
			});
			break;

		case "petugas":
			jwt.verify(token, config.PETUGAS_KEY, (err, decoded) => {
				callback(!err);
			});
			break;

		case "siswa":
			jwt.verify(token, config.SISWA_KEY, (err, decoded) => {
				callback(!err);
			});
			break;
	}
	return authenticated;
};

module.exports = {
	authorize: authorize,
	authenticate: authenticate,
};