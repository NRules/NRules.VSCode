import * as vscode from 'vscode';

export class DebuggerProxy {
    public async getContents() {
        var session = this.getDebugSession();
		if (!session) {
			return "";
		}

		const threads = await session.customRequest('threads');
		const threadId = threads.threads[0].id;

		const stackTrace = await session.customRequest('stackTrace', 
			{
				threadId: threadId,
				startFrame: 0,
				levels: 1
			});
        const frameId = stackTrace.stackFrames[0].id;

		let reply = await session.customRequest('evaluate', 
			{
				expression: 'new NRules.Diagnostics.Dgml.DgmlWriter(session.GetSchema()).GetContents()',
				frameId: frameId, context:'repl'
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