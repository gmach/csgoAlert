const csgoAlert = require('./csgoAlert')
const express = require('express')
const bodyParser = require('body-parser')

// Create a new instance of express
const app = express()

// create application/x-www-form-urlencoded parser
const urlencodedParser = bodyParser.urlencoded({ extended: false })

let isRunning = false;
let browser;

//app.get('/', (req, res) =>  res.sendFile(`${__dirname}/index.html`));
app.use(express.static('public'));

app.post('/start', urlencodedParser, (req, res) => {
    if (isRunning) {
        res.redirect('/progress.html');
        return;
    }
    let mobile = req.body.mobile;
    if (/^\d{10}$/.test(mobile)) {
        const freq = req.body.freq;
        csgoAlert(mobile, freq, function(err, data) {
            if (err) {
                console.log("ERROR! " + err.stack);
                return res.redirect('/progress.html?error=' + err.message);
            }
            browser = data;
            res.redirect('/progress.html');
            isRunning = true;
        })
    } else {
        res.status(500).send({ error: 'Invalid mobile number: must be ten digits' });
    }
})

app.post('/stop', async (req, res) => {
    isRunning = false;
    if (browser != undefined)
        await browser.close();
    res.redirect('/');
})

app.listen(80, function (err) {
    if (err) {
        throw err
    }
    console.log('Server started on port 80')
})
