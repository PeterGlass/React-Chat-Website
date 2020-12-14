const express = require('express');
const app = express();
const mysql = require("mysql");
const bodyParser = require('body-parser');
const cors = require("cors");

const db = mysql.createPool({
    multipleStatements: true,
    connectionLimit : 10,
    host: "192.168.1.116",
    user: "peter",
    password: "password",
    database: "website_database"
});

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/getMessage', (req, res) => {
    const sqlSelect = "SELECT * FROM message_logs";
    db.query(sqlSelect, (err, result) => {
        res.send(result);
    });
});

app.post('/insertMessage', (req, res) => {
    const alias = req.body.alias;
    const message = req.body.message;

    const sqlInsert = "INSERT INTO message_logs (alias, message) VALUES (?,?)";
    db.query(sqlInsert, [alias, message], (err, result) => {
        console.log(err);
    });
});

app.post('/insertUser', (req, res) => {
    const alias = req.body.alias;
    const password = req.body.password;

    const sqlInsert = "INSERT INTO user (alias, password) VALUES (?,?)";
    db.query(sqlInsert, [alias, password], (err, result) => {
        console.log(err);
    });
});

app.get('/isUserAuth', (req, res) => {
    const alias = req.query.alias;
    const inputPassword = req.query.password;

    const sqlSelect = "SELECT password FROM user WHERE alias = ?";
    let password;
    db.query(sqlSelect, alias, (err, result) => {
        if (!Array.isArray(result) || !result.length) {
            res.send(false);
        } else {
            if(result[0].password == inputPassword){
                res.send(true);
            } else {
                res.send(false);
            }
        }
    });
});

app.get('/isAliasUnique', (req, res) => {
    const alias = req.query.alias;

    const sqlSelect = "SELECT alias FROM user WHERE alias = ?";
    db.query(sqlSelect, alias, (err, result) => {
        if(!Array.isArray(result) || !result.length){
            res.send(true);
        } else {
            res.send(false);
        }
    })
});

app.get('/startSession', (req, res) => {
    const alias = req.query.alias;

    const sqlInsert = "INSERT INTO session (alias) VALUES (?); SELECT LAST_INSERT_ID() AS session_id";
    db.query(sqlInsert, alias, (err, result) => {
        res.send(result);
    });
});

app.delete('/endSession', (req, res) => {
    const sessionId = req.body.sessionId;
    const sqlDelete = "DELETE FROM session WHERE session_id = ?"
    db.query(sqlDelete, sessionId, (err, result) => {
        console.log(err);
    });
});

app.get('/getUserCount', (req, res) => {
    const sqlSelect = "SELECT COUNT(session_id) AS user_count FROM session";
    db.query(sqlSelect, [], (err, result) => {
        res.send(result);
    });
});

app.listen(3001, () => {
    console.log("running of port 3001");
});
