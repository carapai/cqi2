import { ReactECharts, ReactEChartsProps } from "@/components/LineGraph";
import { deleteDHIS2Resource, postDHIS2Resource } from "@/dhis2";
import { Event } from "@/interfaces";
import { generateUid } from "@/utils/uid";
import { reviewPeriodString } from "@/utils/utils";
import { Box, Stack, Text } from "@chakra-ui/react";
import { useLoaderData, useParams, useSearch } from "@tanstack/react-router";
import type { TableProps } from "antd";
import { Button, DatePicker, InputNumber, Table } from "antd";
import dayjs from "dayjs";
import { isEmpty } from "lodash";
import { useState } from "react";

export default function MultiEvents({
    events,
}: {
    events?: Array<Partial<Event>>;
}) {
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [currentEvent, setCurrentEvent] = useState<string>("");
    const { indicatorsObject } = useLoaderData({
        from: "__root__",
    });

    const { attributesObject } = useLoaderData({
        from: "/data-entry/$program/tracked-entities_/$entity/",
    });
    const { program, entity } = useParams({
        from: "/data-entry/$program/tracked-entities_/$entity/",
    });
    const { ou, stage } = useSearch({
        from: "/data-entry/$program/tracked-entities_/$entity/",
    });
    const { WQcY6nfPouv, kHRn35W3Gq4 } = attributesObject ?? {};

    const { WI6Qp8gcZFX, krwzUepGwj7, kToJ1rk0fwY } =
        indicatorsObject[kHRn35W3Gq4] ?? {};
    const [availableEvents, setAvailableEvents] = useState<
        Array<Partial<Event>>
    >(events ?? []);

    const option: ReactEChartsProps["option"] = {
        title: {
            text: kToJ1rk0fwY,
            textStyle: {
                fontSize: 12,
                overflow: "truncate",
                ellipsis: "...",
            },
        },
        xAxis: {
            type: "category",
            data: availableEvents.map(
                (event) => dayjs(event.eventDate).format("YYYY-MM") ?? "",
            ),
        },
        yAxis: {
            type: "value",
            axisLabel: {
                formatter: "{value}%",
            },
        },
        series: [
            {
                data: availableEvents.map((event) => {
                    const numerator = event.dataValues?.find(
                        ({ dataElement }) => dataElement === "rVZlkzOwWhi",
                    );
                    const denominator = event.dataValues?.find(
                        ({ dataElement }) => dataElement === "RgNQcLejbwX",
                    );
                    if (
                        numerator !== undefined &&
                        denominator !== undefined &&
                        numerator.value !== undefined &&
                        denominator.value !== undefined &&
                        numerator.value !== "" &&
                        denominator.value !== "" &&
                        denominator.value !== "0"
                    ) {
                        return (
                            (Number(numerator.value) * 100) /
                            Number(denominator.value)
                        );
                    }
                    return 0;
                }),
                type: "line",
            },
        ],
        grid: {
            left: "40px",
            right: "40px",
            bottom: "40px",
            top: "40px",
        },
    };

    const onChange = async (
        dataElement: string,
        event: string | undefined,
        value: string | null,
    ) => {
        const newEvents: Array<Partial<Event>> = availableEvents.map(
            (currentEvent) => {
                if (currentEvent.event === event) {
                    if (
                        currentEvent.dataValues &&
                        currentEvent.dataValues.length > 0
                    ) {
                        const currentDataElement = currentEvent.dataValues.find(
                            (dv) => dataElement === dv.dataElement,
                        );

                        if (currentDataElement) {
                            return {
                                ...currentEvent,
                                dataValues: currentEvent.dataValues.map(
                                    (dataValue) => {
                                        if (
                                            dataValue.dataElement ===
                                            dataElement
                                        ) {
                                            return {
                                                ...dataValue,
                                                value: value ?? "",
                                            };
                                        }
                                        return dataValue;
                                    },
                                ),
                            };
                        }
                        return {
                            ...currentEvent,
                            dataValues: [
                                ...currentEvent.dataValues,
                                {
                                    dataElement,
                                    value: value ?? "",
                                },
                            ],
                        };
                    } else {
                        return {
                            ...currentEvent,
                            dataValues: [
                                {
                                    dataElement,
                                    value: value ?? "",
                                },
                            ],
                        };
                    }
                }
                return currentEvent;
            },
        );
        setAvailableEvents(newEvents);

        const updatedEvent = newEvents.find((e) => e.event === event);
        if (updatedEvent) {
            try {
                await postDHIS2Resource({
                    resource: "events",
                    data: {
                        events: [updatedEvent],
                    },
                });
            } catch (error) {
                console.log(error);
            }
        }
    };
    const onDateChange = async (
        event: string | undefined,
        value: string | null,
    ) => {
        const newEvents: Array<Partial<Event>> = availableEvents.map(
            (currentEvent) => {
                if (currentEvent.event === event) {
                    return {
                        ...currentEvent,
                        eventDate: value ?? "",
                    };
                }
                return currentEvent;
            },
        );
        setAvailableEvents(newEvents);
        const updatedEvent = newEvents.find((e) => e.event === event);
        if (updatedEvent) {
            try {
                await postDHIS2Resource({
                    resource: "events",
                    data: {
                        events: [updatedEvent],
                    },
                });
            } catch (error) {
                console.log(error);
            }
        }
    };

    const onDelete = async (event: string) => {
        setCurrentEvent(() => event);
        setIsDeleting(() => true);
        try {
            await deleteDHIS2Resource({
                resource: "events",
                id: event,
            });
            setAvailableEvents((prev) => prev.filter((e) => e.event !== event));
        } catch (error) {
            console.log(error);
        } finally {
            setIsDeleting(() => false);
            setAvailableEvents((prev) => prev.filter((e) => e.event !== event));
        }
    };
    const columns: TableProps<Record<string, string>>["columns"] = [
        {
            title: "Review Period",
            dataIndex: "name",
            key: "name",
            width: 150,
            minWidth: 150,
            fixed: "left",
            render: (text) => <a>{text}</a>,
        },
        ...availableEvents.map(
            ({ event = "", dataValues = [], eventDate = "" }) => {
                const numerator = dataValues.find(
                    ({ dataElement }) => dataElement === "rVZlkzOwWhi",
                );
                const denominator = dataValues.find(
                    ({ dataElement }) => dataElement === "RgNQcLejbwX",
                );
                const currentDate = !isEmpty(eventDate)
                    ? dayjs(eventDate)
                    : null;

                return {
                    title: (
                        <DatePicker
                            picker={reviewPeriodString(WQcY6nfPouv)}
                            value={currentDate}
                            onChange={(date) =>
                                onDateChange(event, date?.format("YYYY-MM-DD"))
                            }
                        />
                    ),
                    key: "analytics",
                    width: 175,
                    minWidth: 175,
                    render: (_: string, row: Record<string, string>) => {
                        if (row.name === "Numerator") {
                            return (
                                <InputNumber
                                    disabled={currentDate === null}
                                    value={numerator?.value}
                                    onChange={(value) =>
                                        onChange("rVZlkzOwWhi", event, value)
                                    }
                                    style={{ textAlign: "center" }}
                                />
                            );
                        }
                        if (row.name === "Denominator") {
                            return (
                                <InputNumber
                                    disabled={currentDate === null}
                                    value={denominator?.value}
                                    onChange={(value) =>
                                        onChange("RgNQcLejbwX", event, value)
                                    }
                                    style={{ textAlign: "center" }}
                                />
                            );
                        }
                        if (row.name === "Indicator") {
                            if (
                                numerator !== undefined &&
                                denominator !== undefined &&
                                numerator.value !== undefined &&
                                denominator.value !== undefined &&
                                numerator.value !== "" &&
                                denominator.value !== "" &&
                                denominator.value !== "0"
                            ) {
                                return (
                                    <Text>
                                        {Intl.NumberFormat("en-GB", {
                                            notation: "standard",
                                            style: "percent",
                                        }).format(
                                            Number(numerator.value) /
                                                Number(denominator.value),
                                        )}
                                    </Text>
                                );
                            }
                            return "N/A";
                        }
                        if (row.name === "Action") {
                            return (
                                <Button
                                    type="primary"
                                    danger
                                    loading={
                                        isDeleting && event === currentEvent
                                    }
                                    onClick={() => onDelete(event)}
                                >
                                    Delete
                                </Button>
                            );
                        }
                    },
                };
            },
        ),
    ];

    const data: Array<Record<string, string>> = [
        {
            key: "2",
            name: "Numerator",
        },
        {
            key: "3",
            name: "Denominator",
        },
        {
            key: "4",
            name: "Indicator",
        },
        {
            key: "5",
            name: "Action",
        },
    ];

    const add = () => {
        setAvailableEvents((prev) => {
            if (prev) {
                return [
                    ...prev,
                    {
                        event: generateUid(),
                        orgUnit: ou,
                        dataValues: [],
                        eventDate: "",
                        program,
                        trackedEntityInstance: entity,
                        programStage: stage,
                    },
                ];
            }
            return [];
        });
    };

    return (
        <Stack h="740px">
            <ReactECharts option={option} />
            <Table
                columns={columns}
                dataSource={data}
                pagination={false}
                rowKey="key"
                size="small"
                footer={() => (
                    <Stack direction="row" alignItems="center">
                        <Stack flex={1} direction="row" alignItems="center">
                            <Text fontWeight="bold">Numerator:</Text>
                            <Text>{WI6Qp8gcZFX}</Text>
                        </Stack>
                        <Stack flex={1} direction="row" alignItems="center">
                            <Text fontWeight="bold">Denominator:</Text>
                            <Text>{krwzUepGwj7}</Text>
                        </Stack>
                        <Box>
                            <Button onClick={add}>Add Review</Button>
                        </Box>
                    </Stack>
                )}
                scroll={{ x: "max-content" }}
            />
        </Stack>
    );
}
