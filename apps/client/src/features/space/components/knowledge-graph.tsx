import { useEffect, useRef, useState } from 'react';
import { Modal, Button, Group, Text, Loader, Center } from '@mantine/core';
import * as echarts from 'echarts';
import { useTranslation } from 'react-i18next';
import { getSpaceGraph, KnowledgeGraph } from '../services/graph.service';
import { getPageTitle } from '@/features/page/page.utils';
import { buildPageUrl } from '@/features/page/page.utils';
import { useNavigate } from 'react-router-dom';

interface KnowledgeGraphProps {
    spaceId: string;
    spaceSlug: string;
    opened: boolean;
    onClose: () => void;
}

export function KnowledgeGraphModal({
    spaceId,
    spaceSlug,
    opened,
    onClose,
}: KnowledgeGraphProps) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const chartRef = useRef<HTMLDivElement>(null);
    const chartInstance = useRef<echarts.ECharts | null>(null);
    const [loading, setLoading] = useState(false);
    const [graphData, setGraphData] = useState<KnowledgeGraph | null>(null);

    useEffect(() => {
        if (!opened) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const data = await getSpaceGraph(spaceId);
                setGraphData(data);
            } catch (error) {
                console.error('Failed to fetch graph data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [opened, spaceId]);

    useEffect(() => {
        if (!opened || !chartRef.current || !graphData) return;

        // 初始化图表
        if (!chartInstance.current) {
            chartInstance.current = echarts.init(chartRef.current);
        }

        const chart = chartInstance.current;

        // 准备数据
        const nodes = graphData.nodes.map((node, index) => ({
            id: node.id,
            name: getPageTitle(node.title, undefined, t as any),
            symbolSize: Math.max(30, 50 - index * 0.5),
            itemStyle: {
                color: index === 0 ? '#4f46e5' : '#6366f1',
            },
            label: {
                show: true,
                position: 'bottom',
                fontSize: 12,
            },
        }));

        const links = graphData.edges.map(edge => ({
            source: edge.source,
            target: edge.target,
            lineStyle: {
                color: '#c7d2fe',
                width: 2,
                curveness: 0.1,
            },
        }));

        const option: echarts.EChartsOption = {
            tooltip: {
                formatter: (params: any) => {
                    return params.data.name || '';
                },
            },
            series: [
                {
                    type: 'graph',
                    layout: 'force',
                    data: nodes,
                    links: links,
                    roam: true,
                    draggable: true,
                    force: {
                        repulsion: 300,
                        gravity: 0.1,
                        edgeLength: [100, 200],
                    },
                    emphasis: {
                        focus: 'adjacency',
                        lineStyle: {
                            width: 4,
                        },
                    },
                },
            ],
        };

        chart.setOption(option);

        // 点击节点跳转到页面
        chart.on('click', (params: any) => {
            if (params.dataType === 'node') {
                const node = graphData.nodes.find(n => n.id === params.data.id);
                if (node) {
                    const url = buildPageUrl(spaceSlug, node.slugId || node.id, node.title || undefined);
                    navigate(url);
                    onClose();
                }
            }
        });

        // 响应式
        const handleResize = () => {
            chart.resize();
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [opened, graphData, spaceSlug, navigate, onClose, t]);

    // 销毁图表
    useEffect(() => {
        return () => {
            if (chartInstance.current) {
                chartInstance.current.dispose();
                chartInstance.current = null;
            }
        };
    }, []);

    return (
        <Modal.Root opened={opened} onClose={onClose} size="90%" yOffset="5vh">
            <Modal.Overlay />
            <Modal.Content>
                <Modal.Header>
                    <Modal.Title fw={500}>
                        <Group gap="xs">
                            <span>🧠</span>
                            <span>{t('Knowledge Graph')}</span>
                        </Group>
                    </Modal.Title>
                    <Modal.CloseButton aria-label={t('Close')} />
                </Modal.Header>
                <Modal.Body p={0}>
                    {loading ? (
                        <Center py="xl">
                            <Loader />
                        </Center>
                    ) : graphData && graphData.nodes.length > 0 ? (
                        <div
                            ref={chartRef}
                            style={{ width: '100%', height: '70vh' }}
                        />
                    ) : (
                        <Center py="xl">
                            <Text c="dimmed">
                                {t('No page connections found. Create links between pages to see the graph!')}
                            </Text>
                        </Center>
                    )}
                </Modal.Body>
            </Modal.Content>
        </Modal.Root>
    );
}