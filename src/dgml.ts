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
        [key: string]: string | undefined;
    };
}

export interface DgmlCondition {
    $: { Expression: string };
}

export interface DgmlSetter {
    $: { Property: string; Value?: string; Expression?: string };
}

export interface DgmlStyle {
    $: { TargetType: string };
    Condition?: DgmlCondition[];
    Setter?: DgmlSetter[];
}

export interface DgmlCategory {
    $: { Id: string; [key: string]: string | undefined };
}

export interface DgmlProperty {
    $: { Id: string; DataType?: string; [key: string]: string | undefined };
}

export interface DirectedGraph {
    Nodes: { Node: Node[] }[];
    Links: { Link: Link[] }[];
    $: {
        Title: string;
    };
    Styles?: { Style: DgmlStyle[] }[];
    Categories?: { Category: DgmlCategory[] }[];
    Properties?: { Property: DgmlProperty[] }[];
}

export interface Dgml {
    DirectedGraph: DirectedGraph;
}
