const path = require('path');
const express = require('express');
const port = process.env.PORT || 3000;
let pg = require('pg');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());



let connectionString = process.env.DATABASE_URL || 'postgres://pbticiobojhesl:c5f1056964101ea3f914f934d6d4ec1c4370e13406c8745060e60d91b38a6948@ec2-54-90-13-87.compute-1.amazonaws.com:5432/d9ntfu7nqhbbo1';
const { Client } = require('pg').native;

const client = new Client({
    connectionStr: connectionString,
    ssl: { rejectUnauthorized: false }
});


app.get('/contacts', (req, res) => {
    client.connect();
    client.query('SELECT Email, Id FROM salesforce.contact', (err, data) => {
        if (err) {
            console.log('Can not log into database', err);
        } else {
            console.log(data.rows);
            res.json(data.rows);
        }
    });
});

app.get('/example', (req, res) => {
    pg.connect(connectionString, function(err, client, done) {
        if (err) {
            console.log('Can not log into database');
        } else {
            console.log('Connect to database...');
            client.query('SELECT Id, email  FROM salesforce.contact', function(err, result) {
                res.write('<li>' + result.rows + '</li>');
                done();
            });
        }
    });
});




// create a contact after checking if it already exists or not

/*app.post('/contacts', (req, res) => {

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
})*/

/*
app.post('/contacts', (req, res) => {

    try {
        let { email } = req.params;
        let { lastname } = req.params;

        const createContact = lient.query('SELECT sfid, id FROM salesforce.Contact WHERE email=$1', [email]);
        if (createContact !== undefined) {
            if (createContact.rowCount == 0) {
                createContact = client.query('INSERT INTO salesforce.Contact (lastname, email)  VALUES ($1, $2)', [lastname, email]);
                res.send("contact has been added successfully");
            } else {
                createContact = client.query('SELECT sfid, id FROM salesforce.Contact WHERE email = $1', [email]);
                res.json(createContact.rows[0].id);
            }
        } else {
            res.json(createContact.rows[0]);

        }
    } catch (err) {
        console.error(err.message);

    }

});*/
app.post('/contacts', (req, res) => {

    try {
        const {
            lastName
        } = req.body.lastName;
        const newContact = createContact = client.query('INSERT INTO salesforce.Contact (lastname)  VALUES ($1)', [lastName]);
        res.json(newContact.rows[0]);
        console.log('its working');
    } catch (err) {
        console.error(err.message);
    }
});


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