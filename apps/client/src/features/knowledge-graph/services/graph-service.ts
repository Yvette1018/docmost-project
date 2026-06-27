import api from "@/lib/api-client";
import {
  IPageGraph,
  IPageGraphParams,
} from "@/features/knowledge-graph/types/graph.types.ts";

export async function getPageGraph(
  params: IPageGraphParams,
): Promise<IPageGraph> {
  const req = await api.post<IPageGraph>("/pages/graph", params);
  return req.data;
}
