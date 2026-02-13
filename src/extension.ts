import * as vscode from 'vscode';
import { WebviewContentProvider } from './webviewContent';
import { DebuggerProxy } from './debuggerProxy';
import { DgmlParser } from './dgmlParser';
import { VisualizerMode } from './visualizerMode';

export function activate(context: vscode.ExtensionContext) {

    console.log('Activating "vscode-nrules-visualizer" extension');

    const schemaDisposable = vscode.commands.registerCommand('vscode-nrules-visualizer.showVisualizer', () => {
        showVisualizer(context, 'schema');
    });

    const performanceDisposable = vscode.commands.registerCommand('vscode-nrules-visualizer.showPerformanceVisualizer', () => {
        showVisualizer(context, 'performance');
    });

    context.subscriptions.push(schemaDisposable);
    context.subscriptions.push(performanceDisposable);
}

export function deactivate() {}

function showVisualizer(context: vscode.ExtensionContext, mode: VisualizerMode) {
    const panelId = mode === 'performance' ? 'nrulesPerformanceVisualizer' : 'nrulesVisualizer';
    const panelTitle = mode === 'performance' ? 'NRules Performance Visualizer' : 'NRules Visualizer';

    const panel = vscode.window.createWebviewPanel(
        panelId,
        panelTitle,
        vscode.ViewColumn.One,
        {
            enableScripts: true,
            retainContextWhenHidden: true,
        }
    );

    const contentProvider = new WebviewContentProvider(panel.webview, context.extensionUri);

    const debuggerProxy = new DebuggerProxy();
    debuggerProxy.getContents(mode).then(contents => {

        const parser = new DgmlParser();
        parser.parse(contents).then(result => {

            panel.webview.html = contentProvider.getHtmlContent(result.DirectedGraph);

        }).catch(error => {
            panel.webview.html = contentProvider.getErrorContent(error);
        });

    }).catch(error => {
        panel.webview.html = contentProvider.getErrorContent(error);
    });

    panel.webview.onDidReceiveMessage(message => {
        switch (message.command) {
            case 'alert':
                vscode.window.showInformationMessage(message.text);
                return;
        }
    }, undefined, context.subscriptions);
}
