var controllers = angular.module('goprotofsm.controllers', []);

controllers.controller('CampaignMakerController', ['$scope',
    function ($scope) {

        $scope.data = [
            {x: 100, y: 100, r: 50},
            {x: 180, y: 30, r: 50},
            {x: 160, y: 90, r: 30}
        ];

        $scope.repaint = function () {
            var drag = d3.behavior.drag().on('drag', function (d) {
                d3.select(this).attr("cx", d3.event.x).attr("cy", d3.event.y);
                d.x = d3.event.x;
                d.y = d3.event.y;
            });

            var zoom = d3.behavior.zoom().scaleExtent([1, 10]).on('zoom', function () {
                svg.attr('transform', 'translate(' + d3.event.translate + ')scale(' + d3.event.scale + ')');
            });

            var svg = d3.select('svg').append('g').call(zoom);

            var width = parseInt(svg.style('width').replace('px', ''))
            var height = parseInt(svg.style('height').replace('px', ''));

            var x = d3.scale.identity().domain([0, width]);
            var y = d3.scale.identity().domain([0, height]);

            svg.selectAll('line.x').data(x.ticks(parseInt(width / 20)))
                .enter().append('line')
                .attr({'x1': x, 'x2': x, 'y1': 0, 'y2': height, 'class': 'x'})
                .style({'stroke': '#ccc', 'stroke-width': .5});

            svg.selectAll('line.y').data(y.ticks(parseInt(height / 20)))
                .enter().append('line')
                .attr({'x1': 0, 'x2': width, 'y1': y, 'y2': y, 'class': 'y'})
                .style({'stroke': '#ccc', 'stroke-width': .5});

            var circle = svg.selectAll('circle').data($scope.data);

            circle.enter().append('circle')
                .attr('cx', function (d) { return d.x; })
                .attr('cy', function (d) { return d.y; })
                .attr('r', function (d) { return d.r; })
                .call(drag);
        };

        $scope.repaint();
    }
]);
