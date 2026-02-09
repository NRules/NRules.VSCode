import * as vscode from 'vscode';

export class DebuggerProxy {
    public async getContents() {
        var debugSession = this.getDebugSession();
        if (!debugSession) {
            return "";
        }

        const threads = await debugSession.customRequest('threads');
        const threadId = threads.threads[0].id;

        const stackTrace = await debugSession.customRequest('stackTrace', 
            {
                threadId: threadId,
                startFrame: 0,
                levels: 1
            });
        const frameId = stackTrace.stackFrames[0].id;
        let session = "session";

        let reply = await debugSession.customRequest('evaluate', 
            {
                expression: `new NRules.Diagnostics.Dgml.DgmlWriter(${session}.GetSchema()).GetContents()`,
                frameId: frameId,
                context: 'repl'
            });

        let result = reply.result;
        result = result.substring(1, result.length - 1);
        result = result.replace(/\\"/g, '"');
        result = result.replace(/\\r/g, '\r');
        result = result.replace(/\\n/g, '\n');
        
        return result;
    }

    private getDebugSession(): vscode.DebugSession | undefined {
        return vscode.debug.activeDebugSession;
    }
}