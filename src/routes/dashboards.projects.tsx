import { InstanceDisplay } from "@/interfaces";
import { trackedEntityInstancesOptions } from "@/queryOptions";
import { Spacer, Stack } from "@chakra-ui/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
    createFileRoute,
    useNavigate,
    useSearch,
} from "@tanstack/react-router";
import { Button, Table, TableProps } from "antd";
import { range } from "lodash";
import { useMemo } from "react";

export const Route = createFileRoute("/dashboards/projects")({
    component: ProjectsComponent,
    loaderDeps: ({ search }) => search,
    loader: ({ context: { queryClient }, deps }) =>
        queryClient.ensureQueryData(
            trackedEntityInstancesOptions("vMfIVFcRWlu", deps),
        ),
});

function ProjectsComponent() {
    const search = useSearch({ from: Route.fullPath });
    const navigate = useNavigate({ from: Route.fullPath });
    const {
        data: { processed, currentProgram, total },
    } = useSuspenseQuery(trackedEntityInstancesOptions("vMfIVFcRWlu", search));

    const columns: TableProps<InstanceDisplay>["columns"] = useMemo(
        () =>
            currentProgram.programTrackedEntityAttributes.flatMap(
                (
                    { trackedEntityAttribute: { id, name }, displayInList },
                    index,
                ) => {
                    if (displayInList) {
                        if (index === 0) {
                            return {
                                width: 200,
                                fixed: "left",
                                title: name,
                                key: id,
                                render: (_, row) => row.attributesObject?.[id],
                            };
                        }
                        return {
                            title: name,
                            ellipsis: true,
                            key: id,
                            render: (_, row) => row.attributesObject?.[id],
                        };
                    }
                    return [];
                },
            ),
        [currentProgram.programTrackedEntityAttributes],
    );

    const performanceColumns: TableProps<InstanceDisplay>["columns"] = useMemo(
        () =>
            range(12).map((i) => ({
                title: `Period ${i + 1}`,
                key: i,
                children: [
                    {
                        title: "N",
                        render: (_, row) => row.attributesObject?.[`${i}n`],
                    },
                    {
                        title: "D",
                        render: (_, row) => row.attributesObject?.[`${i}d`],
                    },
                ],
            })),
        [],
    );

    return (
        <Stack>
            <Stack direction="row">
                <Spacer />
                <Button>Download Projects</Button>
            </Stack>
            <Table
                scroll={{ x: "max-content" }}
                bordered
                style={{ whiteSpace: "nowrap" }}
                columns={[...columns, ...performanceColumns]}
                dataSource={processed}
                rowKey="trackedEntity"
                pagination={{
                    pageSize: search.pageSize,
                    total,
                    current: search.page,
                    onChange: (page, pageSize) => {
                        navigate({
                            search: (s) => {
                                if (pageSize !== search.pageSize) {
                                    return {
                                        ...s,
                                        page: 1,
                                        pageSize,
                                    };
                                }
                                return { ...s, page };
                            },
                        });
                    },
                }}
            />
        </Stack>
    );
}
