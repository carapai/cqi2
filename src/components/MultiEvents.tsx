import { Event } from "@/interfaces";
import { generateUid } from "@/utils/uid";
import { reviewPeriodString } from "@/utils/utils";
import { Spacer, Stack, Text } from "@chakra-ui/react";
import { useLoaderData, useParams, useSearch } from "@tanstack/react-router";
import type { TableProps } from "antd";
import { Button, DatePicker, InputNumber, Table } from "antd";
import dayjs from "dayjs";
import { isEmpty } from "lodash";
import { useState } from "react";
import { ReactEChartsProps, ReactECharts } from "@/components/LineGraph";

export default function MultiEvents({
    events,
}: {
    events?: Array<Partial<Event>>;
}) {
    const { attributesObject } = useLoaderData({
        from: "/data-entry/$program/tracked-entities_/$entity/",
    });
    const { program, entity } = useParams({
        from: "/data-entry/$program/tracked-entities_/$entity/",
    });
    const { ou, stage } = useSearch({
        from: "/data-entry/$program/tracked-entities_/$entity/",
    });
    const { WQcY6nfPouv } = attributesObject ?? {};
    const [availableEvents, setAvailableEvents] = useState<
        Array<Partial<Event>>
    >(events ?? []);

    const option: ReactEChartsProps["option"] = {
        xAxis: {
            type: "category",
            data: availableEvents.map(
                (event) => dayjs(event.eventDate).format("YYYY-MM") ?? "",
            ),
        },
        yAxis: {
            type: "value",
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
                        numerator &&
                        denominator &&
                        numerator.value &&
                        denominator.value
                    ) {
                        console.log("Nothing");
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

    const onChange = (
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
    };
    const onDateChange = (event: string | undefined, value: string | null) => {
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

        ...availableEvents.map((event) => {
            const numerator = event.dataValues?.find(
                ({ dataElement }) => dataElement === "rVZlkzOwWhi",
            );
            const denominator = event.dataValues?.find(
                ({ dataElement }) => dataElement === "RgNQcLejbwX",
            );
            const currentDate = !isEmpty(event.eventDate)
                ? dayjs(event.eventDate)
                : null;

            return {
                title: (
                    <DatePicker
                        picker={reviewPeriodString(WQcY6nfPouv)}
                        value={currentDate}
                        onChange={(date) =>
                            onDateChange(
                                event.event,
                                date?.format("YYYY-MM-DD"),
                            )
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
                                value={numerator?.value}
                                onChange={(value) =>
                                    onChange("rVZlkzOwWhi", event.event, value)
                                }
                                style={{ textAlign: "center" }}
                            />
                        );
                    }
                    if (row.name === "Denominator") {
                        return (
                            <InputNumber
                                value={denominator?.value}
                                onChange={(value) =>
                                    onChange("RgNQcLejbwX", event.event, value)
                                }
                                style={{ textAlign: "center" }}
                            />
                        );
                    }
                    if (
                        numerator &&
                        denominator &&
                        numerator.value &&
                        denominator.value
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
                },
            };
        }),
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
        <Stack h="780px">
            <ReactECharts option={option} />
            <Table
                columns={columns}
                dataSource={data}
                pagination={false}
                rowKey="key"
                size="small"
                footer={() => (
                    <Stack direction="row" alignItems="center">
                        <Spacer />
                        <Button onClick={add}>Add Review</Button>
                    </Stack>
                )}
                scroll={{ x: "max-content" }}
            />
        </Stack>
    );
}
