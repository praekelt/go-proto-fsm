
angular.module('vumigo.services').factory('zoomBehavior', [function () {
    return function () {
        var zoomBehavior = null;  // Zoom behavior instance
        var canvas = null;  // Canvas to get zoomed/dragged
        var canvasWidth = 0; // Canvas width
        var canvasHeight = 0; // Canvas height
        var viewportElement = null;  // Viewport wrapped in a jQuery object
        var zoomExtent = [1, 10];  // Default zoom extent

        /**
         * Called when the canvas is dragged or scaled.
         */
        function zoomed() {
            var translate = d3.event.translate;
            var scale = d3.event.scale;

            if (translate[0] > 0) {
                translate[0] = 0;
            }

            if (translate[1] > 0) {
                translate[1] = 0;
            }

            // Prevent canvas being moved beyond the viewport
            if (viewportElement && viewportElement.length > 0) {
                if (canvasWidth > 0) {
                    var x = viewportElement.width() - canvasWidth * scale;
                    if (translate[0] < x) {
                        translate[0] = x;
                    }
                }

                if (canvasHeight > 0) {
                    var y = viewportElement.height() - canvasHeight * scale;
                    if (translate[1] < y) {
                        translate[1] = y;
                    }
                }
            }

            zoomBehavior.translate(translate);  // Set the zoom translation vector

            canvas.attr('transform', 'translate(' + translate + ')scale(' + scale + ')');
        }

        var zoom = function () {
            zoomBehavior = d3.behavior.zoom()
                .scaleExtent(zoomExtent)
                .on('zoom', zoomed);

            return zoomBehavior;
        };

        zoom.canvas = function(value) {
            if (!arguments.length) return canvas;
            canvas = value;
            return zoom;
        };

        zoom.canvasWidth = function(value) {
            if (!arguments.length) return canvasWidth;
            canvasWidth = value;
            return zoom;
        };

       zoom.canvasHeight = function(value) {
            if (!arguments.length) return canvasHeight;
            canvasHeight = value;
            return zoom;
        };

       zoom.viewportElement = function(value) {
            if (!arguments.length) return viewportElement;
            viewportElement = value;
            return zoom;
        };

        zoom.zoomExtent = function(value) {
            if (!arguments.length) return zoomExtent;
            zoomExtent = value;
            return zoom;
        };

        return zoom;
    };
}]);

angular.module('vumigo.services').factory('dragBehavior', ['$rootScope',
    function ($rootScope) {
        return function () {
            var dragEnabled = true;
            var selectEnabled = true;
            var canvasWidth = 0;
            var canvasHeight = 0;
            var gridCellSize = 0;

            /**
             * Called when the user starts dragging a component
             */
            function dragstarted() {
                if (d3.event.sourceEvent) {
                    d3.event.sourceEvent.stopPropagation();
                }

                var selection = d3.select(this);

                if (dragEnabled) {
                    selection.classed('dragging', true);
                }

                if (selectEnabled) {
                    $rootScope.$apply(function () {
                        $rootScope.$emit('go:campaignDesignerSelect', selection.datum());
                    });
                }
            }

            /**
             * Called while the user is dragging a component
             */
            function dragged(d) {
                if (!dragEnabled) return;

                var x = d3.event.x;
                var y = d3.event.y;

                // If we have a grid, snap to it
                if (gridCellSize > 0) {
                    x = Math.round(x / gridCellSize) * gridCellSize;
                    y = Math.round(y / gridCellSize) * gridCellSize;
                }

                // Make sure components don't get dragged outside the canvas
                if (x < 0) x = 0;
                if (canvasWidth > 0) {
                    if (x > canvasWidth) x = canvasWidth;
                }

                if (y < 0) y = 0;
                if (canvasHeight > 0) {
                    if (y > canvasHeight) y = canvasHeight;
                }

                d.x = x;
                d.y = y;

                d3.select(this).attr('transform', 'translate(' + [x, y] + ')');

                $rootScope.$apply(function () {
                    $rootScope.$emit('go:campaignDesignerRepaint');
                });
            }

            /**
             * Called after the user drops a component
             */
            function dragended() {
                if (dragEnabled) {
                    d3.select(this).classed('dragging', false);
                }
            }

            var drag = function() {
                return d3.behavior.drag()
                    .on('dragstart', dragstarted)
                    .on('drag', dragged)
                    .on('dragend', dragended);
            }

            drag.dragEnabled = function(value) {
                if (!arguments.length) return dragEnabled;
                dragEnabled = value;
                return drag;
            };

            drag.selectEnabled = function(value) {
                if (!arguments.length) return selectEnabled;
                selectEnabled = value;
                return drag;
            };

            drag.canvasWidth = function(value) {
                if (!arguments.length) return canvasWidth;
                canvasWidth = value;
                return drag;
            };

           drag.canvasHeight = function(value) {
                if (!arguments.length) return canvasHeight;
                canvasHeight = value;
                return drag;
            };

           drag.gridCellSize = function(value) {
                if (!arguments.length) return gridCellSize;
                gridCellSize = value;
                return drag;
            };

            return drag;
        }
    }
]);
