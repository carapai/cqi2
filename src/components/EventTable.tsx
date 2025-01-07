import { Event, ProgramStageDataElement } from "@/interfaces";
import { Table, Button, Select } from "antd";
import type { TableProps } from "antd";
import { Spacer, Stack } from "@chakra-ui/react";
import { useState } from "react";
import { generateUid } from "@/utils/uid";
import { useLoaderData, useParams, useSearch } from "@tanstack/react-router";
import { formElements } from "./form-elements";
import dayjs from "dayjs";
import { deleteDHIS2Resource, postDHIS2Resource } from "@/dhis2";

export default function EventTable({
    events,
    programStageDataElements,
    label,
}: {
    events?: Array<Partial<Event>>;
    programStageDataElements: ProgramStageDataElement[];
    label: string;
}) {
    const [currentEvent, setCurrentEvent] = useState<string>("");
    const [isSaved, setIsSaved] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const { stage } = useSearch({
        from: "/data-entry/$program/tracked-entities_/$entity/",
    });
    const { orgUnit } = useLoaderData({
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
									disabledDate={id === "kHRn35W3Gq4" ? (currentDate) => dayjs().isBefore(currentDate) : undefined}
                                />
                            );
                        }
                        if (
                            valueType === "DATE" ||
                            (valueType === "DATETIME" && value?.value)
                        ) {
                            if (value && value.value) {
                                return dayjs(value.value).format("YYYY-MM-DD");
                            }
							return ""
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
            render: (_, { event = "" }) => (
                <Stack direction="row" alignItems="center" gap={2}>
                    {currentEvent === event ? (
                        <>
                            <Button onClick={() => cancel(event)}>
                                Cancel
                            </Button>
                            <Button
                                onClick={() => onSave()}
                                loading={isLoading && event === currentEvent}
                                type="primary"
                            >
                                Save
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button onClick={() => edit(event)} type="primary">
                                Edit
                            </Button>
                            <Button
                                danger
                                onClick={() => onDelete(event)}
                                loading={isDeleting && event === currentEvent}
                            >
                                Delete
                            </Button>
                        </>
                    )}
                </Stack>
            ),
        },
    ];

    const cancel = (event: string) => {
        if (isSaved) {
            setCurrentEvent(() => "");
        } else {
            setAvailableEvents((prev) => prev.filter((e) => e.event !== event));
        }
    };

    const edit = (event: string) => {
        setCurrentEvent(() => event);
        setIsSaved(() => true);
    };

    const onDelete = async (event: string) => {
        setCurrentEvent(() => event);
        setIsDeleting(() => true);
        try {
            if (isSaved) {
                await deleteDHIS2Resource({
                    resource: "events",
                    id: event,
                });
            }
            setAvailableEvents((prev) => prev.filter((e) => e.event !== event));
        } catch (error) {
            console.log(error);
        } finally {
            setIsDeleting(() => false);
            setCurrentEvent(() => "");
        }
    };

    const add = () => {
        setIsSaved(() => false);
        const event = generateUid();
        setAvailableEvents((prev) => [
            ...prev,
            {
                event,
                orgUnit,
                dataValues: [],
                eventDate: "",
                program,
                trackedEntityInstance: entity,
                programStage: stage,
            },
        ]);
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
        try {
            await postDHIS2Resource({
                data: {
                    events: availableEvents.filter(
                        (e) => e.event === currentEvent,
                    ),
                },
                resource: "events",
            });
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(() => false);
            setCurrentEvent(() => "");
        }
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
                    <Button onClick={() => add()}>{label}</Button>
                </Stack>
            )}
            scroll={{ x: "max-content" }}
        />
    );
}
