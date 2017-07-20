/**
 * Created by cbuonocore on 6/24/17.
 */

authToken = "eyJhbGciOiJSUzI1NiJ9.eyJuYW1pbmdBdXRob3JpdHkiOiJDQk9OTyIsInJzR3VpZCI6ImQ5MTE4ODQ0LTY4YWYtNDQ2NC1hMjRjLTVlMjk5MWY3YjZhMyIsInNjb3BlIjpbIkNCT05PIl0sImV4cCI6MTUwMDU4MDczNSwianRpIjoiMDc0OTQ3OTAtMDdjMS00OWFkLWIwZjMtZTRlNmU4MzIxNWRiIiwiY2xpZW50X2lkIjoiY2Jvbm8tcGcifQ.H3fTrY5Auvs0ys87cgSET-6rR3MgaoJDS0SSkjdwRS6ZBnMCNaooD1y7UYqZX20mm0bEPJPn9NZXgno8HsLkcoTg_n2U5v90GkE7XJ685zrRp3irdwTJgzgJFdJqJL97qjDnnp_hpqBoYbgXrPX9lRIPl-6GSOzVfcTM-JgAblX73mB0gqmdGmrY4cYkM9W1qOZJwOmYCyb9DNY4Nzhwg-Xlo23v4j_n3h9rRSUxGVl8FNj2xXvTMOxxejT5s9sOPCdOIFgc4wktuaguNh0ZC7iuDW6QmH-5cg_DfhDWoycD7dvHYaKfLrssjm8mJhl-xFJdI7Sh3sECrFlJ3fIEwA";
rsGuid = "e3d261cc-0093-44ac-a760-baccbb85fd3d";
exampleOrder = "426a49ae-f3f7-48e8-a785-30790e51a62f";

const request = require('request');
const co = require('co');

// User libraries.
const toast = require('./toast');
const key = require('./key');
const api = require('./api');

const dateString = "2017-07-17";
const orderDate = "20170717";

// const requestUrl = api.getEmployees();
const requestUrl = api.getOrders(orderDate);
const promise = api.createPromise(requestUrl, "GET", authToken, rsGuid);

// console.log('promise: ' + JSON.stringify(promise));
// promise.then(function (res) {
//     const response = JSON.stringify(res);
//     console.log(response);
//     const r = JSON.parse(response);
//     // console.log(`${requestUrl}: ${response}`);
// }).catch(function (err) {
//     console.error(err);
//     // API call failed...
// });
//
// request.post({url: api.postAuthToken(), form: key.getPostAuthTokenBody()}, (err, res, body) => {
//     if (err) {
//         console.log('err getting auth token: ' + err);
//         console.log(':tell', err);
//     }
//     console.log("auth response body: " + body);
//     const r = JSON.parse(body);
//     authToken = r.access_token;
//     rsGuid = r.rsGuid;
//     console.log(authToken, rsGuid)
// });


promise.then(function (res) {
        console.log(`${requestUrl}: ${res}`);
        let numChecks = 0;
        co(function*() {
            let total = 0;
            const arrayLength = Math.min(res.length, 20)
            for (let i = 0; i < arrayLength; i++) {
                const orderGuid = res[i];
                const orderUrl = api.getOrderInfo(orderGuid);
                const json = yield api.createPromise(orderUrl, "GET", authToken, rsGuid);
                // const json = JSON.parse(response);
                for (let j in json.checks) {
                    const check = json.checks[j];
                    numChecks += 1;
                    total += check.totalAmount;
                }
            }
            total = Math.round(total * 100) / 100;
            console.log(':ask', `For ${orderDate}, you had ${res.length} orders with ${numChecks} checks totaling $${total}`, toast.QUERY_REPROMPT_TEXT);
        }).catch((err) => { // Catch any errors.
            console.log('error in co: ' + err);
        })
    }
).catch(function (err) {
    // Orders API call failed...
    console.log(':tell', err)
});
