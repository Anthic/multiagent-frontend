export type NodeType = 'root_paper' | 'citation' | 'gap' | 'concept';

export interface IGraphNode {
  id: string;
  label: string;
  type: NodeType;
  cluster: string;
  size: number;
  color: string;
  x?: number;
  y?: number;
  z?: number;
  authors?: string[];
  year?: string;
  doi?: string;
  url?: string;
  abstractSnippet?: string;
  citationsCount?: number;
  connections: string[];
}

export interface IGraphLink {
  source: string;
  target: string;
  type: 'cites' | 'addresses_gap' | 'thematic_cluster';
  label?: string;
}

export interface IGraphData {
  nodes: IGraphNode[];
  links: IGraphLink[];
}
