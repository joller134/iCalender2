var express = require('express');
var router = express.Router();
var ical2json = require("ical2json");
var request = require('request');
var SunCalc = require('suncalc');
var cmd = require('node-cmd');

var aantal = 0;

/* GET home page. */
router.get('/', function (req, res, next) {

    aantal++;
	var wekker;
    var output;
	var min = 0;
	var max = 0;

    request.get('https://asg-elo.somtoday.nl/services/webdav/calendarfeed/a87afea9-6794-46f3-8396-9c2effc0a6f3', function (error, response, body) {
        var times = SunCalc.getTimes(new Date(), 52.3367572, 5.2355392);
		var zonOp = times.sunrise.getHours() + ":" + times.sunrise.getMinutes();
		var zonOn = times.sunset.getHours() + ":" + times.sunset.getMinutes();
		
		output = ical2json.convert(body);
        //console.log(output['VCALENDAR'][0]['VEVENT']);
		

        var outputArray = output['VCALENDAR'][0]['VEVENT'];

        var dateStart = [];
        var dateEnd = [];

        for (var k = 0; k < outputArray.length; k++) {

            //TODO parse date to readable format. outputArray[k].DTSTART

            var currentDate = new Date();
            var day = currentDate.getDate() + 1
            var month = currentDate.getMonth() + 1
            var year = currentDate.getFullYear()
			var dagHoeveelheid = new Date(currentDate.getFullYear(), currentDate.getMonth()+1, 0).getDate();
			if(dagHoeveelheid < day){
				month = month + 1;
				day = 1;
			}
            if (month < 10) {
                month = "0" + String(month);
            }
			if (day < 10) {
                day = "0" + String(day);
            }
            var dateFormatted = (String(year) + String(month) + String(day));
            var end = outputArray[k].DTEND.substr(outputArray[k].DTEND.indexOf('T') + 1)
            var start = outputArray[k].DTSTART.substr(outputArray[k].DTSTART.indexOf('T') + 1);
            var date = outputArray[k].DTSTART.substr(0, outputArray[k].DTSTART.lastIndexOf('T'));
            start = parseInt(start.substr(0, 4));
            end = parseInt(end.substr(0, 4));


           // console.log((String(year) + String(month) + String(day)), date);

            if (Number(dateFormatted) === Number(date)) {
                dateStart.push({startDate: start, summary: outputArray[k].SUMMARY});
                //console.log("gepusht");
            }
            if (Number(dateFormatted) === Number(date)) {
                dateEnd.push(end);
            }

            //Lezen van summary en TODO lezen van javascript object
            //console.log("De les " + outputArray[k].SUMMARY + " begint om " + outputArray[k].DTSTART);
        }
		
	
		var TempDate = [];
		for(var k = 0; k < dateStart.length; k++){
			TempDate[k] = dateStart[k]["startDate"] 
		}
		min = Math.min.apply(Math, TempDate);
        max = Math.max.apply(Math, dateEnd);
        console.log(min, ' tot ', max, ' | ', currentDate);

        var alarmTijden = [
            {
                eerstLesUurTijd: 830,
                opstaanTijd: 700
            },
            {
                eerstLesUurTijd: 950,
                opstaanTijd: 830,
            },
            {
                eerstLesUurTijd: 1050,
                opstaanTijd: 940,
            },
            {
                eerstLesUurTijd: 1150,
                opstaanTijd: 1030,
            }
        ];
        alarmTijden.forEach(function(element) {
            if(element['eerstLesUurTijd'] === min){
                wekker = element['opstaanTijd'];
            };
        });
        console.log(wekker);
		res.render('index', {title: 'ICalendar', Reload: aantal, wekker, min, max, zonOp, zonOn});
    });

	var pyScript = cmd.run("python test.py");
	

});


module.exports = router;
