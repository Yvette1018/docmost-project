import { Group, Modal, Slider, Stack, Text } from "@mantine/core";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { usePageGraphQuery } from "@/features/knowledge-graph/queries/graph-query.ts";
import { KnowledgeGraphView } from "./knowledge-graph-view";

interface KnowledgeGraphModalProps {
  pageId: string;
  opened: boolean;
  onClose: () => void;
}

export function KnowledgeGraphModal({
  pageId,
  opened,
  onClose,
}: KnowledgeGraphModalProps) {
  const { t } = useTranslation();
  const [depth, setDepth] = useState(2);

  const { data, isLoading } = usePageGraphQuery(
    { pageId, depth, maxNodes: 80 },
    opened,
  );

  return (
    <Modal.Root opened={opened} onClose={onClose} size="xl" yOffset="5vh">
      <Modal.Overlay />
      <Modal.Content>
        <Modal.Header>
          <Modal.Title fw={500}>{t("Knowledge graph")}</Modal.Title>
          <Modal.CloseButton aria-label={t("Close")} />
        </Modal.Header>
        <Modal.Body>
          <Stack gap="md">
            <Group justify="space-between" wrap="nowrap">
              <Text size="sm" c="dimmed">
                {t("Explore page connections. Click a node to navigate.")}
              </Text>
              <Group gap="xs" wrap="nowrap" style={{ minWidth: 180 }}>
                <Text size="xs" c="dimmed">
                  {t("Depth")}: {depth}
                </Text>
                <Slider
                  value={depth}
                  onChange={setDepth}
                  min={1}
                  max={3}
                  step={1}
                  style={{ flex: 1, minWidth: 100 }}
                  size="xs"
                />
              </Group>
            </Group>

            <KnowledgeGraphView
              nodes={data?.nodes ?? []}
              edges={data?.edges ?? []}
              centerPageId={data?.centerPageId ?? pageId}
              isLoading={isLoading}
              height={520}
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
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
}
