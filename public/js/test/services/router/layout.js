describe('routerLayout', function () {
    var layout;

    beforeEach(module('vumigo.services'));
    beforeEach(module('uuid'));

    beforeEach(inject(function (routerLayout) {
        layout = routerLayout();
    }));

    it('should compute router layout', inject(function (Router, Endpoint) {
        var routers = [new Router({
            id: "router1",
            name: "A",
            description: "Keyword",
            endpoints: [
                new Endpoint({ id: 'endpoint1', name: 'default', accepts: ['channel'] }),
                new Endpoint({ id: 'endpoint2', name: 'default', accepts: ['conversation'] })
            ],
            x: 100,
            y: 100
        })];

        layout(routers);

        var size = Math.max(layout.minSize(),
            routers[0].getEndpoints('conversation').length * layout.pinGap());

        var radius = Math.sqrt(2.0 * Math.pow(size, 2)) / 2.0;

        var expected = {
            layout: { r: radius }
        };

        expect(routers[0].meta()).to.deep.equal(expected);

        expected = [{
            layout: {
                x: radius,
                y: 0,
                r: 8,
                name: { x: 10 }
            }
        }, {
            layout: {
                len: radius,
                y: -20,
                r: 8,
                name: { x: -10 }
            }
        }];

        var actual = [
            routers[0].endpoints[0].meta(),
            routers[0].endpoints[1].meta()
        ];

        expect(actual).to.deep.equal(expected);
    }));
});
