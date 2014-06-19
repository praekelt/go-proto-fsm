describe('goCampaignDesigner', function () {
    var element, scope;

    beforeEach(module('vumigo.services'));
    beforeEach(module('vumigo.directives'));

    beforeEach(inject(function ($rootScope, $compile) {
        element = angular.element('<go-campaign-designer data-data="data"></go-campaign-designer>');
        scope = $rootScope;
        scope.data = {
            conversations: [
                {x: 100, y: 100, name: "Conversation 1"},
                {x: 200, y: 200, name: "Conversation 2"}
            ]
        };
        $compile(element)(scope);
        scope.$digest();
    }));

    it('should have created element with id campaign-designer', function () {
        expect(element.attr('id')).to.equal('campaign-designer');
    });

    it('should have created svg element', function () {
        expect(element.find('svg')).to.have.length(1);
    });

    it('should have used default parameters', function () {
        var svg = element.find('svg');
        expect(svg.attr('width')).to.equal('2060');
        expect(svg.attr('height')).to.equal('2060');
    });

    it('should allow canvas to be draggable', function () {
        var container = element.find('g.container');
        var canvas = element.find('g.canvas');

        container
            .trigger('vumigo:zoomstart')
            .trigger('vumigo:zoom', {
                translate: [-500, -500],
                scale: 1
            })
            .trigger('vumigo:zoomend');

        expect(canvas.eq(0).attr('transform')).to.equal('translate(-500,-500)scale(1)');
    });

    it('should have drawn the conversations', function () {
        var canvas = element.find('g.canvas');
        var conversations = canvas.find('g.conversation');
        expect(conversations).to.have.length(2);
        expect(conversations.eq(0).attr('transform')).to.equal('translate(100,100)');
        expect(conversations.eq(1).attr('transform')).to.equal('translate(200,200)');
    });

    it('should allow conversations to be draggable', function () {
        var canvas = element.find('g.canvas');
        var conversations = canvas.find('g.conversation');

        conversations.eq(0)
            .trigger('vumigo:dragstart')
            .trigger('vumigo:drag', {
                x: 600,
                y: 600
            })
            .trigger('vumigo:dragend');

        expect(conversations.eq(0).attr('transform')).to.equal('translate(600,600)');
    });

    it('should not allow conversation to be dragged outside canvas', function () {
        var canvas = element.find('g.canvas');
        var conversations = canvas.find('g.conversation');

        conversations.eq(0)
            .trigger('vumigo:dragstart')
            .trigger('vumigo:drag', {
                x: -500,
                y: -500
            })
            .trigger('vumigo:dragend');
        expect(conversations.eq(0).attr('transform')).to.equal('translate(0,0)');

        conversations.eq(0)
            .trigger('vumigo:dragstart')
            .trigger('vumigo:drag', {
                x: 5000,
                y: 5000
            })
            .trigger('vumigo:dragend');
        var svg = element.find('svg');
        var transform = 'translate(' + [svg.attr('width'), svg.attr('height')] +')';
        expect(conversations.eq(0).attr('transform')).to.equal(transform);
    });

    it('should be zoomable', function() {
        var canvas = element.find('g.canvas');
        expect(canvas.attr('transform')).to.be.undefined;

        canvas
            .trigger('vumigo:zoomstart')
            .trigger('vumigo:zoom', {
                translate: [0, 0],
                scale: [40, 50]
            })
            .trigger('vumigo:zoomend');

        expect(canvas.attr('transform')).to.equal('translate(0,0)scale(40,50)');
    });
});
