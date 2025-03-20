import { Loading } from "@/components/Loading";
import { AnalyticsStructure } from "@/interfaces";
import { rawDataQueryOptions } from "@/queryOptions";
import { computerIndicator, downloadLayered } from "@/utils/utils";
import { Spacer, Stack } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useSearch } from "@tanstack/react-router";
import type { TableProps } from "antd";
import { Button, Table } from "antd";
import { isArray } from "lodash";
export default function Layered({
    structure,
}: {
    structure: AnalyticsStructure;
}) {
    const { ind } = useSearch({
        from: "/dashboards/$id",
    });
    const { isLoading, data } = useQuery(rawDataQueryOptions());
    if (isLoading || !data) return <Loading />;

    const columns: TableProps<{ ou: string }>["columns"] = [
        "ou",
        ...structure.metaData.dimensions.pe,
    ].map((pe, index) => {
        if (index === 0) {
            return {
                title: "Organisation",
                key: "ou",
                render: (_, row) => structure.metaData.items[row.ou].name,
                align: "left",
            };
        }

        return {
            title: structure.metaData.items[pe].name,
            key: pe,
            align: "center",
            render: (_: string, { ou }: { ou: string }) => {
                const indicators = isArray(ind) ? ind : ind ? [ind] : [];
                const available = data.filter(
                    (i) =>
                        isArray(i.path) &&
                        i.path.includes(ou) &&
                        indicators.includes(String(i.kHRn35W3Gq4)) &&
                        isArray(i.periods) &&
                        i.periods?.includes(pe),
                );

                if (available.length > 0) {
                    const indicator = computerIndicator(available);

                    return Intl.NumberFormat("en-US", {
                        style: "percent",
                    }).format(indicator.value);
                }
                return "-";
            },

            onCell: ({ ou }: { ou: string }) => {
                const indicators = isArray(ind) ? ind : ind ? [ind] : [];
                const available = data.filter(
                    (i) =>
                        isArray(i.path) &&
                        i.path.includes(ou) &&
                        indicators.includes(String(i.kHRn35W3Gq4)) &&
                        isArray(i.periods) &&
                        i.periods?.includes(pe),
                );

                const indicator = computerIndicator(available);
                let color = "";
                if (available.length === 0 || isNaN(indicator.value)) {
                    color = "";
                } else if (indicator.value * 100 <= 50) {
                    color = "red";
                } else if (
                    indicator.value * 100 > 50 &&
                    indicator.value * 100 < 75
                ) {
                    color = "yellow";
                } else if (indicator.value * 100 >= 75) {
                    color = "green";
                }
                return {
                    ["style"]: { background: color },
                };
            },
        };
    });
    return (
        <Stack>
            <Stack direction="row">
                <Spacer />
                <Button
                    type="primary"
                    shape="round"
                    style={{
                        backgroundColor: "#4CAF50",
                        borderColor: "#4CAF50",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        fontWeight: "bold",
                    }}
                    onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#45A049")
                    }
                    onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "#4CAF50")
                    }
                    onClick={() =>
                        downloadLayered({
                            structure,
                            indicator:
                                ind && isArray(ind) ? ind[0] : ind ? ind : "",
                        })
                    }
                >
                    Download
                </Button>
            </Stack>
            <Table
                scroll={{ x: "max-content" }}
                bordered
                style={{ whiteSpace: "nowrap" }}
                columns={columns}
                dataSource={structure.metaData.dimensions.ou.map((ou) => ({
                    ou,
                }))}
                rowKey="ou"
            />
        </Stack>
    );
}
