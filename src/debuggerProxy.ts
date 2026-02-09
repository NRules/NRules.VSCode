import * as vscode from 'vscode';

export class DebuggerProxy {
    public async getContents() {
        const debugSession = this.getDebugSession();
        if (!debugSession) {
            throw new Error("No active debug session found. Please start debugging your application and pause execution to use the visualizer.");
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
        const session = await this.findSessionVariable(debugSession, frameId);

        const reply = await debugSession.customRequest('evaluate',
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

    private async findSessionVariable(debugSession: vscode.DebugSession, frameId: number): Promise<string> {
        const scopesResponse = await debugSession.customRequest('scopes', { frameId: frameId });
        const sessionTypePattern = /NRules\.I?Session\b/;

        for (const scope of scopesResponse.scopes) {
            const variablesResponse = await debugSession.customRequest('variables',
                { variablesReference: scope.variablesReference });

            for (const variable of variablesResponse.variables) {
                if (variable.type && sessionTypePattern.test(variable.type) && variable.value !== 'null') {
                    return variable.evaluateName;
                }
            }
        }

        throw new Error("No variable of type NRules.ISession found in the current stack frame. " +
            "Make sure the debugger is paused in a scope where the NRules session is accessible.");
    }

    private getDebugSession(): vscode.DebugSession | undefined {
        return vscode.debug.activeDebugSession;
    }
}