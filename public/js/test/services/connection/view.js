describe('connectionComponent', function () {
    var element, componentManager, connection;

    beforeEach(module('uuid'));
    beforeEach(module('vumigo.services'));

    beforeEach(inject(function (ComponentManager, dragBehavior, channelComponent,
                                conversationComponent, connectionComponent) {

        element = angular.element(
            '<div id="viewport" style="width: 20px; height: 20px">' +
                '<svg width="100" height="100"></svg>' +
            '</div>');

        componentManager = new ComponentManager({
            conversations: [{
                uuid: 'conversation1',
                name: "Conversation 1",
                description: "",
                endpoints: [{ uuid: 'endpoint1', name: 'default' }],
                colour: '#red',
                x: 100,
                y: 100
            }],
            channels: [{
                uuid: 'channel1',
                name: "Channel 1",
                description: "",
                endpoints: [{ uuid: 'endpoint2', name: 'default' }],
                utilization: 0.4,
                x: 200,
                y: 200
            }],
            routers: [],
            routing_entries: [{
                source: { uuid: 'endpoint1' },
                target: { uuid: 'endpoint2' }
            }]
        });

        var meta = componentManager.getConnections()[0].meta();
        meta.selected = true;

        var drag = dragBehavior()
            .canvasWidth(100)
            .canvasHeight(100)
            .gridCellSize(10)
            .call();

        var svg = d3.selectAll(element.find('svg').toArray());

        var connectionLayer = svg.append('g')
            .attr('class', 'layer connections');

        var componentLayer = svg.append('g')
            .attr('class', 'layer components');

        componentManager.layoutComponents();

        var conversation = conversationComponent()
            .drag(drag);

        componentLayer.selectAll('.conversation')
            .data(componentManager.getConversations())
            .call(conversation);

        var channel = channelComponent()
            .drag(drag);

        componentLayer.selectAll('.channel')
            .data(componentManager.getChannels())
            .call(channel);

        connection = connectionComponent();
        connectionLayer.selectAll('.connection')
            .data(componentManager.getConnections())
            .call(connection);
    }));

    it('should have drawn the connection', inject(function () {
        var connections = element.find('.layer.connections .connection');
        expect(connections).to.have.length(1);

        expect(connections.eq(0).attr('d')).to.equal('M100,100L200,200');
        expect(connections.eq(0).attr('class').indexOf('selected')).not.to.equal(-1);

        var component = componentManager.getComponent('channel1')
        component.x = 300;
        component.y = 300;

        componentManager.layoutComponents();

        d3.selectAll(element.find('svg').toArray()).selectAll('.connection')
            .data(componentManager.getConnections())
            .call(connection);

        expect(connections).to.have.length(1);
        expect(connections.eq(0).attr('d')).to.equal('M100,100L300,300');
    }));

});

describe('controlPointComponent', function () {
    var element, componentManager;

    beforeEach(module('uuid'));
    beforeEach(module('vumigo.services'));

    beforeEach(inject(function (ComponentManager, dragBehavior, channelComponent,
                                conversationComponent, connectionComponent,
                                controlPointComponent) {

        element = angular.element(
            '<div id="viewport" style="width: 20px; height: 20px">' +
                '<svg width="100" height="100"></svg>' +
            '</div>');

        componentManager = new ComponentManager({
            conversations: [{
                uuid: 'conversation1',
                name: "Conversation 1",
                description: "",
                endpoints: [{ uuid: 'endpoint1', name: 'default' }],
                colour: '#red',
                x: 100,
                y: 100
            }],
            channels: [{
                uuid: 'channel1',
                name: "Channel 1",
                description: "",
                endpoints: [{ uuid: 'endpoint2', name: 'default' }],
                utilization: 0.4,
                x: 200,
                y: 200
            }],
            routers: [],
            routing_entries: [{
                source: { uuid: 'endpoint1' },
                target: { uuid: 'endpoint2' }
            }]
        });

        // Configure behaviors
        var drag = dragBehavior()
            .canvasWidth(100)
            .canvasHeight(100)
            .gridCellSize(10)
            .call();

        var connectionDrag = dragBehavior()
            .dragEnabled(false)
            .canvasWidth(100)
            .canvasHeight(100)
            .gridCellSize(10)
            .call();

        var controlPointDrag = dragBehavior()
            .selectEnabled(false)
            .canvasWidth(100)
            .canvasHeight(100)
            .gridCellSize(10)
            .call();

        // Create canvas
        var svg = d3.selectAll(element.find('svg').toArray());

        // Layout components
        componentManager.layoutComponents();

        // Draw conversations
        var conversation = conversationComponent()
            .drag(drag);

        svg.selectAll('.conversation')
            .data(componentManager.getConversations())
            .call(conversation);

        // Draw channels
        var channel = channelComponent()
            .drag(drag);

        svg.selectAll('.channel')
            .data(componentManager.getChannels())
            .call(channel);

        // Draw connections
        connection = connectionComponent()
            .drag(connectionDrag);

        svg.selectAll('.connection')
            .data(componentManager.getConnections())
            .call(connection);

        // Draw control points
        var controlPoint = controlPointComponent()
            .drag(controlPointDrag);

        svg.selectAll('.control-point')
            .data(componentManager.getControlPoints())
            .call(controlPoint);
    }));

    it('should have drawn the control points', inject(function () {
        var controlPoints = element.find('.control-point');
        expect(controlPoints).to.have.length(2);
        expect(controlPoints.eq(0).find('circle').eq(0).attr('r')).to.equal('0');
        expect(controlPoints.eq(1).find('circle').eq(0).attr('r')).to.equal('0');
    }));

    it('control points should be draggable', inject(function () {
        var controlPoints = element.find('.control-point');
        expect(controlPoints.eq(1).attr('transform')).to.equal('translate(200,200)');

        controlPoints.eq(1)
            .d3()
            .simulate('dragstart')
            .simulate('drag', {
                x: 10,
                y: 10
            })
            .simulate('dragend');

        expect(controlPoints.eq(1).attr('transform')).to.equal('translate(10,10)');
    }));

});

