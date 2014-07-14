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
