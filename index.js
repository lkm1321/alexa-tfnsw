/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/
/**
 * This sample demonstrates a simple skill built with the Amazon Alexa Skills
 * nodejs skill development kit.
 * This sample supports multiple lauguages. (en-US, en-GB, de-DE).
 * The Intent Schema, Custom Slots and Sample Utterances for this skill, as well
 * as testing instructions are located at https://github.com/alexa/skill-sample-nodejs-fact
 **/

'use strict';

const Alexa = require('alexa-sdk');
const TFNSW = require('./tfnsw.js'); 
const moment = require('moment-timezone'); 
const bleep = require('alexa-uncensor'); 

const APP_ID = undefined;  // TODO replace with your app ID (OPTIONAL).
const apiKey = "MzhWHflZGG3p3mnn9PqMwagLmGjYCPMAnn5w"; 

const handlers = {
    'LaunchRequest': function () {
        this.emit(':tell', 'How can I help you?'); // Change to :ask. 
    },

    'FindNextTrainIntent': function() {

    	var alexa = this; // Stashing this for access inside callback. 
    	const intent = alexa.event.request.intent; 
    	const fromName = intent.slots.FROM.value; 
    	const toName = intent.slots.TO.value; 
        
        if (fromName === undefined) fromName = 'Redfern'; // HACK. Use DynamoDB or so to remember the default station. 
        	    const tfnsw = new TFNSW(apiKey); 
        const m = moment().tz('Australia/Sydney'); 
        const date = m.format('YYYYMMDD');
        const time = m.format('kkmm');
   
		tfnsw.getStop(fromName, 10, (err, resp, body) => {
			if (err) throw err; 
			if (resp.statusCode != 200) console.error('API error'); 
			
			var fromID = JSON.parse(body).locations[0].assignedStops[0].id; // HACK! check modes of transport.  
			
			tfnsw.getStop(toName, 10, (err, resp, body) => {

				if (err) throw err; 

				if (resp.statusCode != 200) console.error('API error');

				var toID = JSON.parse(body).locations[0].assignedStops[0].id; 

				tfnsw.getTrips(fromID, toID, date, time, 1, (err, resp, body) => {
					if (resp.statusCode != 200) console.error('API error');

					const bodyObj = JSON.parse(body); 
					
					const departureTimeEstimated = bodyObj.journeys[0].legs[0].origin.departureTimeEstimated;  
					// console.log(departureTimeEstimated);
					const outSpeech = 'The next train from ' + fromName + ' to ' + toName + ' is ' + moment(departureTimeEstimated).fromNow(); 
					console.log(outSpeech);
					alexa.emit(':tellWithCard', outSpeech, 'Sydney Trains', outSpeech);
				});
			});
		});
    },
    
    'WhosTheSugarDaddyIntent': function() {
        this.emit(':tell', bleep.uncensor_line('Fuck you, you have always been a piece of shit. Now stop fucking around and go get shit done.')); 
    }
};

exports.handler = function (event, context) {
    const alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

