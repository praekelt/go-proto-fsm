describe('channelComponent', function () {
    var element, componentManager, channel, layout;

    beforeEach(module('uuid'));
    beforeEach(module('vumigo.services'));

    beforeEach(inject(function (ComponentManager, channelComponent, dragBehavior) {
        element = angular.element(
            '<div id="viewport" style="width: 20px; height: 20px">' +
                '<svg width="100" height="100"></svg>' +
            '</div>');

        componentManager = new ComponentManager({
            channels: [{
                uuid: 'channel1',
                name: "Channel 1",
                description: "Test channel",
                endpoints: [{ uuid: 'endpoint1', name: 'default' }],
                utilization: 0.4,
                x: 100,
                y: 100
            }]
        });

        var drag = dragBehavior()
            .canvasWidth(100)
            .canvasHeight(100)
            .gridCellSize(10)
            .call();

        channel = channelComponent()
            .drag(drag);

        componentManager.layoutComponents();

        var meta = componentManager.getComponent('channel1').meta();
        meta.selected = true;

        d3.selectAll(element.find('svg').toArray()).selectAll('.channel')
            .data(componentManager.getChannels())
            .call(channel);
    }));

    it('should have drawn the channel component', inject(function () {
        var channels = element.find('.channel');
        expect(channels).to.have.length(1);

        var channel = channels.eq(0);
        expect(channel.attr('transform')).to.equal('translate(100,100)');
        expect(channel.attr('class').indexOf('selected')).not.to.equal(-1);
        var meta = componentManager.getComponent('channel1').meta();
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

        componentManager.load({
            channels: [{
                uuid: "channel2",
                name: "Channel 2",
                description: "Another channel",
                endpoints: [{ uuid: 'endpoint2', name: 'default' }],
                utilization: 0.7,
                x: 500,
                y: 500
            }]
        });

        componentManager.layoutComponents();

        d3.selectAll(element.find('svg').toArray()).selectAll('.channel')
            .data(componentManager.getChannels())
            .call(channel);

        channels = element.find('.channel');
        expect(channels).to.have.length(2);
    }));

    it('should not have drawn any channel components', inject(function () {
        var channels = element.find('.channel');
        expect(channels).to.have.length(1);

        componentManager.reset();

        d3.selectAll(element.find('svg').toArray()).selectAll('.channel')
            .data(componentManager.getChannels())
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
