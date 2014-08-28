describe('conversationLayout', function () {
    var layout;

    beforeEach(module('vumigo.services'));
    beforeEach(module('uuid'));

    beforeEach(inject(function (conversationLayout, dragBehavior) {
        layout = conversationLayout();
    }));

    it('should compute conversation layout', inject(function (Conversation, Endpoint) {
        var conversations = [new Conversation({
            id: "conversation1",
            name: "Conversation 1",
            description: "Test conversation",
            endpoints: [new Endpoint({ id: 'endpoint1', name: 'default' })],
            x: 100,
            y: 100
        })];

        layout(conversations);

        var expected = {
            layout: {
                inner: { r: 10 },
                outer: { r: 30 },
                name: { x: -35 },
                description: { x: -35 }
            }
        };

        expect(conversations[0].meta()).to.deep.equal(expected);
    }));

});
