(function() {
    function rebind(target, source) {
        var args = [target, source].concat(d3.keys(source));
        return d3.rebind.apply(d3, args);
    }

    /**
     * Mimics the way d3 sets `d3.event`:
     * https://github.com/mbostock/d3/blob/master/src/event/event.js#L35-L46
     */
    function d3Event(target, name, data) {
        data = angular.extend({}, data || {});
        data.type = name;
        data.sourceEvent = d3.event;
        data.target = target;
        return data;
    }

    /**
     * We need a way to trigger behavior events manually in tests.
     * This lets us wrap a d3 behavior type (so it behaves as it
     * normally would), but also allows us to trigger the behavior's
     * events on jquery selections.
     */
    function wrapBehavior(behaviorName, events) {
        var behaviorType = d3.behavior[behaviorName];

        d3.behavior[behaviorName] = rebind(function() {
            var behavior = behaviorType();

            return rebind(function(selection) {
                events.forEach(function(event) {
                    var fn = behavior.on(event);
                    fn = !(angular.isFunction(fn))
                        ? angular.noop
                        : fn;

                    $(selection.node()).on('vumigo:' + event, function(e, data) {
                        var oldEvent = d3.event;

                        selection.each(function() {
                            d3.event = d3Event(this, event, data);
                            try { fn.apply(this, arguments); }
                            finally { d3.event = oldEvent; }
                        });
                    });
                });

                return behavior.call(this, selection);
            }, behavior);

        }, behaviorType);
    }

    wrapBehavior('zoom', ['zoomstart', 'zoom', 'zoomend']);
    wrapBehavior('drag', ['dragstart', 'drag', 'dragend']);
})();
