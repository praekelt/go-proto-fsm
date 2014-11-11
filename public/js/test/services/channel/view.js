describe('channelComponent', function () {
    var element, data, componentManager, channel, layout;

    beforeEach(module('uuid'));
    beforeEach(module('vumigo.services'));

    beforeEach(inject(function (ComponentManager, channelComponent, dragBehavior) {
        element = angular.element(
            '<div id="viewport" style="width: 20px; height: 20px">' +
                '<svg width="100" height="100"></svg>' +
            '</div>');

        data = {
            routing_table: {
                version: 'fsm-0.1',
                campaign_id: 'campaign1',
                components: {
                    'channel1': {
                        type: 'channel',
                        uuid: 'channel1',
                        name: "Channel 1",
                        description: "Test channel",
                        utilization: 0.4,
                        endpoints: {
                            'endpoint1': {
                                type: 'channel_endpoint',
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
                    'channel1': {
                        x: 100,
                        y: 100
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

        channel = channelComponent()
            .drag(drag);

        componentManager.layoutComponents();

        var meta = componentManager.getComponentById('channel1').meta();
        meta.selected = true;

        d3.selectAll(element.find('svg').toArray()).selectAll('.channel')
            .data(componentManager.findComponents({ type: 'channel' }))
            .call(channel);
    }));

    it('should have drawn the channel component', inject(function () {
        var channels = element.find('.channel');
        expect(channels).to.have.length(1);

        var channel = channels.eq(0);
        expect(channel.attr('transform')).to.equal('translate(100,100)');
        expect(channel.attr('class').indexOf('selected')).not.to.equal(-1);
        var meta = componentManager.getComponentById('channel1').meta();
        var r = meta.layout.outer.r;
        expect(channel.find('.disc.outer').eq(0).attr('r')).to.equal(String(r));
        r = meta.layout.inner.r;
        expect(channel.find('.disc.inner').eq(0).attr('r')).to.equal(String(r));

        var name = channel.find('.name').eq(0);
        expect(name.text()).to.equal('Channel 1');
        var x = meta.layout.name.x;
        expect(name.attr('x')).to.equal(String(x));

        var description = channel.find('.description').eq(0);
        expect(description.text()).to.equal('Test channel');
        x = meta.layout.description.x;
        expect(description.attr('x')).to.equal(String(x));
    }));

    it('should have drawn new channel component', inject(function () {
        var channels = element.find('.channel');
        expect(channels).to.have.length(1);

        data.routing_table.components["channel2"] = {
            type: 'channel',
            uuid: 'channel2',
            name: "Channel 2",
            description: "Another channel",
            utilization: 0.7,
            endpoints: {
                'endpoint2': {
                    type: 'channel_endpoint',
                    uuid: 'endpoint2',
                    name: 'default'
                }
            }
        };

        data.layout.components["channel2"] = {
            x: 500,
            y: 500
        };

        componentManager.createComponent({
            id: "channel2",
            type: 'channel'
        });

        componentManager.layoutComponents();

        d3.selectAll(element.find('svg').toArray()).selectAll('.channel')
            .data(componentManager.findComponents({ type: 'channel' }))
            .call(channel);

        channels = element.find('.channel');
        expect(channels).to.have.length(2);
    }));

    it('should not have drawn any channel components', inject(function () {
        var channels = element.find('.channel');
        expect(channels).to.have.length(1);

        componentManager.reset();

        d3.selectAll(element.find('svg').toArray()).selectAll('.channel')
            .data(componentManager.findComponents({ type: 'channel' }))
            .call(channel);

        channels = element.find('.channel');
        expect(channels).to.have.length(0);
    }));

    it('channel should be draggable', inject(function () {
        var channels = element.find('.channel');
        channels.eq(0)
            .d3()
            .simulate('dragstart')
            .simulate('drag', {
                x: 70,
                y: 70
            })
            .simulate('dragend');

        expect(channels.eq(0).attr('transform')).to.equal('translate(70,70)');
    }));

});