describe('routeComponent', function () {
    var element, componentManager;

    beforeEach(module('uuid'));
    beforeEach(module('vumigo.services'));

    beforeEach(inject(function (ComponentManager, dragBehavior, channelComponent,
                                conversationComponent, connectionComponent,
                                controlPointComponent, routeComponent) {

        element = angular.element(
            '<div id="viewport" style="width: 20px; height: 20px">' +
                '<svg width="100" height="100"></svg>' +
            '</div>');

        componentManager = new ComponentManager({
            conversations: [{
                uuid: 'conversation1',
                name: "Conversation 1",
                description: "",
                endpoints: [{ uuid: 'endpoint1', name: 'default' }],
                colour: '#red',
                x: 100,
                y: 100
            }],
            channels: [{
                uuid: 'channel1',
                name: "Channel 1",
                description: "",
                endpoints: [{ uuid: 'endpoint2', name: 'default' }],
                utilization: 0.4,
                x: 200,
                y: 200
            }],
            routers: [],
            routing_entries: [{
                source: { uuid: 'endpoint1' },
                target: { uuid: 'endpoint2' }
            }, {
                source: { uuid: 'endpoint2' },
                target: { uuid: 'endpoint1' }
            }]
        });

        // Configure behaviors
        var drag = dragBehavior()
            .canvasWidth(100)
            .canvasHeight(100)
            .gridCellSize(10)
            .call();

        var connectionDrag = dragBehavior()
            .dragEnabled(false)
            .canvasWidth(100)
            .canvasHeight(100)
            .gridCellSize(10)
            .call();

        var controlPointDrag = dragBehavior()
            .selectEnabled(false)
            .canvasWidth(100)
            .canvasHeight(100)
            .gridCellSize(10)
            .call();

        // Create canvas
        var svg = d3.selectAll(element.find('svg').toArray());

        // Layout components
        componentManager.layoutComponents();

        // Draw conversations
        var conversation = conversationComponent()
            .drag(drag);

        svg.selectAll('.conversation')
            .data(componentManager.getConversations())
            .call(conversation);

        // Draw channels
        var channel = channelComponent()
            .drag(drag);

        svg.selectAll('.channel')
            .data(componentManager.getChannels())
            .call(channel);

        // Draw connections
        connection = connectionComponent()
            .drag(connectionDrag);

        svg.selectAll('.connection')
            .data(componentManager.getConnections())
            .call(connection);

        // Draw control points
        var controlPoint = controlPointComponent()
            .drag(controlPointDrag);

        svg.selectAll('.control-point')
            .data(componentManager.getControlPoints())
            .call(controlPoint);

        // Draw arrows
        var route = routeComponent();

        svg.selectAll('.arrow')
            .data(componentManager.getRoutes())
            .call(route);
    }));

    it('should have drawn the routes', inject(function () {
        var routes = element.find('.route');
        expect(routes).to.have.length(2);

        var datum = routes.get(0).__data__;
        var meta = datum._meta;
        expect(routes.eq(0).attr('transform')).to.equal('translate('
            + [meta.layout.arrow.x, meta.layout.arrow.y]
            + ')rotate(' + (meta.layout.arrow.angle - 90) + ')');

        datum = routes.get(1).__data__;
        meta = datum._meta;
        expect(routes.eq(1).attr('transform')).to.equal('translate('
            + [meta.layout.arrow.x, meta.layout.arrow.y]
            + ')rotate(' + (meta.layout.arrow.angle - 90) + ')');
    }));

    it('should rotate the arrow', inject(function () {
        element.find('.control-point').eq(1)
            .d3()
            .simulate('dragstart')
            .simulate('drag', {
                x: 300,
                y: 500
            })
            .simulate('dragend');

        var routes = element.find('.route');
        var datum = routes.get(0).__data__;
        var meta = datum._meta;
        expect(routes.eq(0).attr('transform')).to.equal('translate('
            + [meta.layout.arrow.x, meta.layout.arrow.y]
            + ')rotate(' + (meta.layout.arrow.angle - 90) + ')');
    }));

});
