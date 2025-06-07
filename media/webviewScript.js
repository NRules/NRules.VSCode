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

        vscode.postMessage({ command: 'alert', text: 'NRules Visualizer initialized' });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeCytoscape);
    } else {
        initializeCytoscape();
    }
})();