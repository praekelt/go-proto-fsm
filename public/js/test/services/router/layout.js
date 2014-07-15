describe('routerLayout', function () {
    var layout;

    beforeEach(module('vumigo.services'));

    beforeEach(inject(function (routerLayout, dragBehavior) {
        layout = routerLayout();
    }));

    it('should compute router layout', inject(function () {
        var data = [{
            uuid: "router1",
            name: "A",
            description: "Keyword",
            channel_endpoints: [{uuid: 'endpoint1', name: 'default'}],
            conversation_endpoints: [{uuid: 'endpoint2', name: 'default'}],
            x: 100,
            y: 100
        }];

        layout(data);

        var size = Math.max(layout.minSize(),
            data[0].conversation_endpoints.length * layout.pinGap());

        var radius = Math.sqrt(2.0 * Math.pow(size, 2)) / 2.0;

        var expected = [{
            uuid: "router1",
            name: "A",
            description: "Keyword",
            channel_endpoints: [{uuid: 'endpoint1', name: 'default'}],
            conversation_endpoints: [{
                uuid: 'endpoint2',
                name: 'default',
                _layout: { len: radius, y: -20, r: 5 }
            }],
            x: 100,
            y: 100,
            _layout: { r: radius }
        }];

        expect(data).to.deep.equal(expected);
    }));

});
