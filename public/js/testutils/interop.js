angular.module('vumigo.testutils').factory('interop', [function () {
    function $d3() {
        return d3.selectAll(this.toArray());
    }

    function enable() {
        $.fn.d3 = $d3;
    }

    function disable() {
        delete $.fn.d3;
    }

    return {
        enable: enable,
        disable: disable
    };
}]);
