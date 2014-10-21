describe('conversationComponent', function () {
    var element, data, componentManager, conversation;

    beforeEach(module('uuid'));
    beforeEach(module('vumigo.services'));

    beforeEach(inject(function (ComponentManager, conversationComponent, dragBehavior) {
        element = angular.element(
            '<div id="viewport" style="width: 20px; height: 20px">' +
                '<svg width="100" height="100"></svg>' +
            '</div>');

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
                        x: 50,
                        y: 50,
                        colour: '#cccccc'
                    }
                },
                routing: {},
                connections: {}
            }
        };

        componentManager = new ComponentManager(data);

        var drag = dragBehavior()
            .canvasWidth(100)
            .canvasHeight(100)
            .gridCellSize(10)
            .call();

        conversation = conversationComponent()
            .drag(drag);

        componentManager.layoutComponents();

        var meta = componentManager.getComponentById('conversation1').meta();
        meta.selected = true;

        d3.selectAll(element.find('svg').toArray()).selectAll('.conversation')
            .data(componentManager.findComponents({ type: 'conversation' }))
            .call(conversation);
    }));

    it('should have drawn the conversation component', inject(function () {
        var conversations = element.find('.conversation');
        expect(conversations).to.have.length(1);

        var conversation = conversations.eq(0);
        expect(conversation.attr('transform')).to.equal('translate(50,50)');
        expect(conversation.attr('class').indexOf('selected')).not.to.equal(-1);

        var disc = conversation.find('.disc.outer').eq(0);
        var meta = componentManager.getComponentById('conversation1').meta();
        var r = meta.layout.outer.r;
        expect(disc.attr('r')).to.equal(String(r));
        expect(d3.rgb(disc.css('fill'))).to.deep.equal(d3.rgb(204, 204, 204));

        r = meta.layout.inner.r;
        expect(conversation.find('.disc.inner').eq(0).attr('r')).to.equal(String(r));

        var name = conversation.find('.name').eq(0);
        expect(name.text()).to.equal('Conversation 1');
        var x = meta.layout.name.x;
        expect(name.attr('x')).to.equal(String(x));

        var description = conversation.find('.description').eq(0);
        expect(description.text()).to.equal('Test conversation');
        x = meta.layout.description.x;
        expect(description.attr('x')).to.equal(String(x));
    }));

    it('should have drawn new conversation components', inject(function () {
        var conversations = element.find('.conversation');
        expect(conversations).to.have.length(1);

        data.routing_table.components["conversation2"] = {
            type: 'conversation',
            conversation_type: 'bulk-message',
            uuid: 'conversation2',
            name: "Conversation 2",
            description: "Another conversation",
            endpoints: {
                'endpoint2': {
                    type: 'conversation_endpoint',
                    uuid: 'endpoint2',
                    name: 'default'
                }
            }
        };

        data.layout.components["conversation2"] = {
            colour: '#e32',
            x: 100,
            y: 100
        };

        componentManager.createComponent({
            id: "conversation2",
            type: 'conversation'
        });

        componentManager.layoutComponents();

        d3.selectAll(element.find('svg').toArray()).selectAll('.conversation')
            .data(componentManager.findComponents({ type: 'conversation' }))
            .call(conversation);

        conversations = element.find('.conversation');
        expect(conversations).to.have.length(2);
    }));

    it('should not have drawn any conversation components', inject(function () {
        var conversations = element.find('.conversation');
        expect(conversations).to.have.length(1);

        componentManager.reset();

        d3.selectAll(element.find('svg').toArray()).selectAll('.conversation')
            .data(componentManager.findComponents({ type: 'conversation' }))
            .call(conversation);

        conversations = element.find('.conversation');
        expect(conversations).to.have.length(0);
    }));

    it('conversation should be draggable', inject(function () {
        var conversations = element.find('.conversation');
        conversations.eq(0)
            .d3()
            .simulate('dragstart')
            .simulate('drag', {
                x: 70,
                y: 70
            })
            .simulate('dragend');

        expect(conversations.eq(0).attr('transform')).to.equal('translate(70,70)');
    }));

});
