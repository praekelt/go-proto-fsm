describe('channelLayout', function () {
    var layout;

    beforeEach(module('uuid'));
    beforeEach(module('vumigo.services'));

    beforeEach(inject(function (channelLayout, dragBehavior) {
        layout = channelLayout();
    }));

    it('should compute channel layout', inject(function () {
        var data = [{
            uuid: "channel1",
            name: "Channel 1",
            description: "Test channel",
            endpoints: [{uuid: 'endpoint1', name: 'default'}],
            utilization: 0.5,
            x: 100,
            y: 100
        }];

        layout(data);

        var expected = [{
            uuid: "channel1",
            name: "Channel 1",
            description: "Test channel",
            endpoints: [{uuid: 'endpoint1', name: 'default'}],
            utilization: 0.5,
            x: 100,
            y: 100,
            _meta: {
                layout: {
                    inner: { r: 10 },
                    outer: { r: 60 },
                    name: { x: 25 },
                    description: { x: 25 }
                }
            }
        }];

        expect(data).to.deep.equal(expected);
    }));

});
