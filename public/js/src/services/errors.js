angular.module('vumigo.services').factory('GoError', [
    function () {

        function GoError(message) {
            BaseComponent.call(this, message);
            Error.captureStackTrace(this, GoError);
        }

        GoError.prototype = Object.create(Error.prototype);

        return GoError;
    }
]);
