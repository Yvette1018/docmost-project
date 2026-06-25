import api from "@/lib/api-client";
export interface GraphNode {
    id: string;
    title: string | null;
    icon: string | null;
    spaceId: string;
}

export interface GraphEdge {
    source: string;
    target: string;
}

export interface KnowledgeGraph {
    nodes: GraphNode[];
    edges: GraphEdge[];
}

export async function getSpaceGraph(spaceId: string): Promise<KnowledgeGraph> {
    const res = await api.post(`/spaces/${spaceId}/graph`);
    return res.data;
}