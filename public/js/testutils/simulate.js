angular.module('vumigo.testutils').factory('simulate', [function () {
    /**
     * Mimics the way d3 sets `d3.event`:
     * https://github.com/mbostock/d3/blob/master/src/event/event.js#L35-L46
     */
    function d3Event(target, type, data) {
        return $.Event(type, angular.extend({}, data || {}, {
            sourceEvent: d3.event,
            target: target
        }));
    }

    function simulate(type, data) {
        var oldEvent = d3.event;

        this.each(function(d, i) {
            var listener = d3.select(this).on(type);
            if (!listener) return;

            d3.event = d3Event(this, type, data);
            listener.call(this, d, i);
        });

        d3.event = oldEvent;
        return this;
    }

    function enable() {
        d3.selection.prototype.simulate = simulate;
    }

    function disable() {
        delete d3.selection.prototype.simulate;
    }

    return {
        enable: enable,
        disable: disable
    };
}]);
