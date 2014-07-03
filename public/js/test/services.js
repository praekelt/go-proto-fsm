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

describe('zoomBehavior', function () {
    var element;

    beforeEach(module('vumigo.services'));

    beforeEach(inject(function (zoomBehavior) {
        element = angular.element(
            '<div id="viewport" style="width: 20px; height: 20px">' +
                '<svg width="100" height="100"></svg>' +
            '</div>');

        var svg = d3.selectAll(element.find('svg').toArray());

        var container = svg.append('g')
            .attr('class', 'container')
            .attr('transform', 'translate(0, 0)');

        var canvas = container.append('g')
            .attr('class', 'canvas');

        var zoom = zoomBehavior()
            .canvas(canvas)
            .canvasWidth(100)
            .canvasHeight(100)
            .viewportElement(element)
            .call();

        container.call(zoom);
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

    it('should not allow canvas to be dragged beyond viewport', inject(function () {
        var container = element.find('g.container');
        var canvas = element.find('g.canvas');

        container
            .trigger('vumigo:zoomstart')
            .trigger('vumigo:zoom', {
                translate: [10, 10],
                scale: 1
            })
            .trigger('vumigo:zoomend');

        expect(canvas.eq(0).attr('transform')).to.equal('translate(0,0)scale(1)');

        container
            .trigger('vumigo:zoomstart')
            .trigger('vumigo:zoom', {
                translate: [-100, -100],
                scale: 1
            })
            .trigger('vumigo:zoomend');

        expect(canvas.eq(0).attr('transform')).to.equal('translate(-80,-80)scale(1)');
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

describe('dragBehavior', function () {
    var element;

    beforeEach(module('vumigo.services'));

    beforeEach(inject(function (dragBehavior) {
        element = angular.element(
            '<div id="viewport" style="width: 20px; height: 20px">' +
                '<svg width="100" height="100"></svg>' +
            '</div>');

        var svg = d3.selectAll(element.find('svg').toArray());

        var container = svg.append('g')
            .attr('class', 'container')
            .attr('transform', 'translate(0, 0)');

        var canvas = container.append('g')
            .attr('class', 'canvas');

        var drag = dragBehavior()
            .canvasWidth(100)
            .canvasHeight(100)
            .gridCellSize(10)
            .call();

        canvas.selectAll('.component')
            .data([{x: 0, y: 0}])
            .enter().append('g')
                .attr('class', 'component')
                .attr('transform', 'translate(0,0)')
                .call(drag);
    }));

    it('should allow component to be draggable', inject(function () {
        var components = element.find('.component');
        components.eq(0)
            .trigger('vumigo:dragstart')
            .trigger('vumigo:drag', {
                x: 70,
                y: 70
            })
            .trigger('vumigo:dragend');

        expect(components.eq(0).attr('transform')).to.equal('translate(70,70)');
    }));

    it('should not allow component to be dragged outside canvas', inject(function () {
        var components = element.find('.component');

        components.eq(0)
            .trigger('vumigo:dragstart')
            .trigger('vumigo:drag', {
                x: -1,
                y: -1
            })
            .trigger('vumigo:dragend');
        expect(components.eq(0).attr('transform')).to.equal('translate(0,0)');

        components.eq(0)
            .trigger('vumigo:dragstart')
            .trigger('vumigo:drag', {
                x: 101,
                y: 101
            })
            .trigger('vumigo:dragend');
        var svg = element.find('svg');
        var transform = 'translate(' + [100, 100] +')';
        expect(components.eq(0).attr('transform')).to.equal(transform);
    }));

    it('should snap component to grid', inject(function () {
        var components = element.find('.component');

        components.eq(0)
            .trigger('vumigo:dragstart')
            .trigger('vumigo:drag', {
                x: 14,
                y: 14
            })
            .trigger('vumigo:dragend');
        expect(components.eq(0).attr('transform')).to.equal('translate(10,10)');

        components.eq(0)
            .trigger('vumigo:dragstart')
            .trigger('vumigo:drag', {
                x: 15,
                y: 15
            })
            .trigger('vumigo:dragend');
        expect(components.eq(0).attr('transform')).to.equal('translate(20,20)');
    }));

});

describe('conversationComponent', function () {
    var element, conversation, layout, data;

    beforeEach(module('vumigo.services'));

    beforeEach(inject(function (conversationComponent, conversationLayout, dragBehavior) {
        element = angular.element(
            '<div id="viewport" style="width: 20px; height: 20px">' +
                '<svg width="100" height="100"></svg>' +
            '</div>');

        var drag = dragBehavior()
            .canvasWidth(100)
            .canvasHeight(100)
            .gridCellSize(10)
            .call();

        conversation = conversationComponent().drag(drag);
        layout = conversationLayout();

        data = [{
            name: "Conversation 1",
            description: "Test conversation",
            colour: '#cccccc',
            x: 50,
            y: 50
        }];

        d3.selectAll(element.find('svg').toArray()).selectAll('.conversation')
            .data(layout(data))
            .call(conversation);
    }));

    it('should have drawn the conversation component', inject(function () {
        var conversations = element.find('.conversation');
        expect(conversations).to.have.length(1);

        var conversation = conversations.eq(0);
        expect(conversation.attr('transform')).to.equal('translate(50,50)');

        var disc = conversation.find('.disc.outer').eq(0);
        var r = data[0]._layout.outer.r;
        expect(disc.attr('r')).to.equal(String(r));
        expect(disc.css('fill')).to.equal('rgb(204, 204, 204)');

        r = data[0]._layout.inner.r;
        expect(conversation.find('.disc.inner').eq(0).attr('r')).to.equal(String(r));

        var name = conversation.find('.name').eq(0);
        expect(name.text()).to.equal('Conversation 1');
        var x = data[0]._layout.name.x;
        expect(name.attr('x')).to.equal(String(x));

        var description = conversation.find('.description').eq(0);
        expect(description.text()).to.equal('Test conversation');
        x = data[0]._layout.description.x;
        expect(description.attr('x')).to.equal(String(x));
    }));

    it('should have drawn new conversation components', inject(function () {
        var conversations = element.find('.conversation');
        expect(conversations).to.have.length(1);

        data.push({
            name: "Conversation 2",
            description: "Another conversation",
            colour: '#e32',
            x: 100,
            y: 100
        });

        d3.selectAll(element.find('svg').toArray()).selectAll('.conversation')
            .data(layout(data))
            .call(conversation);

        conversations = element.find('.conversation');
        expect(conversations).to.have.length(2);
    }));

    it('should not have drawn any conversation components', inject(function () {
        var conversations = element.find('.conversation');
        expect(conversations).to.have.length(1);

        data.pop();

        d3.selectAll(element.find('svg').toArray()).selectAll('.conversation')
            .data(layout(data))
            .call(conversation);

        conversations = element.find('.conversation');
        expect(conversations).to.have.length(0);
    }));

    it('conversation should be draggable', inject(function () {
        var conversations = element.find('.conversation');
        conversations.eq(0)
            .trigger('vumigo:dragstart')
            .trigger('vumigo:drag', {
                x: 70,
                y: 70
            })
            .trigger('vumigo:dragend');

        expect(conversations.eq(0).attr('transform')).to.equal('translate(70,70)');
    }));

});

describe('channelComponent', function () {
    var element, channel, layout, data;

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
            name: "Channel 1",
            description: "Test channel",
            utilization: 0.4,
            x: 100,
            y: 100
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
        var r = data[0]._layout.outer.r;
        expect(channel.find('.disc.outer').eq(0).attr('r')).to.equal(String(r));
        r = data[0]._layout.inner.r;
        expect(channel.find('.disc.inner').eq(0).attr('r')).to.equal(String(r));

        var name = channel.find('.name').eq(0);
        expect(name.text()).to.equal('Channel 1');
        var x = data[0]._layout.name.x;
        expect(name.attr('x')).to.equal(String(x));

        var description = channel.find('.description').eq(0);
        expect(description.text()).to.equal('Test channel');
        x = data[0]._layout.description.x;
        expect(description.attr('x')).to.equal(String(x));
    }));

    it('should have drawn new channel component', inject(function () {
        var channels = element.find('.channel');
        expect(channels).to.have.length(1);

        data.push({
            name: "Channel 2",
            description: "Another channel",
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

describe('routerComponent', function () {
    var element, router, layout, data;

    beforeEach(module('vumigo.services'));

    beforeEach(inject(function (routerComponent, routerLayout, dragBehavior) {
        element = angular.element(
            '<div id="viewport" style="width: 20px; height: 20px">' +
                '<svg width="100" height="100"></svg>' +
            '</div>');

        var drag = dragBehavior()
            .canvasWidth(100)
            .canvasHeight(100)
            .gridCellSize(10)
            .call();

        router = routerComponent().drag(drag);
        layout = routerLayout();

        data = [{
            name: "Router 1",
            x: 100,
            y: 100,
            pins: [
                { name: "Pin 1" },
                { name: "Pin 2" }
            ]
        }];

        d3.selectAll(element.find('svg').toArray()).selectAll('.router')
            .data(layout(data))
            .call(router);
    }));

    it('should have drawn the router component', inject(function () {
        var routers = element.find('.router');
        expect(routers).to.have.length(1);

        var router = routers.eq(0);
        expect(router.attr('transform')).to.equal('translate(100,100)');
        expect(router.find('.disc').eq(0).attr('r')).to.equal(String(data[0]._layout.r));

        var name = router.find('.name').eq(0);
        expect(name.text()).to.equal('Router 1');

        var pins = router.find('.pins').eq(0);
        expect(pins.find('.pin')).to.have.length(2);

        var pin = pins.find('.pin').eq(0);
        var len = data[0].pins[0]._layout.len;
        var x = -(len / 2.0);
        var y = data[0].pins[0]._layout.y;
        expect(pin.attr('transform')).to.equal('translate(' + [x, y] + ')');
        expect(pin.find('.head')).to.have.length(1);
        expect(pin.find('.head').eq(0).attr('r')).to.equal('5');
        expect(pin.find('.line')).to.have.length(1);
        expect(pin.find('.line').eq(0).attr('x2')).to.equal(String(len));

        pin = pins.find('.pin').eq(1);
        len = data[0].pins[1]._layout.len;
        x = -(len / 2.0);
        y = data[0].pins[1]._layout.y;
        expect(pin.attr('transform')).to.equal('translate(' + [x, y] + ')');
    }));

    it('should have drawn new router component', inject(function () {
        var routers = element.find('.router');
        expect(routers).to.have.length(1);

        data.push({
            name: "Router 2",
            x: 200,
            y: 200,
            pins: [
                { name: "Pin 1" }
            ]
        });

        d3.selectAll(element.find('svg').toArray()).selectAll('.router')
            .data(layout(data))
            .call(router);

        routers = element.find('.router');
        expect(routers).to.have.length(2);
    }));

    it('should not have drawn any router components', inject(function () {
        var routers = element.find('.router');
        expect(routers).to.have.length(1);

        data.pop();

        d3.selectAll(element.find('svg').toArray()).selectAll('.router')
            .data(layout(data))
            .call(router);

        routers = element.find('.router');
        expect(routers).to.have.length(0);
    }));

    it('router should be draggable', inject(function () {
        var routers = element.find('.router');
        routers.eq(0)
            .trigger('vumigo:dragstart')
            .trigger('vumigo:drag', {
                x: 70,
                y: 70
            })
            .trigger('vumigo:dragend');

        expect(routers.eq(0).attr('transform')).to.equal('translate(70,70)');
    }));

});

describe('conversationLayout', function () {
    var layout;

    beforeEach(module('vumigo.services'));

    beforeEach(inject(function (conversationLayout, dragBehavior) {
        layout = conversationLayout();
    }));

    it('should compute conversation layout', inject(function () {
        var data = [{
            name: "Conversation 1",
            description: "Test conversation",
            x: 100,
            y: 100
        }];

        layout(data);

        var expected = [{
            name: "Conversation 1",
            description: "Test conversation",
            x: 100,
            y: 100,
            _layout: {
                inner: { r: 10 },
                outer: { r: 30 },
                name: { x: -35 },
                description: { x: -35 }
            }
        }];

        expect(data).to.deep.equal(expected);
    }));

});

describe('channelLayout', function () {
    var layout;

    beforeEach(module('vumigo.services'));

    beforeEach(inject(function (channelLayout, dragBehavior) {
        layout = channelLayout();
    }));

    it('should compute channel layout', inject(function () {
        var data = [{
            name: "Channel 1",
            description: "Test channel",
            utilization: 0.5,
            x: 100,
            y: 100
        }];

        layout(data);

        var expected = [{
            name: "Channel 1",
            description: "Test channel",
            utilization: 0.5,
            x: 100,
            y: 100,
            _layout: {
                inner: { r: 10 },
                outer: { r: 60 },
                name: { x: 25 },
                description: { x: 25 }
            }
        }];

        expect(data).to.deep.equal(expected);
    }));

});

describe('routerLayout', function () {
    var layout;

    beforeEach(module('vumigo.services'));

    beforeEach(inject(function (routerLayout, dragBehavior) {
        layout = routerLayout();
    }));

    it('should compute router layout', inject(function () {
        var data = [{
            name: "A",
            x: 100,
            y: 100,
            pins: [
                { name: "Pin 1" }
            ]
        }];

        layout(data);

        var size = Math.max(layout.minSize(),
            data[0].pins.length * layout.pinGap());

        var radius = Math.sqrt(2.0 * Math.pow(size, 2)) / 2.0;

        var expected = [{
            name: "A",
            x: 100,
            y: 100,
            pins: [{
                name: "Pin 1",
                _layout: { len: radius, y: -20, r: 5 }
            }],
            _layout: { r: radius }
        }];

        expect(data).to.deep.equal(expected);
    }));

});
