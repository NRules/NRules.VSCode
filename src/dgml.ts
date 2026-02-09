export interface Node {
    $: {
        Id: string;
        Label?: string;
        Category?: string;
        [key: string]: string | undefined;
    };
}

export interface Link {
    $: {
        Source: string;
        Target: string;
        Category?: string;
    };
}

export interface DirectedGraph {
    Nodes: { Node: Node[] }[];
    Links: { Link: Link[] }[];
    $: {
        Title: string;
    };
}

export interface Dgml {
    DirectedGraph: DirectedGraph;
}