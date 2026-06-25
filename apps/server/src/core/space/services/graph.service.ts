import { Injectable } from '@nestjs/common';
import { BacklinkRepo } from '@docmost/db/repos/backlink/backlink.repo';
import { PageRepo } from '@docmost/db/repos/page/page.repo';

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

@Injectable()
export class GraphService {
    constructor(
        private readonly backlinkRepo: BacklinkRepo,
        private readonly pageRepo: PageRepo,
    ) { }

    async getSpaceGraph(spaceId: string, userId: string): Promise<KnowledgeGraph> {
        // 获取空间下所有页面
        const pages = await this.pageRepo.findSpacePages(spaceId);

        // 获取所有反向链接关系
        const pageIds = pages.map(p => p.id);
        const backlinks = await this.backlinkRepo.findSpaceBacklinks(spaceId);

        // 构建节点
        const nodes: GraphNode[] = pages.map(page => ({
            id: page.id,
            title: page.title,
            icon: page.icon,
            spaceId: page.spaceId,
        }));

        // 构建边
        const edges: GraphEdge[] = backlinks
            .filter(bl => pageIds.includes(bl.sourcePageId) && pageIds.includes(bl.targetPageId))
            .map(bl => ({
                source: bl.sourcePageId,
                target: bl.targetPageId,
            }));

        return { nodes, edges };
    }
}