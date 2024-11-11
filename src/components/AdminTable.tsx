import { AnalyticsStructure } from "@/interfaces";
import { rawDataQueryOptions } from "@/queryOptions";
import { Stack } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useLoaderData, useSearch } from "@tanstack/react-router";
import type { TableProps } from "antd";
import { Table } from "antd";
import { Dictionary, isArray, uniq } from "lodash";
import { useEffect, useState } from "react";

export default function AdminTable({
    structure,
}: {
    structure: AnalyticsStructure;
}) {
    const { counting } = useSearch({ from: "/dashboards/$id" });
    const { indicators } = useLoaderData({ from: "/dashboards" });
    const { level, ou, periods, pa, ind } = useSearch({
        from: "/dashboards/$id",
    });
    const [currentIndicators, setCurrentIndicators] =
        useState<Array<Dictionary<string>>>(indicators);

    useEffect(() => {
        setCurrentIndicators(() => {
            if (pa && pa.length > 0 && ind && ind.length > 0) {
                return indicators.filter((i) => ind?.includes(i.event));
            } else if (pa && pa.length > 0) {
                return indicators.filter((i) => pa?.includes(i.kuVtv8R9n8q));
            }
            return indicators;
        });
    }, [ind, pa, indicators]);

    const { isLoading, data } = useQuery(
        rawDataQueryOptions({ level, ou, periods, pa, ind }),
    );
    if (isLoading || !data) return <p>Loading...</p>;

    const columns: TableProps<{ ou: string }>["columns"] = [
        {
            title: "Organisation",
            key: "ou",
            render: (_, row) =>
                String(structure.metaData.ouNameHierarchy[row.ou]).slice(1),
        },
        ...structure.metaData.dimensions.pe.map((pe) => {
            const available = data.filter(
                (d) => isArray(d.periods) && d.periods?.includes(pe),
            );
            return {
                title: structure.metaData.items[pe].name,
                key: pe,
                children: [
                    {
                        title: "Total",
                        key: "total",
                        render: (_: string, record: { ou: string }) => {
                            const filtered = available
                                .filter(
                                    (a) =>
                                        isArray(a.path) &&
                                        a.path.includes(record["ou"]),
                                )
                                .map((a) => a.pi);

                            return uniq(filtered).length;
                        },
                    },
                    {
                        title: "Running",
                        key: "running",
                        render: (_: string, record: { ou: string }) => {
                            const filtered = available
                                .filter(
                                    (a) =>
                                        a["eZrfD4QnQfl"] === "" &&
                                        isArray(a.path) &&
                                        a.path.includes(record["ou"]),
                                )
                                .map((a) => a.pi);

                            return uniq(filtered).length;
                        },
                    },
                    {
                        title: "Completed",
                        key: "completed",
                        render: (_: string, record: { ou: string }) => {
                            const filtered = available
                                .filter(
                                    (a) =>
                                        a["eZrfD4QnQfl"] &&
                                        isArray(a.path) &&
                                        a.path.includes(record["ou"]),
                                )
                                .map((a) => a.pi);

                            return uniq(filtered).length;
                        },
                    },
                ],
            };
        }),
    ];

    const columns2: TableProps<Record<string, string>>["columns"] = [
        {
            title: "Indicator",
            key: "kToJ1rk0fwY",
            dataIndex: "kToJ1rk0fwY",
        },
        ...structure.metaData.dimensions.pe.map((pe) => {
            const available = data.filter(
                (d) => isArray(d.periods) && d.periods.includes(pe),
            );
            return {
                title: structure.metaData.items[pe].name,
                key: pe,
                children: [
                    {
                        title: "Total",
                        key: "total",
                        render: (_: string, record: Record<string, string>) => {
                            const filtered = available.flatMap((a) => {
                                if (a["kHRn35W3Gq4"] === record["event"]) {
                                    return a["ou"];
                                }
                                return [];
                            });

                            return uniq(filtered).length;
                        },
                    },
                    {
                        title: "Running",
                        key: "running",
                        render: (_: string, record: Record<string, string>) => {
                            const filtered = available.flatMap((a) => {
                                if (
                                    a["eZrfD4QnQfl"] === "" &&
                                    a["kHRn35W3Gq4"] === record["event"]
                                ) {
                                    return a["ou"];
                                }
                                return [];
                            });

                            return uniq(filtered).length;
                        },
                    },
                    {
                        title: "Completed",
                        key: "completed",
                        render: (_: string, record: Record<string, string>) => {
                            const filtered = available.flatMap((a) => {
                                if (
                                    a["eZrfD4QnQfl"] &&
                                    a["kHRn35W3Gq4"] === record["event"]
                                ) {
                                    return a["ou"];
                                }
                                return [];
                            });

                            return uniq(filtered).length;
                        },
                    },
                ],
            };
        }),
    ];
    return (
        <Stack>
            {counting === "projects" || counting === undefined ? (
                <Table
                    scroll={{ x: "max-content" }}
                    bordered
                    style={{ whiteSpace: "nowrap" }}
                    columns={columns}
                    dataSource={structure.metaData.dimensions.ou.map((ou) => ({
                        ou,
                    }))}
                    rowKey="ou"
                    pagination={{ pageSize: 9 }}
                />
            ) : (
                <Table
                    scroll={{ x: "max-content" }}
                    bordered
                    style={{ whiteSpace: "nowrap" }}
                    columns={columns2}
                    dataSource={currentIndicators}
                    rowKey="event"
                    pagination={{ pageSize: 9 }}
                />
            )}
        </Stack>
    );
}
