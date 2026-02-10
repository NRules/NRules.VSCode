(function() {
    const vscode = acquireVsCodeApi();

    function getCytoscapeStyles() {
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
                selector: 'node[category = "Root"]',
                style: {
                    'background-color': '#808080',
                    'border-color': '#606060',
                    'color': '#fff'
                }
            },
            {
                selector: 'node[category = "Type"]',
                style: {
                    'background-color': '#ffa500',
                    'border-color': '#cc8400',
                    'color': '#fff'
                }
            },
            {
                selector: 'node[category = "Selection"]',
                style: {
                    'background-color': '#0000cc',
                    'border-color': '#000099',
                    'color': '#fff'
                }
            },
            {
                selector: 'node[category = "AlphaMemory"]',
                style: {
                    'background-color': '#ff0000',
                    'border-color': '#cc0000',
                    'color': '#fff'
                }
            },
            {
                selector: 'node[category = "Join"]',
                style: {
                    'background-color': '#000080',
                    'border-color': '#000060',
                    'color': '#fff'
                }
            },
            {
                selector: 'node[category = "BetaMemory"]',
                style: {
                    'background-color': '#008000',
                    'border-color': '#006400',
                    'color': '#fff'
                }
            },
            {
                selector: 'node[category = "Aggregate"]',
                style: {
                    'background-color': '#8b0000',
                    'border-color': '#600000',
                    'color': '#fff'
                }
            },
            {
                selector: 'node[category = "Binding"]',
                style: {
                    'background-color': '#87ceeb',
                    'border-color': '#5f9ea0',
                    'color': '#222'
                }
            },
            {
                selector: 'node[category = "Rule"]',
                style: {
                    'background-color': '#800080',
                    'border-color': '#600060',
                    'color': '#fff'
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

    function getPerformanceCytoscapeStyles() {
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
                selector: 'node[category = "Root"]',
                style: {
                    'background-color': '#808080',
                    'border-color': '#606060',
                    'color': '#fff'
                }
            },
            {
                selector: 'node[category = "Type"]',
                style: {
                    'background-color': '#ffa500',
                    'border-color': '#cc8400',
                    'color': '#fff'
                }
            },
            {
                selector: 'node[category = "Selection"]',
                style: {
                    'background-color': '#0000cc',
                    'border-color': '#000099',
                    'color': '#fff'
                }
            },
            {
                selector: 'node[category = "AlphaMemory"]',
                style: {
                    'background-color': '#ff0000',
                    'border-color': '#cc0000',
                    'color': '#fff'
                }
            },
            {
                selector: 'node[category = "Join"]',
                style: {
                    'background-color': '#000080',
                    'border-color': '#000060',
                    'color': '#fff'
                }
            },
            {
                selector: 'node[category = "BetaMemory"]',
                style: {
                    'background-color': '#008000',
                    'border-color': '#006400',
                    'color': '#fff'
                }
            },
            {
                selector: 'node[category = "Aggregate"]',
                style: {
                    'background-color': '#8b0000',
                    'border-color': '#600000',
                    'color': '#fff'
                }
            },
            {
                selector: 'node[category = "Binding"]',
                style: {
                    'background-color': '#87ceeb',
                    'border-color': '#5f9ea0',
                    'color': '#222'
                }
            },
            {
                selector: 'node[category = "Rule"]',
                style: {
                    'background-color': '#800080',
                    'border-color': '#600060',
                    'color': '#fff'
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

    function getCytoscapeLayout() {
        return {
            name: 'elk',
            nodeDimensionsIncludeLabels: true,
            elk: {
                algorithm: 'layered',
                'elk.direction': 'DOWN',
                'elk.spacing.nodeNode': 80,
                'elk.layered.spacing.nodeNodeBetweenLayers': 100,
                'elk.edgeRouting': 'ORTHOGONAL'
            },
            fit: true,
            padding: 30,
            animate: false
        };
    }

    function initializeCytoscape() {
        cytoscape.use(cytoscapeElk);

        const styles = window.nrVisualizerMode === 'performance'
            ? getPerformanceCytoscapeStyles()
            : getCytoscapeStyles();

        const cy = cytoscape({
            container: document.getElementById('cy'),
            elements: window.nrGraphData,
            style: styles,
            layout: getCytoscapeLayout()
        });

        const tooltip = document.getElementById('tooltip');

        cy.on('mouseover', 'node', function(event) {
            const node = event.target;
            const properties = node.data('properties');
            if (!properties) {
                return;
            }
            const lines = Object.entries(properties)
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
