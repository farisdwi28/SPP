/* 
	universal CRUD endpoint system
	this one file handles all the crud events
*/

var mysql = require("mysql2/promise");
const app = require("express")();
const db = require("./models/index.js");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");

app.use(bodyParser.urlencoded({ extended: false }));

//GET request

app.get("/:table_name", async (req, res) => {
	console.log(req.params.table_name);
	var con = await mysql.createConnection({
		host: "localhost",
		user: "alipw",
		password: "werta3321",
		database: "db_spp",
	});
	try {
		const query = "select * from " + req.params.table_name;
		const [result, fields] = await con.execute(query);
		res.json(result);
	} catch (error) {
		console.log(error);
		res.status(500).json(error.message);
	}
	con.close();
});

//GET request with specified id/primary key value

app.get("/:table_name/:where_id", async (req, res) => {
	try {
		const primary_key_col_name =
			db[req.params.table_name].primaryKeyAttributes;
		var where = {};
		where[primary_key_col_name] = req.params.where_id;
		const result = await db[req.params.table_name].findAll({
			raw: true,
			where: where,
		});
		res.json(result);
	} catch (error) {
		console.log(error);
		res.status(500).json(error.message);
	}
});

//POST request

app.post("/:table_name", async (req, res) => {
	//hashing the password, if there's any (some of the table doesn't need password to insert, so we don't need to hash anything)
	bcrypt.hash(req.body.password, 10, async function (err, hash) {
		//if there's any password to hash then set the current plain password to the already hashed one
		if (!err) req.body.password = hash;
		try {
			db[req.params.table_name]
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

//PUT request with specified id/primary key value

app.put("/:table_name", async (req, res) => {
	try {
		if (req.body.password)
			req.body.password = await bcrypt.hash(req.body.password, 10);
		const primary_key_col_name =
			db[req.params.table_name].primaryKeyAttributes;
		var where = {};
		where[primary_key_col_name] = req.body.where_id;
		const result = await db[req.params.table_name].update(req.body, {
			where: where,
		});
		res.json(result);
	} catch (error) {
		console.log(error);
		res.status(500).json(error.message);
	}
});

//DELETE request wih specified id/primary key value

app.delete("/:table_name", async (req, res) => {
	try {
		const primary_key_col_name =
			db[req.params.table_name].primaryKeyAttributes;
		var where = {};
		where[primary_key_col_name] = req.body.where_id;
		const result = await db[req.params.table_name].destroy({
			where: where,
		});
		res.json(result);
	} catch (error) {
		console.log(error);
		res.status(500).json(error.message);
	}
});

app.get("/msc/tableinfo/:table_name", async (req, res) => {
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
		const primaryKey = db[req.params.table_name].primaryKeyAttributes;
		const tableInfo = db[req.params.table_name].rawAttributes;
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

module.exports = app;