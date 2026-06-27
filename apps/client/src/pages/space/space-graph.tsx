import { Container, Stack, Text, Title } from "@mantine/core";
import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useGetSpaceBySlugQuery } from "@/features/space/queries/space-query.ts";
import { usePageGraphQuery } from "@/features/knowledge-graph/queries/graph-query.ts";
import { KnowledgeGraphView } from "@/features/knowledge-graph/components/knowledge-graph-view";
import { getAppName } from "@/lib/config.ts";

export default function SpaceGraph() {
  const { t } = useTranslation();
  const { spaceSlug } = useParams();
  const { data: space } = useGetSpaceBySlugQuery(spaceSlug);
  const { data, isLoading } = usePageGraphQuery(
    { spaceId: space?.id, maxNodes: 100 },
    !!space?.id,
  );

  return (
    <>
      <Helmet>
        <title>
          {t("Knowledge graph")} - {space?.name ?? spaceSlug} - {getAppName()}
        </title>
      </Helmet>
      <Container size="xl" pt="xl" pb="xl">
        <Stack gap="md">
          <Stack gap={4}>
            <Title order={3}>{t("Knowledge graph")}</Title>
            <Text size="sm" c="dimmed">
              {t(
                "Visual map of page references in this space. Click a node to open the page.",
              )}
            </Text>
          </Stack>

          <KnowledgeGraphView
            nodes={data?.nodes ?? []}
            edges={data?.edges ?? []}
            isLoading={isLoading}
            height="calc(100vh - 220px)"
          />

          {!isLoading && data && (
            <Text size="xs" c="dimmed" ta="center">
              {t("{{nodes}} pages, {{edges}} links", {
                nodes: data.nodes.length,
                edges: data.edges.length,
              })}
            </Text>
          )}
        </Stack>
      </Container>
    </>
  );
}
