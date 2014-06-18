describe('utils', function () {
    beforeEach(module('vumigo.services'));

    it('getOrCreate should create a new element', inject(function (utils) {
        var element = angular.element('<svg width="100" height="100"></svg>');
        var selection = d3.selectAll(element.toArray());
        var g = utils.getOrCreate(selection, 'g');
        expect(g).to.have.length(1);
        expect(element.find('g')).to.have.length(1);
    }));

    it('getOrCreate should return existing element', inject(function (utils) {
        var element = angular.element('<svg width="100" height="100"><g></g></svg>');
        var selection = d3.selectAll(element.toArray());
        var g = utils.getOrCreate(selection, 'g');
        expect(g).to.have.length(1);
        expect(element.find('g')).to.have.length(1);
    }));

    it('drawGrid should draw grid in selection', inject(function (utils) {
        var element = angular.element('<svg width="100" height="100"></svg>');
        var selection = d3.selectAll(element.toArray());
        utils.drawGrid(selection, 100, 100, 10);
        expect(element.find('g.x.axis')).to.have.length(1);
        expect(element.find('g.y.axis')).to.have.length(1);
    }));

});

describe('filters', function () {
    beforeEach(module('vumigo.services'));

    it('should add shadow filter to defs', inject(function (filters) {
        var element = angular.element('<svg></svg>');
        var selection = d3.selectAll(element.toArray());
        filters.dropShadow(selection, 'shadow-filter');
        expect(element.find('defs').find('filter#shadow-filter')).to.have.length(1);
    }));

});

describe('conversations', function () {
    beforeEach(module('vumigo.services'));

    it('should draw a conversation shape', inject(function (conversations) {
        var element = angular.element('<svg width="100" height="100"></svg>');
        var selection = d3.selectAll(element.toArray());
        var conversation = conversations().radius(30);
        selection.selectAll('.conversation')
            .data([{x: 50, y: 50, name: "Conversation 1"}])
            .call(conversation);

        var elements = element.find('.conversation');
        expect(elements).to.have.length(1);
        expect(elements.eq(0).attr('transform')).to.equal('translate(50,50)');
        expect(elements.eq(0).find('circle').attr('r')).to.equal('30');
    }));

});
