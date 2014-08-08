(function() {
    var injector = angular.injector(['vumigo.testutils']);

    injector
        .get('simulate')
        .enable();

    injector
        .get('interop')
        .enable();

    function rebind(target, source) {
        var args = [target, source].concat(d3.keys(source));
        return d3.rebind.apply(d3, args);
    }

    /**
     * Mimics the way d3 sets `d3.event`:
     * https://github.com/mbostock/d3/blob/master/src/event/event.js#L35-L46
     */
    function d3Event(target, name, data) {
        return $.Event(name, angular.extend({}, data || {}, {
            sourceEvent: d3.event,
            target: target
        }));
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

                    selection.each(function(d, i) {
                        $(this).on('vumigo:' + event, function(e, data) {
                            var oldEvent = d3.event;
                            d3.event = d3Event(this, event, data);
                            try { fn.call(this, d, i); }
                            finally { d3.event = oldEvent; }
                        });
                    });
                });

                return behavior.call(this, selection);
            }, behavior);

        }, type);
    }

    wrapBehavior('zoom', ['zoomstart', 'zoom', 'zoomend']);
    wrapBehavior('drag', ['dragstart', 'drag', 'dragend']);
})();
