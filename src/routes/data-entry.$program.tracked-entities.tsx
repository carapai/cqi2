import { deleteDHIS2Resource, postDHIS2Resource } from "@/dhis2";
import { DisplayInstance, TrackerValidator } from "@/interfaces";
import { trackedEntitiesQueryOptions } from "@/queryOptions";
import { generateUid } from "@/utils/uid";
import { Spacer, Stack, Text } from "@chakra-ui/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createFileRoute,
    useLoaderData,
    useNavigate,
    useParams,
    useSearch,
} from "@tanstack/react-router";
import { Button, Radio, Table, Popconfirm, type TableProps } from "antd";
import dayjs from "dayjs";
import { isEmpty, omit } from "lodash";
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
        ouMode,
    } = useSearch({
        from: Route.fullPath,
    });
    const { program } = useParams({ from: Route.fullPath });
    const navigate = useNavigate({ from: Route.fullPath });
    const { program: currentProgram } = useLoaderData({
        from: "/data-entry/$program",
    });
    const queryClient = useQueryClient();

    const { indicatorsObject, programAreas } = useLoaderData({
        from: "__root__",
    });
    const { data, isError, isLoading, error } = useQuery(
        trackedEntitiesQueryOptions({
            ou,
            program,
            page: currentPage ?? 1,
            pageSize: currentPageSize ?? 10,
            registration,
            ouMode: ouMode ?? "DESCENDANTS",
        }),
    );

    const completeProject = useCallback(
        async (complete: boolean, instance: DisplayInstance) => {
            const changedObject: DisplayInstance = {
                ...instance,
                attributesObject: {
                    ...instance.attributesObject,
                    ["eZrfD4QnQfl"]: String(complete),
                },
                attributes: [
                    ...(instance?.attributes ?? []),
                    { attribute: "eZrfD4QnQfl", value: String(complete) },
                ],
            };

            const trackedEntityInstance = omit(changedObject, [
                "attributesObject",
                "firstEnrollment",
                "program",
            ]);
            try {
                await postDHIS2Resource({
                    resource: "trackedEntityInstances",
                    data: {
                        trackedEntityInstances: [trackedEntityInstance],
                    },
                    params: { async: "false" },
                });
                queryClient.setQueryData<{
                    trackedEntities: DisplayInstance[];
                    total: number;
                }>(
                    [
                        "programs",
                        program,
                        ou,
                        registration,
                        currentPage ?? 1,
                        currentPageSize ?? 10,
                        ouMode,
                    ],
                    (oldData) => {
                        const trackedEntities =
                            oldData?.trackedEntities.map((i) => {
                                if (
                                    i.trackedEntityInstance ===
                                    instance.trackedEntityInstance
                                ) {
                                    return changedObject;
                                }
                                return i;
                            }) ?? [];

                        return { trackedEntities, total: oldData?.total ?? 0 };
                    },
                );
            } catch (error) {
                console.log(error);
            }
        },
        [
            currentPage,
            currentPageSize,
            ou,
            program,
            queryClient,
            registration,
            ouMode,
        ],
    );

    const deleteProject = useCallback(
        async (instance: DisplayInstance) => {
            try {
                await deleteDHIS2Resource({
                    resource: "trackedEntityInstances",
                    id: instance.trackedEntityInstance ?? "",
                });
                queryClient.setQueryData<{
                    trackedEntities: DisplayInstance[];
                    total: number;
                }>(
                    [
                        "programs",
                        program,
                        ou,
                        registration,
                        currentPage ?? 1,
                        currentPageSize ?? 10,
                        ouMode,
                    ],
                    (oldData) => {
                        const trackedEntities =
                            oldData?.trackedEntities.filter(
                                (i) =>
                                    i.trackedEntityInstance !==
                                    instance.trackedEntityInstance,
                            ) ?? [];

                        return { trackedEntities, total: oldData?.total ?? 0 };
                    },
                );
            } catch (error) {
                console.log(error);
            }
        },
        [
            currentPage,
            currentPageSize,
            ou,
            program,
            queryClient,
            registration,
            ouMode,
        ],
    );

    const columns: TableProps<DisplayInstance>["columns"] = useMemo(() => {
        return currentProgram.programTrackedEntityAttributes.flatMap(
            (row, index) => {
                const {
                    trackedEntityAttribute: { id, name, valueType },
                    displayInList,
                } = row;
                if (displayInList) {
                    if (index === 0) {
                        return {
                            fixed: "left",
                            ellipsis: true,
                            title: name,
                            key: id,
                            render: (_, row) => {
                                if (
                                    valueType === "DATE" &&
                                    row.attributesObject?.[id]
                                ) {
                                    return (
                                        <Text>
                                            {dayjs(
                                                row.attributesObject?.[id],
                                            ).format("DD/MM/YYYY")}
                                        </Text>
                                    );
                                }
                                return (
                                    <Text>
                                        {row.attributesObject?.[id] ?? ""}
                                    </Text>
                                );
                            },
                        };
                    }

                    if (id === "kHRn35W3Gq4") {
                        return [
                            {
                                title: name,
                                ellipsis: true,
                                key: id,
                                render: (_, row) => {
                                    const { kToJ1rk0fwY } =
                                        indicatorsObject[
                                            row.attributesObject?.[id] ?? ""
                                        ] ?? {};
                                    return <Text>{kToJ1rk0fwY}</Text>;
                                },
                            },
                            {
                                title: "Numerator",
                                ellipsis: true,
                                key: `${id}WI6Qp8gcZFX`,
                                render: (_, row) => {
                                    const { WI6Qp8gcZFX } =
                                        indicatorsObject[
                                            row.attributesObject?.[id] ?? ""
                                        ] ?? {};
                                    return <Text>{WI6Qp8gcZFX}</Text>;
                                },
                            },
                            {
                                title: "Denominator",
                                ellipsis: true,
                                key: `${id}krwzUepGwj7`,
                                render: (_, row) => {
                                    const { krwzUepGwj7 } =
                                        indicatorsObject[
                                            row.attributesObject?.[id] ?? ""
                                        ] ?? {};
                                    return <Text>{krwzUepGwj7}</Text>;
                                },
                            },
                        ];
                    }

                    if (id === "TG1QzFgGTex") {
                        return {
                            title: name,
                            ellipsis: true,
                            key: id,
                            render: (_, row) => (
                                <Text>
                                    {
                                        programAreas[
                                            row.attributesObject?.[id] ?? ""
                                        ]
                                    }
                                </Text>
                            ),
                        };
                    }

                    if (id === "eZrfD4QnQfl") {
                        return {
                            title: "Completed",
                            ellipsis: true,
                            key: id,
                            align: "center",
                            fixed: "right",
                            render: (_, row) => {
                                return (
                                    <Popconfirm
                                        title="Complete the Project"
                                        description="Are you sure to complete this project?"
                                        onConfirm={() =>
                                            completeProject(true, row)
                                        }
                                        okText="Yes"
                                        cancelText="No"
                                    >
                                        <Radio
                                            checked={
                                                !isEmpty(
                                                    row.attributesObject?.[id],
                                                )
                                            }
                                        />
                                    </Popconfirm>
                                );
                            },
                        };
                    }
                    return {
                        title: name,
                        ellipsis: true,
                        key: id,
                        render: (_, row) => {
                            console.log(row);
                            if (
                                valueType === "DATE" &&
                                row.attributesObject?.[id]
                            ) {
                                return (
                                    <Text>
                                        {dayjs(
                                            row.attributesObject?.[id],
                                        ).format("DD/MM/YYYY")}
                                    </Text>
                                );
                            }
                            return (
                                <Text>{row.attributesObject?.[id] ?? ""}</Text>
                            );
                        },
                    };
                }
                return [];
            },
        );
    }, [currentProgram, indicatorsObject, programAreas, completeProject]);

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
                                owner: ou,
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
                    {
                        title: "Organisation",
                        key: "path",
                        dataIndex: "path",
                        // fixed: "left",
                    },
                    ...columns,

                    {
                        title: "Actions",
                        fixed: "right",
                        key: "action",
                        render: (_, row) => {
                            return (
                                <Stack direction="row" alignItems={"center"}>
                                    <Button
                                        onClick={(e) => {
                                            e.preventDefault();
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
                                            });
                                        }}
                                        type="primary"
                                    >
                                        Details
                                    </Button>
                                    <Button
                                        onClick={(e) => {
                                            e.preventDefault();
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
                                                    owner: row.orgUnit ?? "",
                                                }),
                                            });
                                        }}
                                    >
                                        Edit
                                    </Button>

                                    <Popconfirm
                                        title="Delete the Project"
                                        description="Are you sure to delete this project?"
                                        onConfirm={() => deleteProject(row)}
                                        okText="Yes"
                                        cancelText="No"
                                    >
                                        <Button danger>Delete</Button>
                                    </Popconfirm>
                                </Stack>
                            );
                        },
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
