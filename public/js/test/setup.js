(function() {
    var injector = angular.injector(['vumigo.testutils']);

    injector
        .get('simulate')
        .enable();

    injector
        .get('interop')
        .enable();
})();
