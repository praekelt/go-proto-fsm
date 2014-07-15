describe('conversationLayout', function () {
    var layout;

    beforeEach(module('vumigo.services'));

    beforeEach(inject(function (conversationLayout, dragBehavior) {
        layout = conversationLayout();
    }));

    it('should compute conversation layout', inject(function () {
        var data = [{
            uuid: "conversation1",
            name: "Conversation 1",
            description: "Test conversation",
            endpoints: [{uuid: 'endpoint1', name: 'default'}],
            x: 100,
            y: 100
        }];

        layout(data);

        var expected = [{
            uuid: "conversation1",
            name: "Conversation 1",
            description: "Test conversation",
            endpoints: [{uuid: 'endpoint1', name: 'default'}],
            x: 100,
            y: 100,
            _layout: {
                inner: { r: 10 },
                outer: { r: 30 },
                name: { x: -35 },
                description: { x: -35 }
            }
        }];

        expect(data).to.deep.equal(expected);
    }));

});
