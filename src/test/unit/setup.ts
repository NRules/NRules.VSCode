import Module from 'module';

const vscodeMock = {
    Uri: {
        joinPath: (...args: unknown[]) => args.join('/'),
    },
    debug: {
        activeDebugSession: undefined,
    },
};

const originalResolveFilename = (Module as any)._resolveFilename;
(Module as any)._resolveFilename = function (request: string, ...args: unknown[]) {
    if (request === 'vscode') {
        return 'vscode';
    }
    return originalResolveFilename.call(this, request, ...args);
};

require.cache['vscode'] = {
    id: 'vscode',
    filename: 'vscode',
    loaded: true,
    exports: vscodeMock,
} as any;
