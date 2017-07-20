'use strict';
const library = (function () {

    const appName = 'Toast For Managers';

    function hello() {
        return 'hello';
    }

    return {
        APP_NAME: appName,
        hello: hello
    };

})();
module.exports = library;