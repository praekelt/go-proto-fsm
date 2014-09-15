describe('menuLayout', function () {
    var components, layout;

    beforeEach(module('vumigo.services'));
    beforeEach(module('uuid'));

    beforeEach(inject(function (Endpoint, Conversation, Channel, Router, Connection, Route,
                                conversationLayout, routerLayout, channelLayout,
                                connectionLayout, menuLayout) {

        var endpoint1 = new Endpoint({ id: 'endpoint1', name: 'default' });
        var endpoint2 = new Endpoint({ id: 'endpoint2', name: 'default' });
        var endpoint3 = new Endpoint({ id: 'endpoint3', name: 'default' });
        var endpoint4 = new Endpoint({ id: 'endpoint4', name: 'default' });
        var endpoint5 = new Endpoint({ id: 'endpoint5', name: 'default' });

        components = {
            'conversation1': new Conversation({
                id: 'conversation1',
                name: "Register",
                description: "4 Steps",
                endpoints: [endpoint1],
                colour: '#f82943',
                x: 220,
                y: 120
            }),
            'channel1': new Channel({
                id: 'channel1',
                name: "SMS",
                description: "082 335 29 24",
                endpoints: [endpoint2],
                utilization: 0.4,
                x: 840,
                y: 360
            }),
            'router1': new Router({
                id: 'router1',
                name: "K",
                description: "Keyword",
                endpoints: [endpoint3, endpoint4, endpoint5],
                x: 500,
                y: 220
            }),
            'connection1': new Connection({
                id: 'connection1',
                routes: [new Route({
                    source: endpoint1,
                    target: endpoint4
                })]
            })
        };

        _.forEach(components['connection1'].endpoints, function (endpoint) {
            endpoint.component = components['connection1'];
        });

        _.forEach(components['channel1'].endpoints, function (endpoint) {
            endpoint.component = components['channel1'];
        });

        _.forEach(components['router1'].endpoints, function (endpoint) {
            endpoint.component = components['router1'];
        });

        conversationLayout()([components['conversation1']]);
        routerLayout()([components['router1']]);
        channelLayout()([components['channel1']]);
        connectionLayout()([components['connection1']]);

        layout = menuLayout();
    }));

    it('should compute menu layout', inject(function () {
        layout(_.pluck(_.filter(components, 'menu'), 'menu'));

        var expected = {
            active: false,
            layout: {
                x: components['conversation1'].x,
                y: components['conversation1'].y + components['conversation1'].meta().layout.outer.r + 20
            }
        };

        expect(components['conversation1'].menu.meta()).to.deep.equal(expected);

        _.forEach(components['conversation1'].menu.items, function (item) {
            expected = { layout: { width: 32, height: 32, text: { x: 10, dy: 20 } } };
            expect(item.meta()).to.deep.equal(expected);
        });

        expected = {
            active: false,
            layout: {
                x: components['channel1'].x,
                y: components['channel1'].y + components['channel1'].meta().layout.outer.r + 20
            }
        };

        expect(components['channel1'].menu.meta()).to.deep.equal(expected);

        _.forEach(components['channel1'].menu.items, function (item) {
            expected = { layout: { width: 32, height: 32, text: { x: 10, dy: 20 } } };
            expect(item.meta()).to.deep.equal(expected);
        });

        expected = {
            active: false,
            layout: {
                x: components['router1'].x,
                y: components['router1'].y + components['router1'].meta().layout.r + 20
            }
        };

        expect(components['router1'].menu.meta()).to.deep.equal(expected);

        _.forEach(components['router1'].menu.items, function (item) {
            expected = { layout: { width: 32, height: 32, text: { x: 10, dy: 20 } } };
            expect(item.meta()).to.deep.equal(expected);
        });

        var point = components['connection1'].points[2];
        expected = {
            active: false,
            layout: {
                x: point.x,
                y: point.y + 20
            }
        };

        expect(components['connection1'].menu.meta()).to.deep.equal(expected);

        _.forEach(components['connection1'].menu.items, function (item) {
            expected = { layout: { width: 32, height: 32, text: { x: 10, dy: 20 } } };
            expect(item.meta()).to.deep.equal(expected);
        });
    }));

});
