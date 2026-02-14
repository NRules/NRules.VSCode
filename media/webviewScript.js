(function() {
    const vscode = acquireVsCodeApi();

    function getBaseStyles() {
        return [
            {
                selector: 'node',
                style: {
                    'shape': 'roundrectangle',
                    'label': 'data(label)',
                    'text-valign': 'center',
                    'text-halign': 'center',
                    'color': '#222',
                    'background-color': '#e0e0e0',
                    'border-width': 1,
                    'border-color': '#888',
                    'font-family': 'Segoe UI, Arial, sans-serif',
                    'font-size': '13px',
                    'padding': '8px 16px',
                    'width': 'label',
                    'height': 'label',
                    'min-width': 40,
                    'min-height': 32,
                    'text-wrap': 'wrap',
                    'text-max-width': 200,
                    'text-outline-width': 0,
                    'border-radius': 5
                }
            },
            {
                selector: 'edge',
                style: {
                    'width': 2,
                    'line-color': '#ccc',
                    'target-arrow-color': '#ccc',
                    'target-arrow-shape': 'triangle',
                    'curve-style': 'bezier'
                }
            }
        ];
    }

    function applyComputedStyles(cy) {
        cy.elements().forEach(function(ele) {
            var computed = ele.data('computedStyle');
            if (computed) {
                ele.style(computed);
            }
        });
    }

    function getCytoscapeLayout() {
        return {
            name: 'elk',
            nodeDimensionsIncludeLabels: true,
            elk: {
                algorithm: 'layered',
                'elk.direction': 'DOWN',
                'elk.spacing.nodeNode': 250,
                'elk.layered.spacing.nodeNodeBetweenLayers': 150,
                'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX'
            },
            fit: true,
            padding: 50,
            animate: false
        };
    }

    function initializeCytoscape() {
        cytoscape.use(cytoscapeElk);

        var cy = cytoscape({
            container: document.getElementById('cy'),
            elements: window.nrGraphData,
            style: getBaseStyles(),
            layout: getCytoscapeLayout()
        });

        cy.on('layoutstop', function() {
            var threshold = 10;
            cy.edges().forEach(function(edge) {
                var sx = edge.source().position('x');
                var tx = edge.target().position('x');
                var dx = Math.abs(sx - tx);
                if (dx > threshold) {
                    var distance = Math.min(Math.max(dx * 0.5, 20), 60);
                    edge.style({
                        'curve-style': 'unbundled-bezier',
                        'control-point-distances': [distance],
                        'control-point-weights': [0.5]
                    });
                }
            });
        });

        applyComputedStyles(cy);

        var tooltip = document.getElementById('tooltip');

        cy.on('mouseover', 'node', function(event) {
            var node = event.target;
            var properties = node.data('properties');
            if (!properties) {
                return;
            }
            var lines = Object.entries(properties)
                .filter(function(entry) { return entry[0] !== 'Label'; })
                .filter(function(entry) { return entry[1] !== undefined; })
                .map(function(entry) { return entry[0] + ' = ' + entry[1]; });
            tooltip.textContent = lines.join('\n');

            var pos = event.originalEvent;
            var gap = 5;
            var rect = tooltip.getBoundingClientRect();
            var left = pos.clientX + gap;
            var top = pos.clientY + gap;

            if (left + rect.width > window.innerWidth) {
                left = pos.clientX - gap - rect.width;
            }
            if (top + rect.height > window.innerHeight) {
                top = pos.clientY - gap - rect.height;
            }
            if (left < 0) {
                left = 0;
            }
            if (top < 0) {
                top = 0;
            }

            tooltip.style.left = left + 'px';
            tooltip.style.top = top + 'px';

            tooltip.style.display = 'block';
        });

        cy.on('mouseout', 'node', function() {
            tooltip.style.display = 'none';
        });

        vscode.postMessage({ command: 'alert', text: 'NRules Visualizer initialized' });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeCytoscape);
    } else {
        initializeCytoscape();
    }
})();
