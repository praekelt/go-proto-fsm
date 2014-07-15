describe('channelComponent', function () {
    var element, layout, connection, data;

    beforeEach(module('vumigo.services'));

    beforeEach(inject(function (channelComponent, channelLayout, conversationComponent, conversationLayout, connectionComponent, connectionLayout, dragBehavior) {
        element = angular.element(
            '<div id="viewport" style="width: 20px; height: 20px">' +
                '<svg width="100" height="100"></svg>' +
            '</div>');

        layout = connectionLayout();

        data = {
            conversations: [{
                uuid: 'conversation1',
                name: "Conversation 1",
                description: "",
                endpoints: [{uuid: 'endpoint1', name: 'default'}],
                colour: '#red',
                x: 100,
                y: 100
            }],
            channels: [{
                uuid: 'channel1',
                name: "Channel 1",
                description: "",
                endpoints: [{uuid: 'endpoint2', name: 'default'}],
                utilization: 0.4,
                x: 200,
                y: 200
            }],
            routers: [],
            routing_entries: [{
                source: {uuid: 'endpoint1'},
                target: {uuid: 'endpoint2'}
            }]
        };

        var drag = dragBehavior()
            .canvasWidth(100)
            .canvasHeight(100)
            .gridCellSize(10)
            .call();

        var svg = d3.selectAll(element.find('svg').toArray());

        var channel = channelComponent().drag(drag);

        svg.selectAll('.channel')
            .data(channelLayout()(data))
            .call(channel);

        var conversation = conversationComponent().drag(drag);

        svg.selectAll('.conversation')
            .data(conversationLayout()(data))
            .call(conversation);

        connection = connectionComponent();

        svg.selectAll('.connection')
            .data(layout(data).routing_entries)
            .call(connection);
    }));

    it('should have drawn the connection', inject(function () {
        var connections = element.find('.connection');
        expect(connections).to.have.length(1);

        expect(connections.eq(0).attr('d')).to.equal('M100,100L200,200');

        data.channels[0].x = 300;
        data.channels[0].y = 300;

        d3.selectAll(element.find('svg').toArray()).selectAll('.connection')
            .data(layout(data).routing_entries)
            .call(connection);

        expect(connections).to.have.length(1);
        expect(connections.eq(0).attr('d')).to.equal('M100,100L300,300');
    }));

});
