import { Event, ProgramStageDataElement } from "@/interfaces";
import { Table, Button, Select } from "antd";
import type { TableProps } from "antd";
import { Spacer, Stack } from "@chakra-ui/react";
import { useState } from "react";
import { generateUid } from "@/utils/uid";
import { useParams, useSearch } from "@tanstack/react-router";
import { formElements } from "./form-elements";
import dayjs from "dayjs";

export default function EventTable({
    events,
    programStageDataElements,
}: {
    events?: Array<Partial<Event>>;
    programStageDataElements: ProgramStageDataElement[];
}) {
    const [currentEvent, setCurrentEvent] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { ou, stage } = useSearch({
        from: "/data-entry/$program/tracked-entities_/$entity/",
    });
    const { program, entity } = useParams({
        from: "/data-entry/$program/tracked-entities_/$entity/",
    });
    const [availableEvents, setAvailableEvents] = useState<
        Array<Partial<Event>>
    >(events ?? []);
    const columns: TableProps<Partial<Event>>["columns"] = [
        {
            title: "Review Period",
            dataIndex: "name",
            key: "name",
            width: 150,
            minWidth: 150,
            fixed: "left",
            render: (_: string, row: Partial<Event>) => {
                const value = row.eventDate;
                if (row.event === currentEvent) {
                    const Element = formElements["DATE"];

                    return (
                        <Element
                            onBlur={() => {}}
                            onChange={(value) =>
                                onChangeEventDate(currentEvent, value)
                            }
                            value={value}
                        />
                    );
                }
                if (value) {
                    return dayjs(value).format("YYYY-MM-DD");
                }
                return value;
            },
        },

        ...programStageDataElements.map(
            ({
                dataElement: {
                    id,
                    name,
                    formName,
                    valueType,
                    optionSetValue,
                    optionSet,
                },
            }) => {
                return {
                    title: formName || name,
                    key: id,
                    render: (_: string, row: Partial<Event>) => {
                        const value = row.dataValues?.find(
                            (dv) => dv.dataElement === id,
                        );
                        if (row.event === currentEvent) {
                            const Element = formElements[valueType];

                            if (optionSetValue) {
                                return (
                                    <Select
                                        style={{ width: "100%" }}
                                        showSearch
                                        allowClear
                                        placeholder="Select a person"
                                        value={value?.value}
                                        filterOption={(input, option) =>
                                            (option?.label ?? "")
                                                .toLowerCase()
                                                .includes(input.toLowerCase())
                                        }
                                        options={optionSet?.options}
                                        onChange={(value) =>
                                            onChange(currentEvent, id, value)
                                        }
                                    />
                                );
                            }

                            return (
                                <Element
                                    onBlur={() => {}}
                                    onChange={(value) =>
                                        onChange(currentEvent, id, value)
                                    }
                                    value={value?.value}
                                />
                            );
                        }
                        if (
                            valueType === "DATE" ||
                            (valueType === "DATETIME" && value?.value)
                        ) {
                            return dayjs(value?.value).format("YYYY-MM-DD");
                        }
                        return value?.value;
                    },
                };
            },
        ),
        {
            title: "Actions",
            fixed: "right",
            align: "center",
            key: "action",
            width: 90,
            render: (_: string, row: Partial<Event>) => (
                <Stack direction="row" alignItems="center" gap={2}>
                    <Button danger>Delete</Button>
                    {currentEvent === row.event ? (
                        <Button
                            onClick={() => onSave()}
                            loading={isLoading && row.event === currentEvent}
                            type="primary"
                        >
                            Save
                        </Button>
                    ) : (
                        <Button
                            onClick={() => setCurrentEvent(row.event ?? "")}
                            type="primary"
                        >
                            Edit
                        </Button>
                    )}
                </Stack>
            ),
        },
    ];

    const add = () => {
        const event = generateUid();
        setAvailableEvents((prev) => {
            if (prev) {
                return [
                    ...prev,
                    {
                        event,
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
        setCurrentEvent(event);
    };
    const onChange = (event: string, dataElement: string, value: string) => {
        const newEvents: Array<Partial<Event>> = availableEvents.map(
            (currentEvent) => {
                const dataValue = currentEvent.dataValues?.find(
                    (dv) => dv.dataElement === dataElement,
                );
                if (currentEvent.event === event) {
                    return {
                        ...currentEvent,
                        dataValues:
                            dataValue === undefined
                                ? [
                                      ...(currentEvent?.dataValues ?? []),
                                      { dataElement, value },
                                  ]
                                : currentEvent.dataValues?.map((dv) =>
                                      dv.dataElement === dataElement
                                          ? { ...dv, value }
                                          : dv,
                                  ),
                    };
                }
                return currentEvent;
            },
        );
        setAvailableEvents(newEvents);
    };

    const onChangeEventDate = (event: string, value: string) => {
        const newEvents: Array<Partial<Event>> = availableEvents.map(
            (currentEvent) => {
                if (currentEvent.event === event) {
                    return {
                        ...currentEvent,
                        eventDate: value,
                    };
                }
                return currentEvent;
            },
        );
        setAvailableEvents(newEvents);
    };
    const onSave = async () => {
        setIsLoading(() => true);
        await new Promise((resolve) => setTimeout(resolve, 3000));
        setIsLoading(() => false);
        setCurrentEvent(() => "");
    };
    return (
        <Table
            columns={columns}
            dataSource={availableEvents}
            pagination={false}
            size="small"
            rowKey="event"
            footer={() => (
                <Stack direction="row" alignItems="center">
                    <Spacer />
                    <Button onClick={() => add()}>Add Changes Worksheet</Button>
                </Stack>
            )}
            scroll={{ x: "max-content" }}
        />
    );
}
