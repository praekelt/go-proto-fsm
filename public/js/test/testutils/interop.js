describe('interop', function () {
    beforeEach(module('vumigo.testutils'));

    beforeEach(inject(function(interop) {
        interop.enable();
    }));

    afterEach(inject(function(interop) {
        interop.disable();
    }));

    describe("$.fn.d3", function() {
        it('should convert the jquery selection to a d3 selection', function() {
            var el = $('<div>')
                .append($('<div>').attr('class', 'foo'))
                .append($('<div>').attr('class', 'bar'));

            el.appendTo($('body'));

            expect(el.d3().select('.foo').node()).to.equal(el.find('.foo').get(0));
            expect(el.d3().select('.bar').node()).to.equal(el.find('.bar').get(0));

            el.remove();
        });
    });
});
