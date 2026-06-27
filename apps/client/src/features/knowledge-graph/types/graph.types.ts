export interface IGraphNode {
  id: string;
  slugId: string;
  title: string | null;
  icon: string | null;
  spaceId: string;
  space: { id: string; slug: string; name: string } | null;
}

export interface IGraphEdge {
  source: string;
  target: string;
}

export interface IPageGraph {
  nodes: IGraphNode[];
  edges: IGraphEdge[];
  centerPageId?: string;
}

export interface IPageGraphParams {
  pageId?: string;
  spaceId?: string;
  depth?: number;
  maxNodes?: number;
}
