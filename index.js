const path = require('path');
const express = require('express');
const port = process.env.PORT || 3000;
let pg = require('pg');


const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());




let connectionString = process.env.DATABASE_URL || 'postgres://lovoalxadtvizy:4f2e301d61a7bde9feb156f42d47e5519a32e6dde0624415dede8773e3f133ec@ec2-52-7-115-250.compute-1.amazonaws.com:5432/d8mnkbfbjuhb0s';
const { Client } = require('pg');
const { error } = require('console');

const client = new Client({
    connectionString: connectionStr,
    ssl: { rejectUnauthorized: false }
});
client.connect();

app.get('/contacts', (req, res) => {
    client.query('SELECT * FROM salesforce.Contact', (err, data) => {
        res.json(data);
    });
});

// create a contact after checking if it already exists or not

app.post('/contacts', (req, res) => {

    let { email } = req.params;
    let { lastname } = req.params;

    client.query('SELECT sfid, id FROM salesforce.Contact WHERE email=$1', [email], (err, data) => {
        if (data !== undefined) {
            if (data.rowCount == 0) {
                client.query('INSERT INTO salesforce.Contact (lastname, email)  VALUES ($1, $2)', [lastname, email], (err, d) => {
                    if (d.rowCount == 0) {
                        res.send('Something went wrong please check your entries');
                    } else {
                        client.query('SELECT sfid, id FROM salesforce.Contact WHERE email = $1', [email], (err, data) => {
                            res.json(data.rows[0].id)
                        })
                    }

                });

            } else {
                res.json(data.rows[0]);
            }

        }
    })
})

//update a contact
app.put('/contacts/:id', (req, res) => {
    const { id } = req.params;
    let { name } = req.body.name;
    let { lastname } = req.body.lastname;
    let { email } = req.body.email;
    let { phone } = req.body.phone;

    client.query(' UPDATE salesforce.Contact SET name = $1, lastname = $2, email = $3, phone = $4 WHERE contact_id = $5', [name, lastname, email, phone, id], (err, data) => {
        if (data.rowCount !== 0) {
            res.json(data);
        } else {
            res.send('Something went wrong');
        }
    });


});

//deactivate a contact

app.patch('/contacts/:id', (req, res) => {
    const { id } = req.params;
    client.query('UPDATE salesforce.Contact SET isActive__c = false WHERE contacts_id = $1', [id], (err, data) => {
        if (data.rowCount !== 0) {
            res.json(data);
        } else {
            res.send('Something went wrong')
        }
    });
});

//create new contract

app.post('/contract', (req, res) => {
    let { accountName } = req.body.name;
    let { date } = req.body.date;
    let { contrTerm } = req.body.contractTerm;
    let { accId } = '';
    client.query('SELECT sfid FROM salesforce.Account WHERE name = $1', [accountName], (err, acData) => {
        accId = accData.rows[0].sfid;
        client.query('INSERT INTO salesforce.Contract (accountId, startDate, contractTerm) VALUES ($1, $2, $3)', [accId, date, contrTerm], (err, data) => {
            res.json(data);
        })

    })
});

//update contract
app.put('/contract', (req, res) => {
    let { accountName } = req.params;
    let { accSfid } = '';
    let { contrTerm } = req.body.contractTerm;
    let { date } = req.body.date;
    let { status } = req.body.status;

    client.query('SELECT sfid FROM salesfoce.Account WHERE name = $1', [accountName], (err, acData) => {
        accSfid = acData.rows[0].sfid;

        client.query('UPDATE salesforce.Contract SET contractTerm = $1, startDate = $2, status = $3 WHERE accountId = $4', [contrTerm, date, status, accSfid], (err, data) => {
            res.json(data);
        });
    });


});




app.listen(port, () => console.log(`listening on ${port}`));