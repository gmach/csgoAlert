// Initialize Firebase
// TODO: Replace with your project's customized code snippet
var config = {
    apiKey: "AIzaSyBLm7YgDBKQm3DM3Thxo-mm0k5ZHkNLe4Q",
    authDomain: "csgochecker-efc38.firebaseapp.com",
    databaseURL: "https://csgochecker-efc38.firebaseio.com",
    projectId: "csgochecker-efc38",
    storageBucket: "csgochecker-efc38.appspot.com",
    messagingSenderId: "234138437129"
};
firebase.initializeApp(config);

function createElement(id, value) {
  var div = document.createElement('div');
  div.innerHTML = "<div class='spinResult" +
      (value == "0"? " greenResult":"") +
      "' id='id_" + id + "'><span class='spinTime'>" + id + "</span><span class='spinValue'>" + value + "</span></div>";
  return div.firstChild;
}

window.addEventListener('load', function() {
    var ref = firebase.database().ref('history').limitToLast(100);
    var results = document.getElementsByClassName('spinResults')[0];
    ref.on('child_added', function(data) {
        results.insertBefore(createElement(data.key, data.val()), results.firstChild);
    });
    ref.on('child_changed', function(data) {
        var element = document.getElementById('id_' + data.key);
        element.textContent = data.val();
    });
    ref.on('child_removed', function(data) {
        var element = document.getElementById('id_' + data.key);
        element.parentElement.removeChild(element);
    });
    var errorParam = get('error');
    if (errorParam != null) {
        var error = document.getElementsByClassName('alert-danger')[0];
        error.textContent = errorParam;
        error.style.display = 'block';
    }
    function get(name){
        if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(location.search))
            return decodeURIComponent(name[1]);
    }
}, false);


