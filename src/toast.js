'use strict';
const library = (function () {

    const appName = 'Toast For Managers';
    const WELCOME_TEXT = 'Welcome to ' + appName + ". ";
    const QUERY_REPROMPT_TEXT = 'What next? ';
    const QUERY_TEXT = 'You can ask me about your orders or time entries on a given day. ';
    const HELP_TEXT = 'You can say something like: "What were my sales yesterday?" ';

    function hello() {
        return 'hello';
    }

    return {
        APP_NAME: appName,
        WELCOME_TEXT: WELCOME_TEXT,
        QUERY_REPROMPT_TEXT: QUERY_REPROMPT_TEXT,
        QUERY_TEXT: QUERY_TEXT,
        HELP_TEXT: HELP_TEXT,
        hello: hello
    };

})();
module.exports = library;