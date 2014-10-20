angular.module('vumigo.services').factory('GoError', [
    function () {

        function GoError(message) {
            Error.call(this);
            Error.captureStackTrace(this, GoError);
            this.message = message;
        }

        GoError.prototype = Object.create(Error.prototype);

        return GoError;
    }
]);
