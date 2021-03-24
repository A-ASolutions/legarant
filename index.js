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


app.get('/', (req, res) => {
    try {
        const allContacts = client.query('SELECT * FROM salesforce.contact');
        console.log(allContacts.rows);
        res.json(allContacts.rows);

    } catch (err) {
        console.error(err.message);

    }
});



app.post('/contacts', (req, res) => {

    try {
        const {
            lastName
        } = req.body;
        const newContact = createContact = client.query('INSERT INTO salesforce.Contact (lastname)  VALUES ($1)', [lastName]);
        res.json(newContact.rows[0]);
    } catch (err) {
        console.error(err.message);
    }
});




app.listen(port, () => console.log(`listening on ${port}`));