const path = require('path');
const express = require('express');
const port = process.env.PORT || 3000;
const pg = require('pg');

const app = express();


app.use(express.urlencoded({ extended: true }));
app.use(express.json());



const client = new pg.Client({
    connectionString: process.env.DATABASE_URL || 'postgres://pbticiobojhesl:c5f1056964101ea3f914f934d6d4ec1c4370e13406c8745060e60d91b38a6948@ec2-54-90-13-87.compute-1.amazonaws.com:5432/d9ntfu7nqhbbo1',
    ssl: {
        rejectUnauthorized: false
    }
});

client.connect(err => {
    if (err) {
        console.error('connection error', err.stack)
    } else {
        console.log('connected')

    }
})





app.get('/contacts', (req, res) => {
    try {
        client.query('SELECT * FROM salesforce.contact').then((data) => {
            console.log(data.rows);
            res.json(data.rows);
        });

    } catch (err) {
        console.error(err.message);

    }
});







// create a contact after checking if it already exists or not





app.post('/contacts', (req, res) => {

    try {
        let email = req.body.email;
        let lastname = req.body.lastname;
        let firstname = req.body.firstname;
        let phone = req.body.phone;

        let createContact = client.query('SELECT sfid, id FROM salesforce.Contact WHERE email=$1', [email]).then((data) => {
            if (data !== undefined) {
                if (data.rowCount == 0) {
                    createContact = client.query('INSERT INTO salesforce.Contact (email, lastname, firstname, phone)  VALUES ($1, $2, $3, $4)', [email, lastname, firstname, phone]).then((d) => {
                        res.send("contact has been added successfully");
                    });
                } else {
                    createContact = client.query('SELECT sfid, id FROM salesforce.Contact WHERE email = $1', [email]).then((data) => {
                        res.json(data.rows[0].sfid);
                    });
                }
            } else {
                res.json(createContact.rows[0]);
            }
        });
    } catch (err) {
        console.error(err.message);

    }

});


// get a contact based on ID

app.get('/contacts/:id', (req, res) => {
    try {
        const { id } = req.params;

        client.query('SELECT * FROM salesforce.contact WHERE id = $1', [id]).then((data) => {
            console.log(data.rows[0]);
            res.json(data.rows[0]);
        });

    } catch (err) {
        console.error(err.message);
    }
});

//update a contact
app.put('/contacts/:id', (req, res) => {
    try {
        const { id } = req.params;
        let firstname = req.body.firstname;
        let lastname = req.body.lastname;
        let email = req.body.email;
        let phone = req.body.phone;

        client.query(' UPDATE salesforce.Contact SET firstname = $1, lastname = $2, email = $3, phone = $4 WHERE id = $5', [firstname, lastname, email, phone, id]).then((data) => {
            console.log(data);
            res.json(data);

        });
    } catch (err) {
        console.error(err.message);
    }
});

//deactivate a contact

app.patch('/contacts/:id', (req, res) => {
    try {
        const { id } = req.params;
        client.query('UPDATE salesforce.Contact SET isActive__c = false WHERE id = $1', [id]).then((data) => {
            res.json(data);

        });
    } catch (err) {
        console.error(err.message);
    }

});


app.get('/account', (req, res) => {
    try {
        client.query('SELECT * FROM salesforce.account').then((data) => {
            console.log(data.rows);
            res.json(data.rows);
        });

    } catch (err) {
        console.error(err.message);

    }
});
//create new contract

app.post('/contract', (req, res) => {
    try {
        let accountName = req.body.name;
        let date = req.body.date;
        let contrTerm = req.body.contractTerm;
        let accId = '';
        client.query('SELECT sfid FROM salesforce.account WHERE name = $1', [accountName]).then((cData) => {
            accId = cData.rows[0].sfid;
            client.query('INSERT INTO salesforce.Contract (accountId, startDate, contractTerm) VALUES ($1, $2, $3)', [accId, date, contrTerm], (err, data) => {
                res.json(data);
            })

        })
    } catch (err) {
        console.error(err.message);
    }
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



app.listen(port, () => console.log(`listening on ${ port }`));