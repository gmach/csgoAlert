const csgoAlert = require('./csgoAlert')
const express = require('express')
const bodyParser = require('body-parser')

// Create a new instance of express
const app = express()

// create application/x-www-form-urlencoded parser
const urlencodedParser = bodyParser.urlencoded({ extended: false })

//app.get('/', (req, res) =>  res.sendFile(`${__dirname}/index.html`));
app.use(express.static('public'));

app.post('/start', urlencodedParser, (req, res) => {
    let mobile = req.body.mobile;
    if (/^\d{10}$/.test(mobile)) {
        const freq = req.body.freq;
        csgoAlert.start(mobile, freq, () => {
            res.redirect('/progress.html');
        })
    } else {
        res.status(500).send({ error: 'Invalid mobile number: must be ten digits' });
    }
})

app.post('/stop', (req, res) => {
    csgoAlert.stop();
    res.redirect('/');
})

app.listen(3000, function (err) {
    if (err) {
        throw err
    }
    console.log('Server started on port 3000')
})
