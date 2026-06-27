import { Injectable } from '@nestjs/common';
import { BacklinkRepo } from '@docmost/db/repos/backlink/backlink.repo';
import { PagePermissionRepo } from '@docmost/db/repos/page/page-permission.repo';
export interface GraphNode {
  id: string;
  slugId: string;
  title: string | null;
  icon: string | null;
  spaceId: string;
  space: { id: string; slug: string; name: string } | null;
}

export interface GraphEdge {
  source: string;
  target: string;
}

export interface PageGraphResult {
  nodes: GraphNode[];
  edges: GraphEdge[];
  centerPageId?: string;
}

const DEFAULT_DEPTH = 2;
const DEFAULT_MAX_NODES = 80;

@Injectable()
export class PageGraphService {
  constructor(
    private readonly backlinkRepo: BacklinkRepo,
    private readonly pagePermissionRepo: PagePermissionRepo,
  ) {}

  async getGraph(opts: {
    pageId?: string;
    spaceId?: string;
    depth?: number;
    maxNodes?: number;
    userId: string;
  }): Promise<PageGraphResult> {
    const depth = opts.depth ?? DEFAULT_DEPTH;
    const maxNodes = opts.maxNodes ?? DEFAULT_MAX_NODES;

    if (opts.spaceId) {
      return this.getSpaceGraph(opts.spaceId, maxNodes, opts.userId);
    }

    if (opts.pageId) {
      return this.getPageCentricGraph(
        opts.pageId,
        depth,
        maxNodes,
        opts.userId,
      );
    }

    return { nodes: [], edges: [] };
  }

  private async getPageCentricGraph(
    centerPageId: string,
    depth: number,
    maxNodes: number,
    userId: string,
  ): Promise<PageGraphResult> {
    const visited = new Set<string>([centerPageId]);
    const allEdges: GraphEdge[] = [];
    let frontier = [centerPageId];

    for (let level = 0; level < depth && frontier.length > 0; level++) {
      if (visited.size >= maxNodes) break;

      const edges = await this.backlinkRepo.findEdgesForPageIds(frontier);
      allEdges.push(...edges);

      const nextIds: string[] = [];
      for (const edge of edges) {
        for (const id of [edge.source, edge.target]) {
          if (!visited.has(id) && visited.size + nextIds.length < maxNodes) {
            nextIds.push(id);
            visited.add(id);
          }
        }
      }
      frontier = nextIds;
    }

    const accessibleIds = await this.pagePermissionRepo.filterAccessiblePageIds({
      pageIds: Array.from(visited),
      userId,
    });
    const accessibleSet = new Set(accessibleIds);

    const filteredEdges = allEdges.filter(
      (e) => accessibleSet.has(e.source) && accessibleSet.has(e.target),
    );

    const nodeIds = new Set<string>();
    for (const edge of filteredEdges) {
      nodeIds.add(edge.source);
      nodeIds.add(edge.target);
    }
    if (accessibleSet.has(centerPageId)) {
      nodeIds.add(centerPageId);
    }

    const nodes = await this.backlinkRepo.findGraphNodesByIds(
      Array.from(nodeIds),
    );

    return {
      nodes,
      edges: filteredEdges,
      centerPageId,
    };
  }

  private async getSpaceGraph(
    spaceId: string,
    maxNodes: number,
    userId: string,
  ): Promise<PageGraphResult> {
    const rawEdges = await this.backlinkRepo.findEdgesInSpace(
      spaceId,
      maxNodes * 2,
    );

    const pageIds = new Set<string>();
    for (const edge of rawEdges) {
      pageIds.add(edge.source);
      pageIds.add(edge.target);
    }

    const accessibleIds = await this.pagePermissionRepo.filterAccessiblePageIds({
      pageIds: Array.from(pageIds),
      userId,
      spaceId,
    });
    const accessibleSet = new Set(accessibleIds);

    const filteredEdges = rawEdges.filter(
      (e) => accessibleSet.has(e.source) && accessibleSet.has(e.target),
    );

    const nodeIds = new Set<string>();
    for (const edge of filteredEdges) {
      nodeIds.add(edge.source);
      nodeIds.add(edge.target);
      if (nodeIds.size >= maxNodes) break;
    }

    const limitedNodeIds = Array.from(nodeIds).slice(0, maxNodes);
    const limitedSet = new Set(limitedNodeIds);

    const finalEdges = filteredEdges.filter(
      (e) => limitedSet.has(e.source) && limitedSet.has(e.target),
    );

    const nodes = await this.backlinkRepo.findGraphNodesByIds(limitedNodeIds);

    return { nodes, edges: finalEdges };
  }
}
