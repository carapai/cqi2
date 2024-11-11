import { analyticsStructureQueryOptions } from "@/queryOptions";
import { Spacer, Stack } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useLoaderData, useNavigate, useSearch } from "@tanstack/react-router";
import { Button } from "antd";

import AdminTable from "./AdminTable";
import { downloadAdminDashboard } from "@/utils/utils";
import { useEffect, useState } from "react";
import { Dictionary } from "lodash";
export default function Admin() {
    const search = useSearch({ from: "/dashboards/$id" });
    const navigate = useNavigate({ from: "/dashboards/$id" });

    const { indicators } = useLoaderData({ from: "/dashboards" });

    const [currentIndicators, setCurrentIndicators] =
        useState<Array<Dictionary<string>>>(indicators);

    useEffect(() => {
        setCurrentIndicators(() => {
            if (
                search.pa &&
                search.pa.length > 0 &&
                search.ind &&
                search.ind.length > 0
            ) {
                return indicators.filter((i) => search.ind?.includes(i.event));
            } else if (search.pa && search.pa.length > 0) {
                return indicators.filter((i) =>
                    search.pa?.includes(i.kuVtv8R9n8q),
                );
            }
            return indicators;
        });
    }, [search.ind, search.pa, indicators]);
    const { isLoading, data } = useQuery(
        analyticsStructureQueryOptions({
            level: search.level,
            ou: search.ou,
            periods: search.periods,
            pa: search.pa,
            ind: search.ind,
        }),
    );
    if (isLoading || !data) return <p>Loading...</p>;

    return (
        <Stack>
            <Stack direction="row">
                <Spacer />
                <Button
                    type="primary"
                    shape="round"
                    onClick={() =>
                        navigate({
                            search: (s) => ({
                                ...s,
                                counting:
                                    s.counting === "projects"
                                        ? "units"
                                        : "projects",
                            }),
                        })
                    }
                >
                    {search.counting === "projects" ||
                    search.counting === undefined
                        ? "Count Units"
                        : "Count Projects"}
                </Button>
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
                    onClick={() => {
                        downloadAdminDashboard({
                            structure: data,
                            counting: search.counting,
                            indicators: currentIndicators,
                        });
                    }}
                >
                    Download Indicators
                </Button>
            </Stack>

            <AdminTable structure={data} />
        </Stack>
    );
}
