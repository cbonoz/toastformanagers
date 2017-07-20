/**
 * Created by cbuonocore on 7/20/17.
 */
'use strict';
const library = (function () {

    const rp = require('request-promise');
    const util = require('util');

    const key = require('./key');

    const baseUrl = "https://ws-sandbox-api.eng.toasttab.com:443";
    const ordersBaseUrl = `${baseUrl}/orders/v2`;
    const laborBaseUrl = `${baseUrl}/labor/v1`;

    function getOrders(businessDate) {
        return `${ordersBaseUrl}/orders?businessDate=${businessDate}`;
    }

    function getOrderInfo(orderGuid) {
        return `${ordersBaseUrl}/orders/${orderGuid}`
    }

    function getEmployees() {
        return `${laborBaseUrl}/employees`;
    }

    function postAuthToken() {
        return "https://ws-sandbox-api.eng.toasttab.com:443/usermgmt/v1/oauth/token";
    }

    /*
     * url: request url
     * method: "GET", "POST", etc.
     * token: auth token retrieved from toast usermgmt
     * restaurantGuid: rsGuid retrieved from toast usermgmt
     */
    function createPromise(url, method, token, rguid) {
        console.log('rguid: ' + rguid);
        const options = {
            method: method,
            uri: url,
            headers: {
                'Toast-Restaurant-External-ID': rguid,
                // 'User-Agent': 'Request-Promise',
                'Authorization': util.format('Bearer %s', token)
            },

            json: true // Automatically parses the JSON string in the response
        };
        console.log('options: ' + JSON.stringify(options));

        return rp(options);
    }

    return {
        getOrders: getOrders,
        getOrderInfo: getOrderInfo,
        getEmployees: getEmployees,
        postAuthToken: postAuthToken,
        createPromise: createPromise,
    };

})();
module.exports = library;
