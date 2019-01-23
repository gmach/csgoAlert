const PUPPETEER = require('puppeteer');
const SMS = require('./sms');
const MOMENT_TIMEZONE = require('moment-timezone');
const TO_MOBILENUMBER = '+61412746478';
const CURRENT_TIMEZONE = 'Australia/Brisbane';

(async () => {

  const browser = await PUPPETEER.launch({headless: false});
  const page = await browser.newPage();
  //page.on('console', msg => console.log(msg.text()));
  await page.goto('https://csgofast.com/game/double', {waitUntil: 'load', timeout: 0});
  await page.addScriptTag({ url: 'https://www.gstatic.com/firebasejs/5.8.0/firebase.js'});
  await page.exposeFunction('sms', text =>
    SMS(TO_MOBILENUMBER, text)
  );
  await page.exposeFunction('currentTime', () => {
    return MOMENT_TIMEZONE().tz(CURRENT_TIMEZONE).format('h:mm:ss a');
  });
  await page.evaluate(() => {
    debugger;
    const SPINS_ALERT_FREQ = 15;
    const FBCONFIG = {
      apiKey: "AIzaSyBLm7YgDBKQm3DM3Thxo-mm0k5ZHkNLe4Q",
      authDomain: "csgochecker-efc38.firebaseapp.com",
      databaseURL: "https://csgochecker-efc38.firebaseio.com",
      projectId: "cs  gochecker-efc38",
      storageBucket: "csgochecker-efc38.appspot.com",
      messagingSenderId: "234138437129"
    };
    firebase.initializeApp(FBCONFIG);
    var database = firebase.database();
    var history = database.ref('/history');
    database.ref('history').set(null);
    history.on('value', function(snapshot) {
      var historyValues = snapshotToArray(snapshot).reverse();
      var countSpinsSinceZero = countSpinsSinceZero = historyValues.findIndex(function (element) {
        return element == 0;
      })
      if (countSpinsSinceZero == -1)
          countSpinsSinceZero = historyValues.length;
      database.ref('numberSpinsSinceZero').set(countSpinsSinceZero);
      if (countSpinsSinceZero != 0 && countSpinsSinceZero % SPINS_ALERT_FREQ == 0)
        sms('**** Alert for CSGOFAST.COM ****\n'
          + countSpinsSinceZero + ' spins since last green 0.\n'
          + 'The last number was ' + historyValues[0] +'.\n'
          + 'To check visit http://csgofast.com/game/double');
    });
    function snapshotToArray(snapshot) {
      var returnArr = [];
      snapshot.forEach(function(childSnapshot) {
        var item = childSnapshot.val();
        item.key = childSnapshot.key;
        returnArr.push(item);
      });
      return returnArr;
    };

    const RAFFLE_RESULT_SELECTOR = '.bonus-game-end';
    let item = document.querySelector(RAFFLE_RESULT_SELECTOR);
    var onMutate = function(mutationsList) {
      for(var mutation of mutationsList) {
        if (mutation.type == 'childList') {
          if (mutation.addedNodes.length) {
            let raffleResult = mutation.addedNodes[0].data;
            console.log(raffleResult);
            currentTime().then(function(value) {
                firebase.database().ref('/history').child(value).set(raffleResult);
            });
          }
        }
      }
    };
    var observer = new MutationObserver(onMutate);
    observer.observe(item, {childList: true});
  });
  //await browser.close();

})().catch((e) => console.error(e));
