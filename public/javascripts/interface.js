var lcd = require("./lcdMock").lcd
var lcd = new lcd();
var stdin = process.openStdin();
var fs = require('fs');
var currentScreen = 0;
var gegevens = [];

var screens = {
    0: function(){lcd.clear();lcd.println(gegevens.min + " tot " + gegevens.max,1); lcd.println("Wekker op " + gegevens.wekker,2);},
    1: function(){lcd.clear();lcd.println("Zon op: " + gegevens.vandaagOp,1); lcd.println("Zon on: " + gegevens.vandaagOn, 2)},
    2: function(){lcd.clear();lcd.println(vakken(gegevens)[0],1); lcd.println(vakken(gegevens)[1],2)},
    3: function(){lcd.clear();nu = new Date();lcd.println(nu.getDay() + " | " + nu.getHours() + ":" + nu.getMinutes(),1)}
}

var start = function(tijdenDB){
var gegevens = tijdenDB;
lcd.clear();
screens[3]();
lcd.on();
}

stdin.addListener("data", function(d) {
gegevens = JSON.parse(fs.readFileSync('public/DB.json', 'utf8'));
var input = d.toString().trim();
currentScreen = input;
console.log("currentScreen: ", currentScreen);
    screens[currentScreen]();
});

var update = function(){

}

var stop = function(){
lcd.clear();
lcd.off();
}

var vakken = function(gegevens){
    gegevens["dateStart"].sort(function(a, b){
        var keyA = a.startDate,
            keyB = b.startDate;
        // Compare the 2 dates
        if(keyA < keyB) return -1;
        if(keyA > keyB) return 1;
        return 0;
    });
    
    var ln1 = "";
    var ln2 = "";
    for(var i = 0;i < gegevens["dateStart"].length;i++){
        var summary = gegevens["dateStart"][i]["summary"];
        summary = summary.substr(summary.indexOf("-") + 1, summary.length);
        summary = summary.substr(0,summary.indexOf("-")-1).trim().replace("V62", "").replace("ATH6.","").replace(/[0-9]/g, '');
        var a = i+1
        if(ln1.length + summary.length < 17){
            if(ln1.length === 0){ln1 +=(a+summary)} else {ln1 += ("/"+a+summary);}
        } else {
            if(ln2.length === 0){ln2 += (a+summary)} else {ln2 += ("/"+a+summary)};
        }
    }
    var ln = [ln1,ln2];
    return ln;
}

module.exports = {start, update, stop}
