const PUPPETEER = require('puppeteer');
const FIREBASE = require("firebase");
const SMS = new require('./sms');
const MOMENT_TIMEZONE = require('moment-timezone');
const CURRENT_TIMEZONE = 'Australia/Brisbane';
const FBCONFIG = {
    apiKey: "AIzaSyBLm7YgDBKQm3DM3Thxo-mm0k5ZHkNLe4Q",
    authDomain: "csgochecker-efc38.firebaseapp.com",
    databaseURL: "https://csgochecker-efc38.firebaseio.com",
    projectId: "csgochecker-efc38",
    storageBucket: "csgochecker-efc38.appspot.com",
    messagingSenderId: "234138437129"
};
FIREBASE.initializeApp(FBCONFIG);
const database = FIREBASE.database();
const history = database.ref('/history');
let browser;

module.exports = {
    start: async function (mobile, freq, callback) {
        try {
            history.set(null);
            history.on('value', function (snapshot) {
                var historyValues = snapshotToArray(snapshot).reverse();
                var countSpins = countSpins = historyValues.findIndex(function (element) {
                    return element == 0;
                })
                if (countSpins == -1)
                    countSpins = historyValues.length;
                database.ref('countSpins').set(countSpins);
                if (countSpins != 0 && countSpins % freq == 0)
                    SMS(mobile, '**** Alert for CSGOFAST.COM ****\n'
                        + `${countSpins} spins since last green 0.\n`
                        + `The last number was ${historyValues[0]}.\n`
                        + 'To check visit http://csgofast.com/game/double');
            });

            function snapshotToArray(snapshot) {
                var returnArr = [];
                snapshot.forEach(function (childSnapshot) {
                    var item = childSnapshot.val();
                    item.key = childSnapshot.key;
                    returnArr.push(item);
                });
                return returnArr;
            };
            browser = await PUPPETEER.launch({
                args: ['--no-sandbox'],
                headless: true
            });
            const page = await browser.newPage();
            //page.on('console', msg => console.log(msg.text()));
            await page.goto('https://csgofast.com/game/double', {waitUntil: 'load', timeout: 0});
            const RAFFLE_RESULT_SELECTOR = '.bonus-game-end';
            await page.waitForSelector(RAFFLE_RESULT_SELECTOR);
            //await page.addScriptTag({ url: 'https://www.gstatic.com/firebasejs/5.8.0/firebase.js'});
            await page.exposeFunction('setResult', result => {
                const currentTime = MOMENT_TIMEZONE().tz(CURRENT_TIMEZONE).format('h:mm:ss a');
                history.child(currentTime).set(result);
                if (result == '0') {
                    SMS(mobile, '**** Alert for CSGOFAST.COM ****\n'
                        + 'It just hit 0!\n'
                        + 'To check visit http://csgofast.com/game/double');
                }
            });
            await page.evaluate(() => {  // This scope is within browser window not node!
                //debugger;
                const RAFFLE_RESULT_SELECTOR = '.bonus-game-end';
                let item = document.querySelector(RAFFLE_RESULT_SELECTOR);
                var onMutate = function (mutationsList) {
                    for (var mutation of mutationsList) {
                        if (mutation.type == 'childList') {
                            if (mutation.addedNodes.length) {
                                let raffleResult = mutation.addedNodes[0].data;
                                setResult(raffleResult);
                            }
                        }
                    }
                };
                var observer = new MutationObserver(onMutate);
                observer.observe(item, {childList: true});
            });
            return callback(null);
        } catch (e) {
            return callback(e);
        }

    },
    stop: async function () {
        if (browser != undefined)
            await browser.close();
        browser = null;
        history.off();
    }
}
