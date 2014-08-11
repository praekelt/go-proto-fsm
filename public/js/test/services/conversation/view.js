describe('conversationComponent', function () {
    var element, conversation, layout, data;

    beforeEach(module('uuid'));
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
            uuid: 'conversation1',
            name: "Conversation 1",
            description: "Test conversation",
            endpoints: [{uuid: 'endpoint1', name: 'default'}],
            colour: '#cccccc',
            x: 50,
            y: 50,
            _meta: {
                selected: true
            }
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
        expect(conversation.attr('class').indexOf('selected')).not.to.equal(-1);

        var disc = conversation.find('.disc.outer').eq(0);
        var r = data[0]._meta.layout.outer.r;
        expect(disc.attr('r')).to.equal(String(r));
        expect(d3.rgb(disc.css('fill'))).to.deep.equal(d3.rgb(204, 204, 204));

        r = data[0]._meta.layout.inner.r;
        expect(conversation.find('.disc.inner').eq(0).attr('r')).to.equal(String(r));

        var name = conversation.find('.name').eq(0);
        expect(name.text()).to.equal('Conversation 1');
        var x = data[0]._meta.layout.name.x;
        expect(name.attr('x')).to.equal(String(x));

        var description = conversation.find('.description').eq(0);
        expect(description.text()).to.equal('Test conversation');
        x = data[0]._meta.layout.description.x;
        expect(description.attr('x')).to.equal(String(x));
    }));

    it('should have drawn new conversation components', inject(function () {
        var conversations = element.find('.conversation');
        expect(conversations).to.have.length(1);

        data.push({
            uuid: "conversation2",
            name: "Conversation 2",
            description: "Another conversation",
            endpoints: [{uuid: 'endpoint2', name: 'default'}],
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
            .d3()
            .simulate('dragstart')
            .simulate('drag', {
                x: 70,
                y: 70
            })
            .simulate('dragend');

        expect(conversations.eq(0).attr('transform')).to.equal('translate(70,70)');
    }));

});
