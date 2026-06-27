import { useQuery } from "@tanstack/react-query";
import { getPageGraph } from "@/features/knowledge-graph/services/graph-service.ts";
import {
  IPageGraph,
  IPageGraphParams,
} from "@/features/knowledge-graph/types/graph.types.ts";

const GRAPH_STALE_TIME = 30 * 1000;

export function usePageGraphQuery(
  params: IPageGraphParams,
  enabled: boolean,
) {
  return useQuery<IPageGraph>({
    queryKey: ["page-graph", params],
    queryFn: () => getPageGraph(params),
    enabled:
      enabled && (!!params.pageId || !!params.spaceId),
    staleTime: GRAPH_STALE_TIME,
  });
}
