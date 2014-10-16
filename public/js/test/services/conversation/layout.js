describe('conversationLayout', function () {
    var data, manager, layout;

    beforeEach(module('vumigo.services'));
    beforeEach(module('uuid'));

    beforeEach(inject(function (ComponentManager, conversationLayout, dragBehavior) {
        data = {
            routing_table: {
                version: 'fsm-0.1',
                campaign_id: 'campaign1',
                components: {
                    'conversation1': {
                        type: 'conversation',
                        conversation_type: 'bulk-message',
                        uuid: 'conversation1',
                        name: "Conversation 1",
                        description: "Test conversation",
                        endpoints: {
                            'endpoint1': {
                                type: 'conversation_endpoint',
                                uuid: 'endpoint1',
                                name: 'default'
                            }
                        }
                    }
                },
                routing: {},
            },
            layout: {
                version: 'fsm-ui-0.1',
                components: {
                    'conversation1': {
                        x: 100,
                        y: 100,
                        colour: '#cccccc'
                    }
                },
                routing: {},
                connections: {}
            }
        };

        manager = new ComponentManager(data);

        layout = conversationLayout();
    }));

    it('should compute conversation layout', inject(function (Conversation, Endpoint) {
        var conversations = manager.findComponents({ type: 'conversation' });

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
