describe('channelComponent', function () {
    var element, channel, layout, data;

    beforeEach(module('uuid'));
    beforeEach(module('vumigo.services'));

    beforeEach(inject(function (channelComponent, channelLayout, dragBehavior) {
        element = angular.element(
            '<div id="viewport" style="width: 20px; height: 20px">' +
                '<svg width="100" height="100"></svg>' +
            '</div>');

        var drag = dragBehavior()
            .canvasWidth(100)
            .canvasHeight(100)
            .gridCellSize(10)
            .call();

        channel = channelComponent().drag(drag);
        layout = channelLayout();

        data = [{
            uuid: 'channel1',
            name: "Channel 1",
            description: "Test channel",
            endpoints: [{uuid: 'endpoint1', name: 'default'}],
            utilization: 0.4,
            x: 100,
            y: 100,
            _meta: {
                selected: true
            }
        }];

        d3.selectAll(element.find('svg').toArray()).selectAll('.channel')
            .data(layout(data))
            .call(channel);
    }));

    it('should have drawn the channel component', inject(function () {
        var channels = element.find('.channel');
        expect(channels).to.have.length(1);

        var channel = channels.eq(0);
        expect(channel.attr('transform')).to.equal('translate(100,100)');
        expect(channel.attr('class').indexOf('selected')).not.to.equal(-1);
        var r = data[0]._meta.layout.outer.r;
        expect(channel.find('.disc.outer').eq(0).attr('r')).to.equal(String(r));
        r = data[0]._meta.layout.inner.r;
        expect(channel.find('.disc.inner').eq(0).attr('r')).to.equal(String(r));

        var name = channel.find('.name').eq(0);
        expect(name.text()).to.equal('Channel 1');
        var x = data[0]._meta.layout.name.x;
        expect(name.attr('x')).to.equal(String(x));

        var description = channel.find('.description').eq(0);
        expect(description.text()).to.equal('Test channel');
        x = data[0]._meta.layout.description.x;
        expect(description.attr('x')).to.equal(String(x));
    }));

    it('should have drawn new channel component', inject(function () {
        var channels = element.find('.channel');
        expect(channels).to.have.length(1);

        data.push({
            uuid: "channel2",
            name: "Channel 2",
            description: "Another channel",
            endpoints: [{uuid: 'endpoint2', name: 'default'}],
            utilization: 0.7,
            x: 500,
            y: 500
        });

        d3.selectAll(element.find('svg').toArray()).selectAll('.channel')
            .data(layout(data))
            .call(channel);

        channels = element.find('.channel');
        expect(channels).to.have.length(2);
    }));

    it('should not have drawn any channel components', inject(function () {
        var channels = element.find('.channel');
        expect(channels).to.have.length(1);

        data.pop();

        d3.selectAll(element.find('svg').toArray()).selectAll('.channel')
            .data(layout(data))
            .call(channel);

        channels = element.find('.channel');
        expect(channels).to.have.length(0);
    }));

    it('channel should be draggable', inject(function () {
        var channels = element.find('.channel');
        channels.eq(0)
            .trigger('vumigo:dragstart')
            .trigger('vumigo:drag', {
                x: 70,
                y: 70
            })
            .trigger('vumigo:dragend');

        expect(channels.eq(0).attr('transform')).to.equal('translate(70,70)');
    }));

});
