import { AnalyticsStructure } from "@/interfaces";
import { rawDataQueryOptions } from "@/queryOptions";
import { computerIndicator } from "@/utils/utils";
// import { computerIndicator } from "@/utils/utils";
import { useQuery } from "@tanstack/react-query";
import { useLoaderData, useSearch } from "@tanstack/react-router";
import type { TableProps } from "antd";
import { Table } from "antd";
import { Dictionary, isArray } from "lodash";
import { useEffect, useState } from "react";

export default function IndicatorList({
    structure,
}: {
    structure: AnalyticsStructure;
}) {
    const { indicators } = useLoaderData({ from: "/dashboards" });
    const { level, ou, periods, pa, ind, filter } = useSearch({
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
    const columns: TableProps<Record<string, string>>["columns"] = [
        {
            title: "Indicator",
            key: "kToJ1rk0fwY",
            dataIndex: "kToJ1rk0fwY",
            fixed: "left",
        },
        ...(filter && filter === "ou"
            ? structure.metaData.dimensions.pe.map((pe) => ({
                  title: structure.metaData.items[pe].name,
                  children: [
                      {
                          title: "N",
                          key: "n",
                          render: (_: string, row: Record<string, string>) => {
                              const filtered = data.filter((d) => {
                                  return (
                                      d.kHRn35W3Gq4 === row.event &&
                                      isArray(d.periods) &&
                                      d.periods.includes(pe)
                                  );
                              });
                              const { numerator } = computerIndicator(filtered);
                              return numerator;
                          },
                      },
                      {
                          title: "D",
                          key: "d",
                          render: (_: string, row: Record<string, string>) => {
                              const filtered = data.filter((d) => {
                                  return (
                                      d.kHRn35W3Gq4 === row.event &&
                                      isArray(d.periods) &&
                                      d.periods.includes(pe)
                                  );
                              });
                              const { denominator } =
                                  computerIndicator(filtered);
                              return denominator;
                          },
                      },
                      {
                          title: "%",
                          key: "percent",
                          render: (_: string, row: Record<string, string>) => {
                              const filtered = data.filter((d) => {
                                  return (
                                      d.kHRn35W3Gq4 === row.event &&
                                      isArray(d.periods) &&
                                      d.periods.includes(pe)
                                  );
                              });
                              const { value } = computerIndicator(filtered);
                              return Intl.NumberFormat("en-US", {
                                  style: "percent",
                              }).format(value);
                          },
                          onCell: (row: Record<string, string>) => {
                              const filtered = data.filter((d) => {
                                  return (
                                      d.kHRn35W3Gq4 === row.event &&
                                      isArray(d.periods) &&
                                      d.periods.includes(pe)
                                  );
                              });
                              const value =
                                  100 * computerIndicator(filtered).value;
                              let color = "red";

                              if (value >= 50) {
                                  color = "yellow";
                              }

                              if (value >= 75) {
                                  color = "green";
                              }

                              return {
                                  ["style"]: { background: color },
                              };
                          },
                      },
                  ],
                  //   key: pe,
                  //   render: (_: string, row: Record<string, string>) => {
                  //       const filtered = data.filter((d) => {
                  //           return (
                  //               d.kHRn35W3Gq4 === row.event &&
                  //               isArray(d.periods) &&
                  //               d.periods.includes(pe)
                  //           );
                  //       });
                  //       const indicator = computerIndicator(filtered);
                  //       return Intl.NumberFormat("en-US", {
                  //           style: "percent",
                  //       }).format(indicator);
                  //   },

                  //   onCell: (row: Record<string, string>) => {
                  //       const filtered = data.filter((d) => {
                  //           return (
                  //               d.kHRn35W3Gq4 === row.event &&
                  //               isArray(d.periods) &&
                  //               d.periods.includes(pe)
                  //           );
                  //       });
                  //       const value = 100 * computerIndicator(filtered);
                  //       let color = "red";

                  //       if (value >= 50) {
                  //           color = "yellow";
                  //       }

                  //       if (value >= 75) {
                  //           color = "green";
                  //       }

                  //       return {
                  //           ["style"]: { background: color },
                  //       };
                  //   },
              }))
            : structure.metaData.dimensions.ou.map((ou) => ({
                  title: structure.metaData.items[ou].name,
                  key: ou,
                  children: [
                      {
                          title: "N",
                          key: "n",
                      },
                      {
                          title: "D",
                          key: "d",
                      },
                      {
                          title: "%",
                          key: "percent",
                      },
                  ],
                  //   render: (_: string, row: Record<string, string>) => {
                  //       const filtered = data.filter((d) => {
                  //           return (
                  //               d.kHRn35W3Gq4 === row.event &&
                  //               isArray(d.path) &&
                  //               d.path.includes(ou)
                  //           );
                  //       });
                  //       const indicator = computerIndicator(filtered);
                  //       return Intl.NumberFormat("en-US", {
                  //           style: "percent",
                  //       }).format(indicator);
                  //   },

                  //   onCell: (row: Record<string, string>) => {
                  //       const filtered = data.filter((d) => {
                  //           return (
                  //               d.kHRn35W3Gq4 === row.event &&
                  //               isArray(d.path) &&
                  //               d.path.includes(ou)
                  //           );
                  //       });
                  //       const value = 100 * computerIndicator(filtered);
                  //       let color = "red";

                  //       if (value >= 50) {
                  //           color = "yellow";
                  //       }

                  //       if (value >= 75) {
                  //           color = "green";
                  //       }

                  //       return {
                  //           ["style"]: { background: color },
                  //       };
                  //   },
              }))),
    ];

    return (
        <Table
            scroll={{ x: "max-content" }}
            bordered
            style={{ whiteSpace: "nowrap" }}
            columns={columns}
            dataSource={currentIndicators}
            rowKey="event"
        />
    );
}
