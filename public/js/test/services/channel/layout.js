describe('channelLayout', function () {
    var layout;

    beforeEach(module('uuid'));
    beforeEach(module('vumigo.services'));

    beforeEach(inject(function (channelLayout) {
        layout = channelLayout();
    }));

    it('should compute channel layout', inject(function (Channel, Endpoint) {
        var channels = [new Channel({
            id: "channel1",
            name: "Channel 1",
            description: "Test channel",
            endpoints: [new Endpoint({ id: 'endpoint1', name: 'default' })],
            utilization: 0.5,
            x: 100,
            y: 100
        })];

        layout(channels);

        var expected = {
            layout: {
                inner: { r: 10 },
                outer: { r: 60 },
                name: { x: 25 },
                description: { x: 25 }
            }
        };

        expect(channels[0].meta()).to.deep.equal(expected);
    }));

});
