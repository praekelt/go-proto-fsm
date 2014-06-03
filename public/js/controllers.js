var controllers = angular.module('goprotofsm.controllers', []);

controllers.controller('CampaignMakerController', ['$scope',
    function ($scope) {

        $scope.data = [
            {x: 100, y: 100, r: 50},
            {x: 180, y: 30, r: 15},
            {x: 160, y: 90, r: 15}
        ];

        $scope.repaint = function () {
            var svg = d3.select('svg')
                , width = parseInt(svg.style('width').replace('px', ''))
                , height = parseInt(svg.style('height').replace('px', ''));

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
            .attr('cx', function(d) { return d.x; })
            .attr('cy', function(d) { return d.y; })
            .attr('r', function(d) { return d.r; });
        };

        $scope.repaint();
    }
]);
