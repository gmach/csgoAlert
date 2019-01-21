const PUPPETEER = require('puppeteer');
const SMS = require('./sms');
const TO_MOBILENUMBER = '+61412746478';

(async () => {

  const browser = await PUPPETEER.launch({headless: true});
  const page = await browser.newPage();
  //page.on('console', msg => console.log(msg.text()));
  await page.goto('https://csgofast.com/game/double', {waitUntil: 'load', timeout: 0});
  await page.addScriptTag({ url: 'https://www.gstatic.com/firebasejs/5.8.0/firebase.js'});
  await page.exposeFunction('sms', text =>
    SMS(TO_MOBILENUMBER, text)
  );
  await page.evaluate(() => {
    //debugger;
    const FBCONFIG = {
      apiKey: "AIzaSyBLm7YgDBKQm3DM3Thxo-mm0k5ZHkNLe4Q",
      authDomain: "csgochecker-efc38.firebaseapp.com",
      databaseURL: "https://csgochecker-efc38.firebaseio.com",
      projectId: "cs  gochecker-efc38",
      storageBucket: "csgochecker-efc38.appspot.com",
      messagingSenderId: "234138437129"
    };
    firebase.initializeApp(FBCONFIG);
    var countSpinsSinceZero = 0;
    const SPINS_ALERT_FREQ = 20;
    var database = firebase.database();
    var history = database.ref('/history');
    history.on('value', function(snapshot) {
      var historyValues = snapshotToArray(snapshot).reverse();
      countSpinsSinceZero = historyValues.findIndex(function (element) {
        return element == 0;
      })
      if (countSpinsSinceZero>-1)
        database.ref('numberSpinsSinceZero').set(countSpinsSinceZero);
      else
        database.ref('numberSpinsSinceZero').set(historyValues.length);
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
            this.database.ref('/history').push(raffleResult);
          }
        }
      }
    };
    var observer = new MutationObserver(onMutate);
    observer.database = firebase.database();
    observer.observe(item, {childList: true});
  });
  //await browser.close();

})().catch((e) => console.error(e));
