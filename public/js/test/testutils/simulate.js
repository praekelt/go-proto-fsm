describe('simulate', function () {
    var el;

    beforeEach(module('vumigo.testutils'));

    beforeEach(inject(function(simulate) {
        el = d3.select('body').append('div');
        simulate.enable();
    }));

    afterEach(inject(function(simulate) {
        el.remove();
        simulate.disable();
    }));

    it('should invoke the d3 event listeners', function() {
        var bars = [];

        el.selectAll('.foo')
          .data([1, 2, 3, 4])
          .enter().append('div')
              .attr('class', 'foo')
              .attr('data-id', function(d) { return d; })
              .on('bar', function(d, i) {
                  bars.push({
                      i: i,
                      d: d,
                      ctx: this
                  });
              })
              .simulate('bar');

        expect(bars).to.deep.equal([{
            i: 0,
            d: 1,
            ctx: el.select('.foo[data-id="1"]').node()
        }, {
            i: 1,
            d: 2,
            ctx: el.select('.foo[data-id="2"]').node()
        }, {
            i: 2,
            d: 3,
            ctx: el.select('.foo[data-id="3"]').node()
        }, {
            i: 3,
            d: 4,
            ctx: el.select('.foo[data-id="4"]').node()
        }]);
    });

    it("should change the current d3 event", function() {
        var bars = [];

        el.selectAll('.foo')
          .data([1, 2, 3, 4])
          .enter().append('div')
              .attr('class', 'foo')
              .attr('data-id', function(d) { return d; });

        var oldEvent = d3.event = {baz: 'quux'};

        el.selectAll('.foo')
            .on('bar', function() { bars.push(d3.event); })
            .simulate('bar', {corge: 'grault'});

        expect(bars[0].type).to.equal('bar');
        expect(bars[0].sourceEvent).to.equal(oldEvent);
        expect(bars[0].target).to.equal(el.select('.foo[data-id="1"]').node());

        expect(bars[1].type).to.equal('bar');
        expect(bars[1].sourceEvent).to.equal(bars[0]);
        expect(bars[1].target).to.equal(el.select('.foo[data-id="2"]').node());

        expect(bars[2].type).to.equal('bar');
        expect(bars[2].sourceEvent).to.equal(bars[1]);
        expect(bars[2].target).to.equal(el.select('.foo[data-id="3"]').node());

        expect(bars[3].type).to.equal('bar');
        expect(bars[3].sourceEvent).to.equal(bars[2]);
        expect(bars[3].target).to.equal(el.select('.foo[data-id="4"]').node());

        expect(d3.event).to.equal(oldEvent);
    });
});
