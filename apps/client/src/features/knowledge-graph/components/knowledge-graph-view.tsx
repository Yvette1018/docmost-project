import { useEffect, useRef } from "react";
import { Box, Center, Loader, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import * as echarts from "echarts/core";
import { GraphChart } from "echarts/charts";
import {
  TooltipComponent,
  LegendComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import {
  IGraphEdge,
  IGraphNode,
} from "@/features/knowledge-graph/types/graph.types.ts";
import { buildPageUrl, getPageTitle } from "@/features/page/page.utils.ts";

echarts.use([
  GraphChart,
  TooltipComponent,
  LegendComponent,
  CanvasRenderer,
]);

interface KnowledgeGraphViewProps {
  nodes: IGraphNode[];
  edges: IGraphEdge[];
  centerPageId?: string;
  height?: number | string;
  isLoading?: boolean;
}

export function KnowledgeGraphView({
  nodes,
  edges,
  centerPageId,
  height = 480,
  isLoading,
}: KnowledgeGraphViewProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);
  const nodeMapRef = useRef<Map<string, IGraphNode>>(new Map());

  useEffect(() => {
    if (!containerRef.current || isLoading) return;

    if (!chartRef.current) {
      chartRef.current = echarts.init(containerRef.current);
    }

    const chart = chartRef.current;
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));
    nodeMapRef.current = nodeMap;

    if (nodes.length === 0) {
      chart.clear();
      return;
    }

    const graphNodes = nodes.map((node) => ({
      id: node.id,
      name: getPageTitle(node.title, false, t),
      symbolSize: node.id === centerPageId ? 42 : 28,
      itemStyle: {
        color:
          node.id === centerPageId
            ? "var(--mantine-color-blue-6)"
            : "var(--mantine-color-gray-5)",
        borderColor:
          node.id === centerPageId
            ? "var(--mantine-color-blue-8)"
            : "var(--mantine-color-gray-6)",
        borderWidth: node.id === centerPageId ? 2 : 1,
      },
      label: {
        show: true,
        fontSize: 11,
        formatter: (params: { name: string }) => {
          const name = params.name;
          return name.length > 16 ? `${name.slice(0, 14)}…` : name;
        },
      },
    }));

    const graphLinks = edges.map((edge) => ({
      source: edge.source,
      target: edge.target,
      lineStyle: {
        color: "var(--mantine-color-gray-4)",
        curveness: 0.15,
      },
    }));

    chart.setOption(
      {
        tooltip: {
          trigger: "item",
          formatter: (params: { dataType: string; data: { name?: string } }) => {
            if (params.dataType === "node") {
              return params.data.name ?? "";
            }
            return t("Page link");
          },
        },
        series: [
          {
            type: "graph",
            layout: "force",
            roam: true,
            draggable: true,
            data: graphNodes,
            links: graphLinks,
            force: {
              repulsion: 280,
              edgeLength: [80, 160],
              gravity: 0.08,
            },
            emphasis: {
              focus: "adjacency",
              lineStyle: { width: 2 },
            },
          },
        ],
      },
      true,
    );

    const handleClick = (params: echarts.ECElementEvent) => {
      if (params.dataType !== "node") return;
      const data = params.data as { id?: string };
      if (!data?.id) return;
      const node = nodeMapRef.current.get(data.id);
      if (!node?.space) return;
      navigate(
        buildPageUrl(node.space.slug, node.slugId, node.title ?? undefined),
      );
    };

    chart.off("click");
    chart.on("click", handleClick);

    const handleResize = () => chart.resize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.off("click", handleClick);
    };
  }, [nodes, edges, centerPageId, isLoading, navigate, t]);

  useEffect(() => {
    return () => {
      chartRef.current?.dispose();
      chartRef.current = null;
    };
  }, []);

  if (isLoading) {
    return (
      <Center h={height}>
        <Loader size="md" />
      </Center>
    );
  }

  if (nodes.length === 0) {
    return (
      <Center h={height}>
        <Text size="sm" c="dimmed">
          {t("No page links to visualize yet.")}
        </Text>
      </Center>
    );
  }

  return (
    <Box
      ref={containerRef}
      style={{
        width: "100%",
        height,
        borderRadius: 8,
        border: "1px solid var(--mantine-color-gray-3)",
        background: "var(--mantine-color-body)",
      }}
    />
  );
}
