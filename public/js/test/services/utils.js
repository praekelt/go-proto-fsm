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
    var element, buildCanvas;

    /** Calculate a transform for the given options. */
    function transform (params) {
        var options = {
            zoomExtent: [1, 10],
            currentZoom: 1,
            zoomFactor: 1,
            zoomDirection: 'in',
            currentTranslate: [0.0, 0.0],
            viewportWidth: 20,
            viewportHeight: 20
        };

        angular.extend(options, params);

        var viewportCenterX = (options.viewportWidth / 2) - options.currentTranslate[0];
        var viewportCenterY = (options.viewportHeight / 2) - options.currentTranslate[1];
        var newZoom = options.currentZoom * options.zoomFactor;

        if (options.zoomDirection == 'in') {
            if (newZoom > options.zoomExtent[1]) newZoom = options.zoomExtent[1];
            var zoomFactor = newZoom / options.currentZoom;

            var newX = options.currentTranslate[0] - ((viewportCenterX * zoomFactor) - viewportCenterX);
            var newY = options.currentTranslate[1] - ((viewportCenterY * zoomFactor) - viewportCenterY);

        } else {
            if (newZoom < options.zoomExtent[0]) newZoom = options.zoomExtent[0];
            var zoomFactor = newZoom / options.currentZoom;

            var newX = options.currentTranslate[0] - ((viewportCenterX * zoomFactor) - viewportCenterX);
            var newY = options.currentTranslate[1] - ((viewportCenterY * zoomFactor) - viewportCenterY);
        }

        return {
            scale: newZoom,
            translate: [newX, newY]
        }
    };

    beforeEach(module('vumigo.services'));

    beforeEach(inject(function (canvasBuilder) {
        element = angular.element(
            '<div id="viewport" style="width: 20px; height: 20px">' +
                '<svg width="100" height="100"></svg>' +
            '</div>');

        buildCanvas = canvasBuilder();

        buildCanvas
            .width(100)
            .height(100)
            .gridCellSize(10)
            .apply(null, [d3.selectAll(element.toArray())]);
    }));

    it('should create canvas', inject(function () {
        expect(element.find('g.canvas')).to.have.length(1);
    }));

    it('should allow canvas to be draggable', inject(function () {
        element.find('g.container')
            .d3()
            .simulate('zoomstart')
            .simulate('zoom', {
                translate: [-50, -50],
                scale: 1
            })
            .simulate('zoomend');

        var canvas = element.find('g.canvas');
        expect(canvas.eq(0).attr('transform')).to.equal('translate(-50,-50)scale(1)');
    }));

    it('should allow canvas to be zoomable', inject(function () {
        var canvas = element.find('g.canvas');
        expect(canvas.attr('transform')).to.be.undefined;

        element.find('g.container')
            .d3()
            .simulate('zoomstart')
            .simulate('zoom', {
                translate: [0, 0],
                scale: 3
            })
            .simulate('zoomend');

        expect(canvas.attr('transform')).to.equal('translate(0,0)scale(3)');
    }));

    it('should zoom canvas in and out', inject(function () {
        var canvas = element.find('g.canvas');
        expect(canvas.attr('transform')).to.be.undefined;

        buildCanvas.zoom('in');

        var expected = transform({
            zoomFactor: 1.1
        });

        expect(canvas.attr('transform')).to.equal('translate('
            + expected.translate + ')scale(' + expected.scale + ')');

        buildCanvas.zoom('out')

        expected = transform({
            zoomFactor: 0.9,
            zoomDirection: 'out',
            currentZoom: expected.scale,
            currentTranslate: expected.translate
        });

        expect(canvas.attr('transform')).to.equal('translate('
            + expected.translate + ')scale(' + expected.scale + ')');
    }));
});

describe('boundingBox', function () {
    var element;

    beforeEach(module('vumigo.services'));

    beforeEach(inject(function (boundingBox) {
        element = angular.element(
            '<div id="viewport" style="width: 20px; height: 20px">' +
                '<svg width="100" height="100"></svg>' +
            '</div>');

        angular.element(document.body).append(element);

        var data = [{
            _meta: {
                selected: true
            }
        }];

        var selection = d3.selectAll(element.find('svg').toArray())
            .selectAll('.component')
                .data(data).enter().append('g')
                .attr('class', 'component')
                .attr('transform', 'translate(50,50)');

        selection.append('circle')
            .attr('r', '20');

        selection.call(boundingBox());
    }));

    it('should have drawn a bounding box', inject(function () {
        var component = element.find('.component').eq(0);
        expect(component.find('.bbox')).to.have.length(1);

        var bbox = component.find('.bbox').eq(0);
        expect(bbox.attr('x')).to.equal('-25');
        expect(bbox.attr('y')).to.equal('-25');
        expect(bbox.attr('width')).to.equal('50');
        expect(bbox.attr('height')).to.equal('50');
    }));

});

describe('goUtils', function () {

    beforeEach(module('vumigo.services'));

    it('should determine midpoint', inject(function (goUtils) {
        midpoint = goUtils.midpoint({x: 10, y: 10}, {x: 30, y: 30});
        expect(midpoint).to.deep.equal({x: 20, y: 20});
    }));

});
