import { programQueryOptions } from "@/queryOptions";

import OrgUnitSelect from "@/components/OrgUnitSelect";
import { db } from "@/db";
import { Box, Stack, Text } from "@chakra-ui/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
    createFileRoute,
    Outlet,
    useLoaderData,
    useNavigate,
    useParams,
    useSearch,
} from "@tanstack/react-router";
import { Select } from "antd";
import { isArray } from "lodash";
import { Loading } from "@/components/Loading";

export const Route = createFileRoute("/data-entry/$program")({
    component: DataEntryProgramComponent,
    loader: ({ context: { queryClient }, params: { program } }) =>
        queryClient.ensureQueryData(programQueryOptions(program)),
    pendingComponent: () => <Loading />,
});

function DataEntryProgramComponent() {
    const navigate = useNavigate({ from: Route.fullPath });
    const { program } = useParams({ from: Route.fullPath });
    const { programs } = useLoaderData({ from: "__root__" });
    const { ou, disabled } = useSearch({ from: Route.fullPath });
    useSuspenseQuery(programQueryOptions(program));
    return (
        <Stack spacing="5px">
            <Stack
                direction="row"
                width="100%"
                bgColor="white"
                // borderRadius="md"
                boxShadow="0 0 10px rgba(0, 0, 0, 0.1)"
                p="10px"
            >
                <Stack direction="row" flex={1} alignItems="center">
                    <Text>Organisation</Text>
                    <Box flex={1}>
                        <OrgUnitSelect
                            disabled={disabled}
                            table={db.organisationUnits}
                            onChange={(ou) => {
                                const currentOu = isArray(ou)
                                    ? ou[0]
                                    : (ou ?? "");
                                navigate({
                                    search: (s) => ({ ...s, ou: currentOu }),
                                });
                            }}
                            value={ou}
                        />
                    </Box>
                </Stack>
                <Stack direction="row" flex={1} alignItems="center">
                    <Text>Program</Text>
                    <Box flex={1}>
                        <Select
                            value={program}
                            disabled={disabled}
                            style={{
                                width: "100%",
                                borderRadius: "8px",
                                borderColor: "#cbd5e0",
                            }}
                            onChange={(value, option) => {
                                const currentOpt = isArray(option)
                                    ? option.find((a) => a.value === value)
                                    : option;
                                navigate({
                                    to: "/data-entry/$program/tracked-entities",
                                    params: { program: value },
                                    search: (s) => ({
                                        ...s,
                                        page: 1,
                                        pageSize: 10,
                                        ou: ou ?? "",
                                        type:
                                            currentOpt?.trackedEntityType ?? "",
                                        registration:
                                            currentOpt?.registration ?? false,
                                    }),
                                });
                            }}
                            options={programs.map((a) => {
                                return {
                                    label: a.name,
                                    value: a.id,
                                    registration: a.registration,
                                    trackedEntityType: a.trackedEntityType?.id,
                                };
                            })}
                            allowClear
                        />
                    </Box>
                </Stack>
            </Stack>
            <Outlet />
        </Stack>
    );
}
