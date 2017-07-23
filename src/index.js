'use strict';
const Alexa = require('alexa-sdk');
const request = require('request');
const co = require('co');
const moment = require('moment');
const pl = require('pluralize');

// User libraries.
const toast = require('./toast');
const key = require('./key');
const api = require('./api');

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
        // TODO: fetch auth token after the user has registered through auth callback online.
        const self = this;
        request.post({url: api.postAuthToken(), form: key.getPostAuthTokenBody()}, (err, res, body) => {
            if (err) {
                console.error('err getting auth token: ' + err);
                self.emit(':tell', "There was a problem retrieving your auth token, " + err);
            }
            console.log("auth response body: " + body);
            const r = JSON.parse(body);
            const accessToken = r.access_token;
            self.attributes['tok'] = accessToken;
            console.log("accessToken: " + accessToken);
            self.emit(':ask', toast.WELCOME_TEXT + toast.QUERY_TEXT, toast.HELP_TEXT);
        });

    },
    'OrderIntent': function () {
        const self = this;
        const intentObj = this.event.request.intent;
        const orderDate = intentObj.slots.Date.value;
        const queryDateString = orderDate.replace(/-/g, '');

        const queryDate = moment(orderDate);
        if (queryDate.isAfter(moment())) { // if date is after today.
            self.emit(":tell", "I don\'t know, I am not a wizard");
        }

        const requestUrl = api.getOrders(queryDateString);
        const tok = self.attributes['tok'];

        const promise = api.createPromise(requestUrl, "GET", tok, key.rguid);
        promise.then(function (res) {
            // console.log(`${requestUrl}: ${res}`);
            let numChecks = 0;
            co(function*() {
                let total = 0;
                // TODO: remove min orders here (just use res.length)
                const ordersLength = Math.min(res.length, 20);
                for (let i = 0; i < ordersLength; i++) {
                    const orderGuid = res[i];
                    const orderUrl = api.getOrderInfo(orderGuid);
                    const json = yield api.createPromise(orderUrl, "GET", tok, key.rguid);
                    // const json = JSON.parse(response);
                    for (let j in json.checks) {
                        const check = json.checks[j];
                        numChecks += 1;
                        total += check.totalAmount;
                    }
                }
                total = Math.round(total * 100) / 100;
                const orderDateString = moment(orderDate).format("dddd, MMMM Do YYYY");
                self.emit(':tell', `On ${orderDateString}, you had ${pl('order', ordersLength, true)} with ${pl('check', numChecks, true)} for a total of $${total}`);
                //, toast.QUERY_REPROMPT_TEXT);
            }).catch((err) => { // Catch any errors.
                console.error('error in co: ' + err);
                self.emit(':tell', "Error fetching order info: " + err);
            })
        }).catch(function (err) {
            // Orders API call failed...
            // console.error(err);
            self.emit(':tell', "Error getting orders: " + err)
        });

    },
    'TimeEntryIntent': function () {
        const self = this;
        const intentObj = this.event.request.intent;
        const entryDate = intentObj.slots.Date.value;

        const queryDate = moment(entryDate);
        if (queryDate.isAfter(moment())) { // if date is after today.
            self.emit(":tell", "I don\'t know, I am not a wizard");
        }

        // Query for a single day.
        const requestUrl = api.getTimeEntries(entryDate, entryDate);
        const tok = self.attributes['tok'];

        const entryDateString = moment(entryDate).format("dddd, MMMM Do YYYY");
        const promise = api.createPromise(requestUrl, "GET", tok, key.rguid);

        promise.then(function (res) {
            console.log(res);
            let totalOvertimeHours = 0;
            let avgHours = 0;
            let employees = new Set();
            for (let i in res) {
                const entry = res[i];
                avgHours += entry['regularHours'];
                employees.add(entry['employeeReference']['guid']);
                totalOvertimeHours += entry['overtimeHours'];
            }

            avgHours /= employees.size;

            // rounding (one decimal)
            avgHours = Math.round(avgHours * 10) / 10;
            totalOvertimeHours = Math.round(totalOvertimeHours * 10) / 10;
            if (employees.size > 0) {
                const entryInfoString = `On ${entryDateString}, you had ${pl('employee', employees.size, true)}` +
                    ` report ${totalOvertimeHours} overtime hours with an average of ${avgHours} regular hours each`;
                self.emit(':tell', entryInfoString);
            } else {
                const entryInfoString = `I could not find any reported time entry records for ${entryDateString}`;
                self.emit(':tell', entryInfoString);
            }
        }).catch(function (err) {
            console.error(err);
            self.emit(':tell', "Error getting timeEntries for date " + entryDateString + ", " + err)
        });
    },

    // ** AMAZON INTENTS BELOW ** //

    'AMAZON.HelpIntent': function () {
        this.emit(':ask', HELP_MESSAGE, HELP_MESSAGE);
    }
    ,
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', STOP_MESSAGE);
    }
    ,
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