describe('utils', function () {
    beforeEach(module('vumigo.services'));

    it('drawGrid should draw grid in selection', inject(function (utils) {
        var element = angular.element('<svg width="100" height="100"></svg>');
        var selection = d3.selectAll(element.toArray());
        utils.drawGrid(selection, 100, 100, 10);
        expect(element.find('g.x.axis')).to.have.length(1);
        expect(element.find('g.y.axis')).to.have.length(1);
    }));

    it('addDropShadowFilter should add shadow filter to defs', inject(function (utils) {
        var element = angular.element('<svg></svg>');
        var selection = d3.selectAll(element.toArray());
        utils.addDropShadowFilter(selection);
        expect(element.find('defs').find('filter#shadow')).to.have.length(1);
    }));

    it('addDropShadowFilter should add shadow filter only once', inject(function (utils) {
        var element = angular.element('<svg></svg>');
        var selection = d3.selectAll(element.toArray());
        utils.addDropShadowFilter(selection);
        utils.addDropShadowFilter(selection);
        expect(element.find('defs').find('filter#shadow')).to.have.length(1);
    }));

});

describe('conversation', function () {
    beforeEach(module('vumigo.services'));

    it('should draw a conversation shape', inject(function (conversation) {
        var element = angular.element('<svg width="100" height="100"></svg>');
        var selection = d3.selectAll(element.toArray());
        conversation = conversation().radius(30);
        selection.selectAll('.conversation')
            .data([{x: 50, y: 50, name: "Conversation 1"}])
            .call(conversation);

        var elements = element.find('.conversation');
        expect(elements).to.have.length(1);
        expect(elements.eq(0).attr('transform')).to.equal('translate(50,50)');
        expect(elements.eq(0).find('circle').attr('r')).to.equal('30');
    }));

});
