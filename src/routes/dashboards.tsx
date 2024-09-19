import { dashboardsQueryOptions } from "@/queryOptions";
import { Stack } from "@chakra-ui/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { z } from "zod";
import {
    createFileRoute,
    Outlet,
    useNavigate,
    useSearch,
} from "@tanstack/react-router";
import { Button, Select } from "antd";
import OrgUnitSelect from "@/components/OrgUnitSelect";
import { db } from "@/db";
import PeriodPicker from "@/components/PeriodPicker";

export const Route = createFileRoute("/dashboards")({
    component: DashboardComponent,
    validateSearch: z.object({
        pa: z.string().optional(),
        ind: z.string().optional(),
        level: z.number().optional(),
        ou: z.string().optional(),
        periods: z.any().array().optional(),
    }),
    loader: ({ context: { queryClient } }) =>
        queryClient.ensureQueryData(dashboardsQueryOptions),
});

function DashboardComponent() {
    const {
        data: { options, indicators, organisationUnitLevels },
    } = useSuspenseQuery(dashboardsQueryOptions);
    const { pa, ind, level, ou, periods } = useSearch({ from: "/dashboards" });
    const navigate = useNavigate({ from: "/dashboards" });

    const filteredIndicators = indicators
        .filter((row: Record<string, string>) => row["kuVtv8R9n8q"] === pa)
        .map(({ kToJ1rk0fwY, event }) => ({
            label: kToJ1rk0fwY,
            value: event,
        }));
    return (
        <Stack>
            <Select
                value={pa}
                style={{ width: "100%" }}
                onChange={(value) => {
                    navigate({
                        search: (s) => ({
                            ...s,
                            pa: value,
                        }),
                    });
                }}
                options={options.map((a) => ({ label: a.name, value: a.code }))}
            />
            <Select
                value={ind}
                style={{ width: "100%" }}
                onChange={(value) => {
                    navigate({
                        search: (s) => ({
                            ...s,
                            ind: value,
                        }),
                    });
                }}
                options={filteredIndicators}
            />
            <Select
                value={level}
                style={{ width: "100%" }}
                onChange={(value) => {
                    navigate({
                        search: (s) => ({
                            ...s,
                            level: value,
                        }),
                    });
                }}
                options={organisationUnitLevels.map(({ name, level }) => ({
                    label: name,
                    value: level,
                }))}
            />
            <OrgUnitSelect
                table={db.dataViewOrgUnits}
                onChange={(value) =>
                    navigate({
                        search: (s) => ({
                            ...s,
                            ou: value,
                        }),
                    })
                }
                value={ou ?? ""}
            />
            <PeriodPicker
                periods={periods}
                changePeriod={(periods) =>
                    navigate({
                        search: (s) => ({
                            ...s,
                            periods,
                        }),
                    })
                }
            />
            <Button>Download</Button>
            <Outlet />;
        </Stack>
    );
}
