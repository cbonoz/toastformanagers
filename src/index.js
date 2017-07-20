'use strict';
const Alexa = require('alexa-sdk');
const request = require('request');

const toast = require('./toast');

//=========================================================================================================================================
// Constants and variable declarations.
//=========================================================================================================================================

//Replace with your app ID (OPTIONAL).  You can find this value at the top of your skill's page on http://developer.amazon.com.  
//Make sure to enclose your value in quotes, like this: const APP_ID = "amzn1.ask.skill.bb4045e6-b3e8-4133-b650-72923c5980f1";
const APP_ID = undefined;

const imageObj = {
    smallImageUrl: './img/toast_for_managers.png',
    largeImageUrl: './img/toast_for_managers.png'
};

//=========================================================================================================================================
// Skill logic below
//=========================================================================================================================================

const states = {
    QUERYMODE: '_QUERYMODE', // User is deciding which query to run
    RESTARTMODE: '_RESTARTMODE'
};

const queryHandlers = {
    'LaunchRequest': function () {
        this.emit('NewPortfolioIntent');
    },

    // ** AMAZON INTENTS BELOW ** //

    'AMAZON.HelpIntent': function () {
        this.emit(':ask', HELP_MESSAGE, HELP_MESSAGE);
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', STOP_MESSAGE);
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', STOP_MESSAGE);
    }
};

exports.handler = function (event, context, callback) {
    const alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    alexa.dynamoDBTableName = 'Toast'; // That's it!
    alexa.registerHandlers(queryHandlers);
    alexa.execute();
};