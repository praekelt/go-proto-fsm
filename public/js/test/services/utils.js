describe('svgToolbox', function () {
    beforeEach(module('vumigo.services'));

    it('selectOrAppend should create new element', inject(function (svgToolbox) {
        var element = angular.element('<svg></svg>');
        var selection = d3.selectAll(element.toArray());
        var g = svgToolbox.selectOrAppend(selection, 'g');
        expect(element.find('g')).to.have.length(1);
    }));

    it('selectOrAppend should return existing element', inject(function (svgToolbox) {
        var element = angular.element('<svg><g></g></svg>');
        var selection = d3.selectAll(element.toArray());
        var g = svgToolbox.selectOrAppend(selection, 'g');
        expect(element.find('g')).to.have.length(1);
    }));

    it('createShadowFilter should create SVG filter', inject(function (svgToolbox) {
        var element = angular.element('<svg></svg>');
        var selection = d3.selectAll(element.toArray());
        svgToolbox.createShadowFilter(selection);
        expect(element.find('filter#shadow')).to.have.length(1);
    }));

    it('createShadowFilter should create SVG filter only once', inject(function (svgToolbox) {
        var element = angular.element('<svg></svg>');
        var selection = d3.selectAll(element.toArray());
        svgToolbox.createShadowFilter(selection);
        svgToolbox.createShadowFilter(selection);
        expect(element.find('filter#shadow')).to.have.length(1);
    }));

    it('drawGrid should draw a grid', inject(function (svgToolbox) {
        var element = angular.element('<svg></svg>');
        var selection = d3.selectAll(element.toArray());
        svgToolbox.drawGrid(selection, 100, 100, 10);
        expect(element.find('g.x.axis > line')).to.have.length(10);
        expect(element.find('g.y.axis > line')).to.have.length(10);
    }));

});

describe('canvasBuilder', function () {
    var element;

    beforeEach(module('vumigo.services'));

    beforeEach(inject(function (canvasBuilder) {
        element = angular.element(
            '<div id="viewport" style="width: 20px; height: 20px">' +
                '<svg width="100" height="100"></svg>' +
            '</div>');

        canvasBuilder()
            .width(100)
            .height(100)
            .gridCellSize(10)
            .apply(null, [d3.selectAll(element.find('svg').toArray())]);
    }));

    it('should create canvas', inject(function () {
        expect(element.find('g.canvas')).to.have.length(1);
    }));

    it('should allow canvas to be draggable', inject(function () {
        element.find('g.container')
            .trigger('vumigo:zoomstart')
            .trigger('vumigo:zoom', {
                translate: [-50, -50],
                scale: 1
            })
            .trigger('vumigo:zoomend');

        var canvas = element.find('g.canvas');
        expect(canvas.eq(0).attr('transform')).to.equal('translate(-50,-50)scale(1)');
    }));

    it('should allow canvas to be zoomable', inject(function () {
        var canvas = element.find('g.canvas');
        expect(canvas.attr('transform')).to.be.undefined;

        canvas
            .trigger('vumigo:zoomstart')
            .trigger('vumigo:zoom', {
                translate: [0, 0],
                scale: 3
            })
            .trigger('vumigo:zoomend');

        expect(canvas.attr('transform')).to.equal('translate(0,0)scale(3)');
    }));
});

describe('componentHelper', function () {
    var data;

    beforeEach(module('vumigo.services'));

    beforeEach(function () {
        data = {
            conversations: [{
                uuid: 'conversation1',
                name: "Conversation 1",
                description: "",
                endpoints: [{uuid: 'endpoint1', name: 'default'}],
                colour: '#000000',
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
            routers: [{
                uuid: 'router1',
                name: "Keyword",
                description: "",
                conversation_endpoints: [{uuid: 'endpoint3', name: 'default'}],
                channel_endpoints: [{uuid: 'endpoint4', name: 'default'}],
                x: 300,
                y: 300
            }],
            routing_entries: []
        };
    });

    it('should find components by id', inject(function (componentHelper) {
        var conversation = componentHelper.getById(data, 'conversation1');
        expect(conversation.type).to.equal('conversation');
        expect(conversation.data.uuid).to.equal('conversation1');

        var channel = componentHelper.getById(data, 'channel1');
        expect(channel.type).to.equal('channel');
        expect(channel.data.uuid).to.equal('channel1');

        var router = componentHelper.getById(data, 'router1');
        expect(router.type).to.equal('router');
        expect(router.data.uuid).to.equal('router1');
    }));

    it('should find components by endpoint id', inject(function (componentHelper) {
        var conversation = componentHelper.getByEndpointId(data, 'endpoint1');
        expect(conversation.type).to.equal('conversation');
        expect(conversation.data.uuid).to.equal('conversation1');

        var channel = componentHelper.getByEndpointId(data, 'endpoint2');
        expect(channel.type).to.equal('channel');
        expect(channel.data.uuid).to.equal('channel1');

        var router = componentHelper.getByEndpointId(data, 'endpoint3');
        expect(router.type).to.equal('router');
        expect(router.data.uuid).to.equal('router1');
    }));

    it('should connect components', inject(function (componentHelper) {
        componentHelper.connectComponents(data, 'conversation1', 'router1');
        componentHelper.connectComponents(data, 'router1', 'channel1');

        expect(data.routing_entries).to.deep.equal([
            {source: {uuid: 'endpoint1'}, target: {uuid: 'endpoint3'}},
            {source: {uuid: 'endpoint4'}, target: {uuid: 'endpoint2'}},
        ]);
    }));

    it('should not connect components to themselves', inject(function (componentHelper) {
        componentHelper.connectComponents(data, 'conversation1', 'conversation1');
        componentHelper.connectComponents(data, 'channel1', 'channel1');
        componentHelper.connectComponents(data, 'router1', 'router1');

        expect(data.routing_entries).to.deep.equal([]);
    }));

});