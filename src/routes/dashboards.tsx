import OrgUnitSelect from "@/components/OrgUnitSelect";
import PeriodPicker from "@/components/PeriodPicker";
import { db } from "@/db";
import { DashboardQueryValidator } from "@/interfaces";
import { dashboardsQueryOptions } from "@/queryOptions";
import { Box, Spacer, Stack, Text } from "@chakra-ui/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
    createFileRoute,
    Outlet,
    useNavigate,
    useSearch,
} from "@tanstack/react-router";
import { Select } from "antd";

export const Route = createFileRoute("/dashboards")({
    component: DashboardComponent,
    validateSearch: DashboardQueryValidator,
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
            <Stack direction="row" alignItems="center" gap="10px" w="100%">
                <Stack direction="row" alignItems="center" gap="10px" flex={1}>
                    <Text>Program Area</Text>
                    <Box flex={1}>
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
                            options={options.map((a) => ({
                                label: a.name,
                                value: a.code,
                            }))}
                        />
                    </Box>
                </Stack>
                <Stack direction="row" alignItems="center" gap="10px" flex={1}>
                    <Text>Indicator</Text>
                    <Box flex={1}>
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
                    </Box>
                </Stack>
            </Stack>
            <Stack direction="row" alignItems="center" gap="10px" w="100%">
                <Stack direction="row" alignItems="center" gap="10px" flex={1}>
                    <Text>Organisation</Text>
                    <Box flex={1}>
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
                    </Box>
                </Stack>
                <Stack direction="row" alignItems="center" gap="10px" flex={1}>
                    <Text>Level</Text>
                    <Box flex={1}>
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
                            options={organisationUnitLevels.map(
                                ({ name, level }) => ({
                                    label: name,
                                    value: level,
                                }),
                            )}
                        />
                    </Box>
                </Stack>
                <Spacer />
                <Stack direction="row" alignItems="center" gap="10px" flex={1}>
                    <Text>Period</Text>
                    <Box flex={1}>
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
                    </Box>
                </Stack>
            </Stack>
            <Outlet />;
        </Stack>
    );
}
