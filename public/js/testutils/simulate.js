angular.module('vumigo.testutils').factory('simulate', [function () {
    var d3behaviour = d3.behavior;

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

    /**
     * We need a way to trigger behavior events manually in tests.
     * This lets us wrap a d3 behavior type (so it behaves as it
     * normally would), but also allows us to trigger the behavior's
     * events on jquery selections.
     */
    function wrapBehavior(name, events) {
        var type = d3.behavior[name];

        d3.behavior[name] = rebind(function() {
            var behavior = type.apply(this, arguments);

            return rebind(function(selection) {
                events.forEach(function(event) {
                    var fn = behavior.on(event);
                    fn = !(angular.isFunction(fn))
                        ? angular.noop
                        : fn;

                    selection.on(event, fn);
                });

                return behavior.call(this, selection);
            }, behavior);

        }, type);
    }


    function rebind(target, source) {
        var args = [target, source].concat(d3.keys(source));
        return d3.rebind.apply(d3, args);
    }


    function enable() {
        d3.selection.prototype.simulate = simulate;
        d3.behaviour = angular.copy(d3.behaviour);
        wrapBehavior('zoom', ['zoomstart', 'zoom', 'zoomend']);
        wrapBehavior('drag', ['dragstart', 'drag', 'dragend']);
    }

    function disable() {
        delete d3.selection.prototype.simulate;
        d3.behavior = d3behaviour;
    }

    return {
        enable: enable,
        disable: disable
    };
}]);
