import { FormElement } from "@/components/FormElement";
import {
    DisplayInstance,
    Event,
    OptionSet,
    ProgramStageSection,
    ValueType,
} from "@/interfaces";
import type { DatePickerProps, TableProps } from "antd";
import { useCallback, useMemo, useState } from "react";

import { Box, Spacer, Stack, Text } from "@chakra-ui/react";
import { Button, DatePicker, Table } from "antd";
import dayjs from "dayjs";
import { sum } from "lodash";
import { useParams, useSearch, useNavigate } from "@tanstack/react-router";
import { postDHIS2Resource } from "@/dhis2";

interface TableDataRecord {
    key: string;
    id: string;
    sortOrder: number;
    programStageName: string;
    dataElement: string;
    value: string;
    sectionIndex: number;
    isFirstInSection: boolean;
    isDescription?: boolean;
    description?: string;
    optionSet?: OptionSet;
    optionSetValue: boolean;
    multiple: boolean;
    valueType: ValueType;
    fieldToAdd?: string[];
}

export default function SMAndESheet({
    programStageSections,
    displayInstance,
}: {
    programStageSections: ProgramStageSection[];
    displayInstance: DisplayInstance;
}) {
    const [currentInstance, setCurrentInstance] = useState<
        DisplayInstance | undefined
    >(displayInstance);
    const navigate = useNavigate();
    const [loading, setLoading] = useState<boolean>(false);

    const { owner } = useSearch({
        from: "/data-entry/$program/tracked-entities_/$entity/form",
    });
    const { entity, program } = useParams({
        from: "/data-entry/$program/tracked-entities_/$entity/form",
    });

    const fieldsToAdd = useCallback(() => {
        return programStageSections.reduce<
            Record<string, { numerator: string[]; denominator: number }>
        >((acc, current, index) => {
            if (index < programStageSections.length - 1) {
                current.dataElements.forEach((element, index) => {
                    if (index === current.dataElements.length - 2) {
                        acc[element.id] = {
                            numerator: [],
                            denominator: 1,
                        };
                        acc[element.id].numerator = current.dataElements
                            .slice(0, current.dataElements.length - 2)
                            .map((a) => a.id);
                        acc[element.id].denominator = 1;
                    } else if (index === current.dataElements.length - 1) {
                        acc[element.id] = {
                            numerator: [],
                            denominator: 1,
                        };
                        acc[element.id].numerator = current.dataElements
                            .slice(0, current.dataElements.length - 2)
                            .map((a) => a.id);
                        acc[element.id].denominator =
                            3 * (current.dataElements.length - 2);
                    }
                });
            } else {
                current.dataElements.forEach((element, index) => {
                    if (index === 0) {
                        acc[element.id] = {
                            numerator: [],
                            denominator: 1,
                        };
                        acc[element.id].numerator =
                            programStageSections.flatMap((current, index) => {
                                if (index === programStageSections.length - 1) {
                                    return [];
                                }
                                return current.dataElements
                                    .slice(0, current.dataElements.length - 2)
                                    .map((a) => a.id);
                            });
                        acc[element.id].denominator = 1;
                    } else if (index === 1) {
                        acc[element.id] = {
                            numerator: [],
                            denominator: 54,
                        };
                        acc[element.id].numerator =
                            programStageSections.flatMap((current, index) => {
                                if (index === programStageSections.length - 1) {
                                    return [];
                                }
                                return current.dataElements
                                    .slice(0, current.dataElements.length - 2)
                                    .map((a) => a.id);
                            });
                    }
                });
            }
            return acc;
        }, {});
    }, [programStageSections]);

    const transformData = (): TableDataRecord[] => {
        const tableData: TableDataRecord[] = [];
        programStageSections.forEach((section, sectionIndex) => {
            const dataElements = section.dataElements || [];
            tableData.push({
                key: `${sectionIndex}-description`,
                sortOrder: section.sortOrder,
                programStageName: section.description,
                dataElement: "",
                value: "",
                sectionIndex,
                isFirstInSection: true,
                isDescription: true,
                description: section.name,
                optionSetValue: false,
                multiple: false,
                valueType: "TEXT",
                id: section.id,
            });
            dataElements.forEach((element, elementIndex) => {
                tableData.push({
                    key: `${sectionIndex}-${elementIndex}`,
                    sortOrder: section.sortOrder,
                    programStageName: section.name,
                    dataElement: element.name,
                    value: "",
                    sectionIndex,
                    isFirstInSection: false,
                    optionSetValue: element.optionSetValue,
                    optionSet: {
                        options:
                            element.optionSet?.options.map(
                                ({ value, label, ...rest }) => ({
                                    ...rest,
                                    value,
                                    label: `(${value}) ${label}`,
                                }),
                            ) ?? [],
                    },
                    multiple: false,
                    valueType: element.valueType,
                    id: element.id,
                });
            });
        });

        return tableData;
    };

    const getRowSpan = useCallback(
        (record: TableDataRecord) => {
            const section = programStageSections[record.sectionIndex];
            const totalRows = section.name
                ? section.dataElements.length + 1
                : section.dataElements.length;
            return record.isFirstInSection ? totalRows : 0;
        },
        [programStageSections],
    );

    const calculateAdditions = useCallback(
        (currentAttributes: Record<string, string>) => {
            return Object.entries(fieldsToAdd()).reduce<Record<string, string>>(
                (acc, [field, { numerator, denominator }]) => {
                    const values = numerator.map((a) => {
                        let total = 0;
                        if (currentAttributes[a]) {
                            total = Number(currentAttributes[a]);
                        }
                        return total;
                    });
                    if (denominator > 1) {
                        acc[field] = Intl.NumberFormat("en-US", {
                            notation: "standard",
                            style: "percent",
                        }).format(sum(values) / denominator);
                    } else {
                        acc[field] = Intl.NumberFormat("en-US", {
                            notation: "standard",
                        }).format(sum(values) / denominator);
                    }
                    return acc;
                },
                {},
            );
        },
        [fieldsToAdd],
    );
    const onChange = useCallback(
        (dataElement: string, value: string) => {
            setCurrentInstance((prev) => {
                if (!prev) return prev;

                const newAttributesObject = {
                    ...prev.attributesObject,
                    [dataElement]: value,
                };
                const additions = calculateAdditions(newAttributesObject);
                return {
                    ...prev,
                    attributesObject: {
                        ...newAttributesObject,
                        ...additions,
                    },
                };
            });
        },
        [calculateAdditions],
    );
    const columns: TableProps<TableDataRecord>["columns"] = useMemo(
        () => [
            {
                title: "#",
                dataIndex: "sortOrder",
                key: "sortOrder",
                w: "50px",
                render: (text: number, record) => {
                    return {
                        children: text + 1,
                        props: {
                            rowSpan: getRowSpan(record),
                        },
                    };
                },
            },
            {
                title: "Section",
                dataIndex: "programStageName",
                key: "programStageName",
                render: (text: string, record) => {
                    return {
                        children: text,
                        props: {
                            rowSpan: getRowSpan(record),
                        },
                    };
                },
            },
            {
                title: "Data Element",
                dataIndex: "dataElement",
                key: "dataElement",
                render: (text: string, record) => {
                    if (record.isDescription) {
                        return {
                            children: record.description,
                            props: {
                                colSpan: 2,
                                style: {
                                    backgroundColor: "#fafafa",
                                    fontStyle: "italic",
                                    padding: "8px 16px",
                                },
                            },
                        };
                    }
                    return text;
                },
            },
            {
                title: "Value",
                dataIndex: "value",
                key: "value",
                width: "30vw",
                render: (_: string, record) => {
                    if (record.isDescription) {
                        return {
                            props: {
                                colSpan: 0,
                            },
                        };
                    }
                    return (
                        <FormElement
                            id={record.id}
                            value={
                                currentInstance?.attributesObject?.[
                                    record.id
                                ] ?? ""
                            }
                            optionSet={record.optionSet}
                            valueType={record.valueType}
                            onChange={(value, dataElement) =>
                                onChange(dataElement, value)
                            }
                            multiple={record.multiple}
                            optionSetValue={record.optionSetValue}
                        />
                    );
                },
            },
        ],
        [currentInstance?.attributesObject, getRowSpan, onChange],
    );

    const onDateChange: DatePickerProps["onChange"] = (date) => {
        if (date) {
            setCurrentInstance((prev) => ({
                ...prev,
                workingDate: date.format("YYYY-MM-DD"),
            }));
        } else {
            setCurrentInstance((prev) => ({
                ...prev,
                workingDate: "",
            }));
        }
    };

    const save5STool = async () => {
        if (currentInstance) {
            setLoading(() => true);
            const { workingDate = "" } = currentInstance;
            const dataValues = Object.entries(
                currentInstance.attributesObject ?? {},
            ).map(([dataElement, value]) => {
                if (value.endsWith("%")) {
                    return {
                        dataElement,
                        value: value.replace("%", ""),
                    };
                }
                return { dataElement, value };
            });
            const event: Partial<Event> = {
                dataValues,
                program,
                eventDate: workingDate,
                event: entity,
                dueDate: workingDate,
                orgUnit: owner,
                completedDate: workingDate,
                status: "COMPLETED",
            };

            await postDHIS2Resource({
                resource: "events",
                data: {
                    events: [event],
                },
                params: { async: "false" },
            });
            setLoading(() => false);
            navigate({
                search: (s) => ({
                    ou: String(s.ou),
                    page: 1,
                    pageSize: 10,
                    disabled: false,
                    type: s.type,
                    registration: false,
                }),
                to: "/data-entry/$program/tracked-entities",
                params: { program },
            });
        }
    };

    return (
        <Stack padding="10px" w="100%" spacing="20px">
            <Stack direction="row" alignItems="center" w="100%">
                <Text>Date</Text>
                <Box flex={1}>
                    <DatePicker
                        onChange={onDateChange}
                        style={{ width: "286px" }}
                        value={
                            currentInstance?.workingDate
                                ? dayjs(currentInstance.workingDate)
                                : null
                        }
                    />
                </Box>
            </Stack>
            <Box flex={1}>
                <Table
                    columns={columns}
                    dataSource={transformData()}
                    bordered
                    pagination={false}
                    size="small"
                    scroll={{ y: 650 }}
                />
            </Box>
            <Stack direction="row">
                <Spacer />
                <Button
                    disabled={
                        currentInstance?.workingDate === undefined || loading
                    }
                    onClick={() => save5STool()}
                >
                    Save 5S Monitoring Tool
                </Button>
            </Stack>
            <pre>{JSON.stringify(currentInstance, null, 2)}</pre>
        </Stack>
    );
}
