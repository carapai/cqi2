import OrgUnitSelect from "@/components/OrgUnitSelect";
import PeriodPicker from "@/components/PeriodPicker";
import { db } from "@/db";
import { DashboardQueryValidator, Option } from "@/interfaces";
import {
    Box,
    FormControl,
    FormLabel,
    Spacer,
    Stack,
    Text,
} from "@chakra-ui/react";
import {
    createFileRoute,
    Outlet,
    useLoaderData,
    useNavigate,
    useSearch,
} from "@tanstack/react-router";
import { Select } from "antd";
import { isArray } from "lodash";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/dashboards")({
    component: DashboardComponent,
    validateSearch: DashboardQueryValidator,
});

const findIndicators = (
    indicators: Array<Record<string, string>>,
    pa: string | string[] | undefined,
) => {
    return indicators
        .filter((row: Record<string, string>) => {
            if (pa && isArray(pa)) {
                return pa.includes(row["kuVtv8R9n8q"]);
            } else if (pa) {
                return pa === row["kuVtv8R9n8q"];
            }
            return false;
        })
        .map(({ kToJ1rk0fwY, event }) => ({
            label: `${kToJ1rk0fwY}`,
            value: event,
        }));
};

function DashboardComponent() {
    const { pa, ind, level, ou, periods, mode } = useSearch({
        from: Route.fullPath,
    });
    const navigate = useNavigate({ from: Route.fullPath });

    const { indicators, options, organisationUnitLevels } = useLoaderData({
        from: "__root__",
    });

    const [filteredIndicators, setFilteredIndicators] = useState<Array<Option>>(
        [],
    );

    useEffect(() => {
        setFilteredIndicators(() => findIndicators(indicators, pa));
    }, [ind, pa, indicators]);

    return (
        <Stack h="calc(100vh - 48px)" overflow="auto">
            <Stack
                spacing={6}
                p={2}
                bgColor="white"
                borderRadius="md"
                boxShadow="sm"
                h="192px"
                maxH="192px"
                minH="192px"
            >
                <Text fontWeight="bold" color="teal.700">
                    Dashboard Filters
                </Text>

                <Stack direction="row" spacing={6} w="100%">
                    <FormControl
                        flex={1}
                        display="flex"
                        flexDirection="row"
                        alignItems="center"
                        justifyItems="center"
                    >
                        <FormLabel
                            fontSize="sm"
                            fontWeight="bold"
                            color="gray.600"
                            mb={1}
                        >
                            Program Area
                        </FormLabel>
                        <Box flex={1}>
                            <Select
                                value={pa}
                                style={{
                                    width: "100%",
                                    borderRadius: "8px",
                                    borderColor: "#cbd5e0",
                                }}
                                showSearch
                                filterOption={(input, option) =>
                                    (option?.label ?? "")
                                        .toLowerCase()
                                        .includes(input.toLowerCase())
                                }
                                onChange={(value) => {
                                    const foundIndicators = findIndicators(
                                        indicators,
                                        value,
                                    );
                                    setFilteredIndicators(
                                        () => foundIndicators,
                                    );
                                    navigate({
                                        search: (s) => ({
                                            ...s,
                                            pa: value,
                                            ind:
                                                mode === "multiple"
                                                    ? undefined
                                                    : foundIndicators?.[0]
                                                          ?.value,
                                        }),
                                    });
                                }}
                                maxTagCount={4}
                                mode={mode}
                                options={options.map((a) => ({
                                    label: a.name,
                                    value: a.code,
                                }))}
                                allowClear
                            />
                        </Box>
                    </FormControl>
                    <FormControl
                        flex={1}
                        display="flex"
                        flexDirection="row"
                        alignItems="center"
                        justifyItems="center"
                    >
                        <FormLabel
                            fontSize="sm"
                            fontWeight="bold"
                            color="gray.600"
                            mb={1}
                        >
                            Indicator
                        </FormLabel>
                        <Box flex={1}>
                            <Select
                                value={ind}
                                showSearch
                                filterOption={(input, option) =>
                                    (option?.label ?? "")
                                        .toLowerCase()
                                        .includes(input.toLowerCase())
                                }
                                style={{
                                    width: "100%",
                                    borderRadius: "8px",
                                    borderColor: "#cbd5e0",
                                }}
                                onChange={(value) => {
                                    navigate({
                                        search: (s) => ({
                                            ...s,
                                            ind: value,
                                        }),
                                    });
                                }}
                                mode={mode}
                                options={filteredIndicators}
                                maxTagCount={2}
                                allowClear
                            />
                        </Box>
                    </FormControl>
                </Stack>

                <Stack direction="row" spacing={6} w="100%">
                    <FormControl
                        flex={1}
                        display="flex"
                        flexDirection="row"
                        alignItems="center"
                        justifyItems="center"
                    >
                        <FormLabel
                            fontSize="sm"
                            fontWeight="bold"
                            color="gray.600"
                            mb={1}
                        >
                            Organisation
                        </FormLabel>
                        <Box
                            width="100%"
                            borderRadius="8px"
                            borderColor="#cbd5e0"
                        >
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
                                    value={ou}
                                    isMulti
                                />
                            </Box>
                        </Box>
                    </FormControl>
                    <FormControl
                        flex={1}
                        display="flex"
                        flexDirection="row"
                        alignItems="center"
                        justifyItems="center"
                    >
                        <FormLabel
                            fontSize="sm"
                            fontWeight="bold"
                            color="gray.600"
                            mb={1}
                        >
                            Level
                        </FormLabel>
                        <Box flex={1}>
                            <Select
                                disabled={!ou}
                                allowClear
                                value={level}
                                style={{
                                    width: "100%",
                                    borderRadius: "8px",
                                    borderColor: "#cbd5e0",
                                }}
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
                    </FormControl>
                    <Spacer />
                    <FormControl
                        flex={1}
                        display="flex"
                        flexDirection="row"
                        alignItems="center"
                        justifyItems="center"
                    >
                        <FormLabel
                            fontSize="sm"
                            fontWeight="bold"
                            color="gray.600"
                            mb={1}
                        >
                            Period
                        </FormLabel>
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
                    </FormControl>
                </Stack>
            </Stack>

            <Stack
                spacing={6}
                p={2}
                bgColor="white"
                borderRadius="md"
                boxShadow="sm"
                h="calc(100vh - 48px - 192px)"
                overflow="auto"
            >
                <Outlet />
            </Stack>
        </Stack>
    );
}
