import { DisplayInstance, TrackerValidator } from "@/interfaces";
import { trackedEntitiesQueryOptions } from "@/queryOptions";
import { generateUid } from "@/utils/uid";
import { Spacer, Stack } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import {
    createFileRoute,
    useLoaderData,
    useNavigate,
    useParams,
    useSearch,
} from "@tanstack/react-router";
import { Table, type TableProps, Button } from "antd";
import { useCallback, useMemo } from "react";

export const Route = createFileRoute("/data-entry/$program/tracked-entities")({
    component: DataEntryProgramTrackedEntitiesComponent,
    validateSearch: TrackerValidator,
});

function DataEntryProgramTrackedEntitiesComponent() {
    const {
        ou,
        page: currentPage,
        pageSize: currentPageSize,
        registration,
        type,
    } = useSearch({
        from: Route.fullPath,
    });
    const { program } = useParams({ from: Route.fullPath });
    const navigate = useNavigate({ from: Route.fullPath });
    const { program: currentProgram } = useLoaderData({
        from: "/data-entry/$program",
    });
    const { data, isError, isLoading, error } = useQuery(
        trackedEntitiesQueryOptions({
            ou,
            program,
            page: currentPage ?? 1,
            pageSize: currentPageSize ?? 10,
            registration,
        }),
    );

    const columns: TableProps<DisplayInstance>["columns"] = useMemo(
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
        [currentProgram],
    );

    const handleTableChange = useCallback(
        (page: number, pageSize: number) => {
            navigate({
                search: (s) => {
                    if (pageSize !== currentPageSize) {
                        return {
                            ...s,
                            page: 1,
                            pageSize,
                        };
                    }
                    return {
                        ...s,
                        page,
                        pageSize: currentPageSize,
                    };
                },
            });
        },
        [currentPageSize, navigate],
    );

    if (isError) return <div>{JSON.stringify(error)}</div>;

    if (registration) {
        return (
            <Stack
                borderRadius="md"
                boxShadow="0 0 10px rgba(0, 0, 0, 0.1)"
                p="10px"
            >
                <Stack direction="row">
                    <Spacer />
                    <Button
                        onClick={() =>
                            navigate({
                                to: "/data-entry/$program/tracked-entities/$entity/form",
                                params: { entity: generateUid(), program },
                                search: () => ({
                                    ou,
                                    registration,
                                    disabled: true,
                                    editing: false,
                                    type,
                                }),
                            })
                        }
                    >
                        Add
                    </Button>
                </Stack>
                <Table
                    loading={isLoading}
                    scroll={{ x: "max-content" }}
                    bordered
                    style={{ whiteSpace: "nowrap" }}
                    columns={[
                        ...columns,
                        {
                            title: "Edit",
                            fixed: "right",
                            key: "action",
                            width: 90,
                            render: (_, row) => (
                                <Button
                                    onClick={() =>
                                        navigate({
                                            to: "/data-entry/$program/tracked-entities/$entity/form",
                                            params: {
                                                entity: String(
                                                    row.trackedEntityInstance,
                                                ),
                                                program,
                                            },
                                            search: () => ({
                                                ou,
                                                registration,
                                                disabled: true,
                                                editing: true,
                                                type,
                                            }),
                                        })
                                    }
                                >
                                    Edit
                                </Button>
                            ),
                        },

                        {
                            title: "Details",
                            fixed: "right",
                            key: "action",
                            width: 90,
                            render: (_, row) => (
                                <Button
                                    onClick={() =>
                                        navigate({
                                            to: "/data-entry/$program/tracked-entities/$entity",
                                            params: {
                                                entity: String(
                                                    row.trackedEntityInstance,
                                                ),
                                                program,
                                            },
                                            search: () => ({
                                                ou,
                                                registration,
                                                disabled: true,
                                                editing: true,
                                                type,
                                            }),
                                        })
                                    }
                                >
                                    Details
                                </Button>
                            ),
                        },
                    ]}
                    dataSource={data?.trackedEntities}
                    rowKey="trackedEntityInstance"
                    pagination={{
                        pageSize: currentPageSize,
                        total: data?.total,
                        current: currentPage,
                        onChange: handleTableChange,
                    }}
                />
            </Stack>
        );
    }
    return <div>{JSON.stringify(data)}</div>;
}
