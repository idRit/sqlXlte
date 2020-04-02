const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dialogflow = require('dialogflow');
const uuid = require('uuid');

const { runSample, runStuff } = require("./index");
const { similarity } = require('./lv_dist');

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json({ limit: '50mb', extended: true }));

const fireQuery = require("./index");

app.get("/", async (req, res) => {
    return res.json({
        success:true,
        message: "working"
    });
});

app.post("/api/sendNaturalQuery", async (req, res) => {
    let naturalQuery = req.body.naturalQuery;

    const pool = require("./creds").pool;
    pool.getConnection(async function (err, connection) {
        let qry = await runSample('graceful-ratio-195710', naturalQuery);
        if (qry === "No intent matched") {
            // return qry;
            return res.json({
                success: false,
                message: qry
            });
        }
        connection.query(qry, async function (err, rows) {
            connection.release();
            if (err) {
                return res.json({
                    success: false,
                    message: qry
                });
            }

            let result = {};
            result.data = [...rows];
            if (similarity(qry, 'select %s, sum(%s) as %s, sum(%s) as %s, sum(%s) as %s from %s group by %s;') > 0.5) {
                result.type = 3;
            }
            if (similarity(qry, 'select * from %s where %s= "%s" and %s= (select max(%s) from %s where %s= "%s");') > 0.5) {
                result.type = 1;
            }
            if (similarity(qry, "select * from product") > 0.75) {
                result.type = 0;
            }
            if (similarity(qry, "select * from product where make = %s") > 0.75) {
                result.type = 2;
            }
            if (similarity(qry, 'select * from %s where make="%s" and model = "%s";') > 0.5) {
                result.type = 1;
            }
            

            //console.log(result);
            return res.json(result);
        });
    });
});

app.listen(3000);