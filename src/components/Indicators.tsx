import { Spacer, Stack } from "@chakra-ui/react";
import { useLoaderData, useNavigate, useSearch } from "@tanstack/react-router";
import IndicatorList from "@/components/IndicatorList";
import { Button } from "antd";
import { useQuery } from "@tanstack/react-query";
import { analyticsStructureQueryOptions } from "@/queryOptions";
import { Dictionary } from "lodash";
import { downloadIndicators } from "@/utils/utils";
import { useEffect, useState } from "react";
import { Loading } from "@/components/Loading";

export default function Indicators() {
    const navigate = useNavigate({ from: "/dashboards/$id" });
    const search = useSearch({ from: "/dashboards/$id" });
    const { indicators } = useLoaderData({ from: "__root__" });

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
    if (isLoading || !data) return <Loading />;
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
                                filter: s.filter === "ou" ? "period" : "ou",
                            }),
                        })
                    }
                >
                    {search.filter === "ou"
                        ? "View by Organization "
                        : "View by Period"}
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
                    onClick={() =>
                        downloadIndicators({
                            structure: data,
                            indicators: currentIndicators,
                            filter: search.filter,
                        })
                    }
                >
                    Download Indicators
                </Button>
            </Stack>
            <IndicatorList structure={data} />
        </Stack>
    );
}
