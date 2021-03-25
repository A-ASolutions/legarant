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
        let allcontacts = client.query('SELECT * FROM salesforce.contact').then((data) => {
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








app.listen(port, () => console.log(`listening on ${port}`));