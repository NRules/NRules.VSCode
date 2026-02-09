(function() {
    const vscode = acquireVsCodeApi();

    function initializeCytoscape() {
        cytoscape.use(cytoscapeElk);

        const cy = cytoscape({
            container: document.getElementById('cy'),
            elements: window.nrGraphData,
            style: window.nrGraphStyles,
            layout: window.nrGraphLayout
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
