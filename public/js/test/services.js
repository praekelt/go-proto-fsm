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
    var element;

    beforeEach(module('vumigo.services'));

    beforeEach(inject(function (conversationComponent, dragBehavior) {
        element = angular.element(
            '<div id="viewport" style="width: 20px; height: 20px">' +
                '<svg width="100" height="100"></svg>' +
            '</div>');

        var drag = dragBehavior()
            .canvasWidth(100)
            .canvasHeight(100)
            .gridCellSize(10)
            .call();

        conversation = conversationComponent().radius(30).drag(drag);

        d3.selectAll(element.find('svg').toArray()).selectAll('.conversation')
            .data([{x: 50, y: 50, name: "Conversation 1"}])
            .call(conversation);
    }));

    it('should have drawn the conversation component', inject(function () {
        var conversations = element.find('.conversation');
        expect(conversations).to.have.length(1);
        expect(conversations.eq(0).attr('transform')).to.equal('translate(50,50)');
        expect(conversations.eq(0).find('circle').attr('r')).to.equal('30');
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
