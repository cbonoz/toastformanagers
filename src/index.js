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

const rsGuid = key.rsGuid;
let accessToken = "eyJhbGciOiJSUzI1NiJ9.eyJuYW1pbmdBdXRob3JpdHkiOiJDQk9OTyIsInJzR3VpZCI6ImQ5MTE4ODQ0LTY4YWYtNDQ2NC1hMjRjLTVlMjk5MWY3YjZhMyIsInNjb3BlIjpbIkNCT05PIl0sImV4cCI6MTUwMDU4NjA0MSwianRpIjoiMWU2YTdiOTYtOGY4Mi00ZDE3LTg5NGYtODdhYjYwMzM3YmQ5IiwiY2xpZW50X2lkIjoiY2Jvbm8tcGcifQ.kAKHmB35Lp0GLU7yR6in20sVicxXs2Gg8VpBZFfi2XbDsX-lO6Kld0T5zY3siDzBofpLnth8VpM7HgqnXp7_yVyU83gDMNxMCjlyNN5gjMu2MIhDmKIPP5vpnHlcptX_uaZ8Yg90pdvfIhbrhdH12FjFg2z-uQtL8ZkKjsslmxFLEWeXOnTBE74D9Vng95SHpaYoLiUz_LHQ0Ua3Qh-NLan-T2OUWL6vpYZUB1c3ZnR2izKNE6a6rc4h_mFDeZmzA2NpZJ6E8frAjgdN5UA9bxXZyusk6TDZ3KtGa_70beCgK6cBXevz9V39q_CluxgKfKFt-REcrJOaCn3VwG967g";

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
            accessToken = r.access_token;
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
        console.log('tok');
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
                    const json = yield api.createPromise(orderUrl, "GET", accessToken, key.rguid);
                    // const json = JSON.parse(response);
                    for (let j in json.checks) {
                        const check = json.checks[j];
                        numChecks += 1;
                        total += check.totalAmount;
                    }
                }
                total = Math.round(total * 100) / 100;
                const orderDateString = moment(orderDate).format("dddd, MMMM Do YYYY");
                self.emit(':tell', `On ${orderDateString}, you had ${pl('orders', ordersLength, true)} with ${pl('checks', numChecks, true)} for a total of $${total}`);
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
    // TODO: finish implementing employee information intent
    'EmployeeIntent': function () {
        const self = this;

        const requestUrl = api.getEmployees();
        const promise = api.createPromise(requestUrl, "GET", accessToken, key.rguid);
        promise.then(function (res) {
            console.log(`${requestUrl}: ${res}`);
        }).catch(function (err) {
            // API call failed...
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