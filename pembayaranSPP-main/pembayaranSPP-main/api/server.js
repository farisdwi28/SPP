const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const db = require("./models/index.js");
const crud = require("./crud.js");
const auth = require("./auth.js");
const auth0 = require("./middlewares.js");
const model = require("./models/index.js");
const cors = require("cors");
const mysql = require("mysql2/promise")
const bcrypt = require("bcrypt")

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api/crud", auth0.authenticate, crud);

app.post("/api/login", (req, res) => {
	auth.authorize(
		req.body.level,
		req.body.username,
		req.body.password,
		(response) => {
			res.send(response);
		}
	);
});

app.get("/api/siswa/history/:nisn", auth0.authenticate2, async(req, res) => {
	try {
		var con = await mysql.createConnection({
			host: "localhost",
			user: "alipw",
			password: "werta3321",
			database: "db_spp",
		});
		const query = "select * from pembayaran";
		const [result, fields] = await con.execute(query, [req.params.nisn]);
		for(i in result){
			delete result[i]["createdAt"];
			delete result[i]["updatedAt"];
			delete result[i]["nisn"];
			console.log(i)
		}
		con.close();
		res.json(result);
	} catch (err) {
		console.log(err)
		res.status(500).json(err.message);
	}
});

app.get("/api/petugas/history/history/history", auth0.authenticate3, async (req, res) => {
	try {
		var con = await mysql.createConnection({
			host: "localhost",
			user: "alipw",
			password: "werta3321",
			database: "db_spp",
		});
		const query = "select * from pembayaran";
		const [result, fields] = await con.execute(query);
		for(i in result){
			delete result[i]["createdAt"];
			delete result[i]["updatedAt"];
		}
		con.close();
		res.json(result);
	} catch (err) {
		console.log(err)
		res.status(500).json(err.message);
	}
});

app.get("/api/petugas/crud/tableinfo/pembayaran", auth0.authenticate3, async (req, res) => {
	async function addReferenceData(tableInfo, callback) {
		let reference_ids = {};
		var con = await mysql.createConnection({
			host: "localhost",
			user: "alipw",
			password: "werta3321",
			database: "db_spp",
		});
		for (let key of Object.keys(tableInfo)) {
			if (tableInfo[key].references) {
				const [result, fields] = await con.execute(
					"SELECT " +
						tableInfo[key].references.key +
						" FROM " +
						tableInfo[key].references.model
				);
				reference_ids[tableInfo[key].references.model] = [];
				for (i of result) {
					reference_ids[tableInfo[key].references.model].push(
						i[tableInfo[key].references.key]
					);
				}
			}
		}
		tableInfo["reference_ids"] = reference_ids;
		con.close();
		callback(tableInfo);
	}

	try {
		const primaryKey = db["pembayaran"].primaryKeyAttributes;
		const tableInfo = db["pembayaran"].rawAttributes;
		delete tableInfo["createdAt"];
		delete tableInfo["updatedAt"];
		addReferenceData(tableInfo, (tableInfo) => {
			res.send(tableInfo);
		});
	} catch (error) {
		console.log(error);
		res.json(error.message);
	}
});

app.post("/api/petugas/crud/pembayaran", auth0.authenticate3, async (req, res) => {
	//hashing the password, if there's any (some of the table doesn't need password to insert, so we don't need to hash anything)
	bcrypt.hash(req.body.password, 10, async function (err, hash) {
		//if there's any password to hash then set the current plain password to the already hashed one
		if (!err) req.body.password = hash;
		try {
			db["pembayaran"]
				.create(req.body)
				.then((result) => {
					res.json(result);
				})
				.catch((error) => {
					console.log(error);
					res.status(500).json(error.message);
				});
		} catch (error) {
			console.log(error);
			res.status(500).json(error.message);
		}
	});
});


app.listen(3001, () => {
	console.log("server is running at port : 3001");
});