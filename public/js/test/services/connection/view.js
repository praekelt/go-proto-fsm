describe('channelComponent', function () {
    var element, layout, connection, data;

    beforeEach(module('uuid'));
    beforeEach(module('vumigo.services'));

    beforeEach(inject(function (channelComponent, channelLayout,
                                                conversationComponent, conversationLayout,
                                                connectionComponent, connectionLayout,
                                                dragBehavior) {

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

        expect(connections.eq(0).attr('d')).to.equal('M100,100L125,125L150,150L175,175L200,200');

        data.channels[0].x = 300;
        data.channels[0].y = 300;

        d3.selectAll(element.find('svg').toArray()).selectAll('.connection')
            .data(layout(data).routing_entries)
            .call(connection);

        expect(connections).to.have.length(1);
        expect(connections.eq(0).attr('d')).to.equal('M100,100L125,125L150,150L175,175L300,300');
    }));

});

describe('controlPointComponent', function () {
    var element, data;

    beforeEach(module('uuid'));
    beforeEach(module('vumigo.services'));

    beforeEach(inject(function (channelComponent, channelLayout,
                                                 conversationComponent, conversationLayout,
                                                 connectionComponent,  connectionLayout,
                                                 controlPointComponent, dragBehavior) {

        element = angular.element(
            '<div id="viewport" style="width: 20px; height: 20px">' +
                '<svg width="100" height="100"></svg>' +
            '</div>');

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

        // Configure behaviors
        var drag = dragBehavior()
            .canvasWidth(100)
            .canvasHeight(100)
            .gridCellSize(10)
            .call();

        var connectionDrag = dragBehavior()
            .dragEnabled(false)
            .drawBoundingBox(false)
            .canvasWidth(100)
            .canvasHeight(100)
            .gridCellSize(10)
            .call();

        var controlPointDrag = dragBehavior()
            .selectEnabled(false)
            .drawBoundingBox(false)
            .canvasWidth(100)
            .canvasHeight(100)
            .gridCellSize(10)
            .call();

        // Create canvas
        var svg = d3.selectAll(element.find('svg').toArray());

        // Draw channels
        var channel = channelComponent()
            .drag(drag);

        svg.selectAll('.channel')
            .data(channelLayout()(data))
            .call(channel);

        // Draw conversations
        var conversation = conversationComponent()
            .drag(drag);

        svg.selectAll('.conversation')
            .data(conversationLayout()(data))
            .call(conversation);

        // Draw connections
        connection = connectionComponent()
            .drag(connectionDrag);

        svg.selectAll('.connection')
            .data(connectionLayout()(data).routing_entries)
            .call(connection);

        // Draw control points
        angular.forEach(data.routing_entries, function (connection) {
            var controlPoint = controlPointComponent()
                .drag(controlPointDrag)
                .connectionId(connection.uuid);

            var selector = '.control-point[data-connection-uuid="'
                + connection.uuid + '"]';

            svg.selectAll(selector)
                .data(connection.points)
                .call(controlPoint);
        });
    }));

    it('should have drawn the control points', inject(function () {
        var controlPoints = element.find('.control-point');
        expect(controlPoints).to.have.length(5);
        expect(controlPoints.eq(0).find('circle').eq(0).attr('r')).to.equal('0');
        expect(controlPoints.eq(1).find('circle').eq(0).attr('r')).to.equal('5');
        expect(controlPoints.eq(2).find('circle').eq(0).attr('r')).to.equal('5');
        expect(controlPoints.eq(3).find('circle').eq(0).attr('r')).to.equal('5');
        expect(controlPoints.eq(4).find('circle').eq(0).attr('r')).to.equal('0');
    }));

    it('control points should be draggable', inject(function () {
        var controlPoints = element.find('.control-point');
        expect(controlPoints.eq(1).attr('transform')).to.equal('translate(125,125)');

        controlPoints.eq(1)
            .trigger('vumigo:dragstart')
            .trigger('vumigo:drag', {
                x: 10,
                y: 10
            })
            .trigger('vumigo:dragend');

        expect(controlPoints.eq(1).attr('transform')).to.equal('translate(10,10)');
    }));

});
