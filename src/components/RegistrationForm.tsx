import { db } from "@/db";
import { postDHIS2Resource } from "@/dhis2";
import { useOneLiveQuery } from "@/hooks/useOneLiveQuery";
import {
    DisplayInstance,
    ProgramStageDataElement,
    ProgramTrackedEntityAttribute,
} from "@/interfaces";
import { generateUid } from "@/utils/uid";
import { Spacer, Stack, Text } from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { Button, Col, Modal, Row } from "antd";
import dayjs from "dayjs";
import { isEmpty } from "lodash";
import React, { useCallback, useMemo, useState } from "react";
import { FormElement } from "@/components/FormElement";

const indicatorAttributes: ProgramStageDataElement[] = [
    {
        compulsory: false,
        optionSetValue: false,
        optionSet: { options: [] },
        dataElement: {
            id: "kToJ1rk0fwY",
            name: "Indicator Name",
            optionSetValue: false,
            valueType: "TEXT",
            optionSet: undefined,
            formName: "Indicator Name",
        },
    },
    {
        compulsory: false,
        optionSetValue: false,
        optionSet: { options: [] },
        dataElement: {
            id: "krwzUepGwj7",
            name: "Numerator Name",
            optionSetValue: false,
            valueType: "TEXT",
            optionSet: undefined,
            formName: "Numerator Name",
        },
    },
    {
        compulsory: false,
        optionSetValue: false,
        optionSet: { options: [] },
        dataElement: {
            id: "WI6Qp8gcZFX",
            name: "Denominator Name",
            optionSetValue: false,
            valueType: "TEXT",
            optionSet: undefined,
            formName: "Denominator Name",
        },
    },
];

const RegistrationForm: React.FC<{
    program: string;
    programTrackedEntityAttributes: ProgramTrackedEntityAttribute[];
    displayInstance?: DisplayInstance;
}> = React.memo(({ displayInstance, programTrackedEntityAttributes }) => {
    const queryClient = useQueryClient();
    const [currentInstance, setCurrentInstance] = React.useState<
        DisplayInstance | undefined
    >(displayInstance);
    const [currentIndicator, setCurrentIndicator] = React.useState<
        Record<string, string>
    >({});
    const { entity, program } = useParams({
        from: "/data-entry/$program/tracked-entities_/$entity/form",
    });
    const { editing, registration, type, owner } = useSearch({
        from: "/data-entry/$program/tracked-entities_/$entity/form",
    });
    const navigate = useNavigate({
        from: "/data-entry/$program/tracked-entities/$entity/form",
    });
    const programArea = currentInstance?.attributesObject?.["TG1QzFgGTex"];
    const [loading, setLoading] = React.useState(false);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [pending, setPending] = React.useState(false);
    const [currentEvent, setCurrentEvent] = useState<string>("");

    const { data: indicatorData } = useOneLiveQuery(
        db.indicators
            .where("kuVtv8R9n8q")
            .equals(programArea ?? "-")
            .and(
                (r) => r["orgUnit"] === owner || r["orgUnit"] === "akV6429SUqu",
            )
            .toArray(),
        [programArea, currentEvent, owner],
    );

    const isValid = () => {
        const attributes = currentInstance?.attributesObject;
        if (isEmpty(attributes)) return false;
        return [
            "y3hJLGjctPk",
            "TG1QzFgGTex",
            "kHRn35W3Gq4",
            "WQcY6nfPouv",
        ].every((key) => !!attributes[key]);
    };

    const saveProject = async () => {
        setLoading(() => true);
        if (currentInstance) {
            const { attributesObject = {}, ...rest } = currentInstance;
            const attributes = Object.entries(attributesObject).map(
                ([attribute, value]) => ({
                    attribute,
                    value,
                }),
            );
            if (registration) {
                if (editing) {
                    try {
                        await postDHIS2Resource({
                            resource: "trackedEntityInstances",
                            data: {
                                trackedEntityInstances: [
                                    {
                                        ...rest,
                                        attributes,
                                    },
                                ],
                            },
                            params: { async: "false" },
                        });
                        queryClient.setQueryData(
                            ["entity", entity, editing, program],
                            () => ({ ...currentInstance, attributes }),
                        );
                    } catch (error) {
                        console.log(error);
                    }
                } else {
                    const instance = {
                        ...rest,
                        attributes,
                        trackedEntityType: type,
                        enrollments: [
                            {
                                enrollment: generateUid(),
                                orgUnit: owner,
                                program,
                                trackedEntityInstance: entity,
                                enrollmentDate: new Date().toISOString(),
                                incidentDate: new Date().toISOString(),
                                attributes,
                            },
                        ],
                        trackedEntityInstance: entity,
                        orgUnit: owner,
                    };
                    try {
                        await postDHIS2Resource({
                            resource: "trackedEntityInstances",
                            data: {
                                trackedEntityInstances: [instance],
                            },
                            params: { async: "false" },
                        });
                        queryClient.setQueryData(
                            ["entity", entity, editing, program],
                            () => ({ ...instance, attributesObject }),
                        );
                    } catch (error) {
                        console.log(error);
                    }
                }
            }
        }
        setLoading(() => false);
        navigate({
            search: (s) => ({
                ou: String(s.ou),
                page: 1,
                pageSize: 10,
                disabled: false,
                type: s.type,
                registration: s.registration,
            }),
            to: "/data-entry/$program/tracked-entities",
            params: { program },
        });
    };

    const currentAttributes = useMemo(
        () =>
            programTrackedEntityAttributes.map((e) => {
                if (e.trackedEntityAttribute.id === "kHRn35W3Gq4") {
                    return {
                        ...e,
                        trackedEntityAttribute: {
                            ...e.trackedEntityAttribute,
                            optionSetValue: true,
                            multiple: false,
                            optionSet: {
                                options:
                                    indicatorData
                                        ?.map(({ event, kToJ1rk0fwY }) => ({
                                            label: kToJ1rk0fwY,
                                            value: event,
                                        }))
                                        .concat([
                                            {
                                                label: "New Indicator",
                                                value: "new indicator",
                                            },
                                        ]) ?? [],
                            },
                        },
                    };
                }
                return e;
            }),
        [programTrackedEntityAttributes, indicatorData],
    );

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = async () => {
        setPending(() => true);
        const event = generateUid();
        const payload: Record<string, string> = {
            attributeOptionCombo: "HllvX50cXC0",
            completedBy: "true",
            completedDate: dayjs().format("YYYY-MM-DD"),
            created: dayjs().format("YYYY-MM-DD"),

            deleted: "false",
            dueDate: dayjs().format("YYYY-MM-DD"),
            enrollment: "eq4aWCJnhVA",
            event,
            eventDate: dayjs().format("YYYY-MM-DD"),
            kuVtv8R9n8q:
                currentInstance?.attributesObject?.["TG1QzFgGTex"] ?? "",
            lastUpdated: dayjs().format("YYYY-MM-DD"),
            o9OCHUG0yv2: "",
            orgUnit: owner,
            program: "eQf9K4L2yxE",
            programStage: "vPQxfsUQLEy",
            status: "ACTIVE",
            ...currentIndicator,
        };

        const {
            kuVtv8R9n8q,
            o9OCHUG0yv2,
            kToJ1rk0fwY,
            krwzUepGwj7,
            WI6Qp8gcZFX,
            ...rest
        } = payload;

        const actualEvent = {
            ...rest,
            dataValues: [
                { dataElement: "kuVtv8R9n8q", value: kuVtv8R9n8q },
                { dataElement: "o9OCHUG0yv2", value: o9OCHUG0yv2 },
                { dataElement: "kToJ1rk0fwY", value: kToJ1rk0fwY },
                { dataElement: "krwzUepGwj7", value: krwzUepGwj7 },
                { dataElement: "WI6Qp8gcZFX", value: WI6Qp8gcZFX },
            ],
        };
        await postDHIS2Resource({
            resource: "events",
            data: { events: [actualEvent] },
            params: { async: false },
        });
        await db.indicators.put(payload);
        setCurrentEvent(() => event);
        setPending(() => false);
        setCurrentInstance((prev) => {
            if (prev)
                return {
                    ...prev,
                    attributesObject: {
                        ...prev.attributesObject,
                        kHRn35W3Gq4: event,
                    },
                };
            return prev;
        });
        setCurrentIndicator(() => ({}));
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const onIndicatorChange = (value: string, dataElement: string) => {
        setCurrentIndicator((prev) => ({
            ...prev,
            [dataElement]: value,
        }));
    };
    const isDisabled = useMemo(() => {
        return Object.values(currentIndicator).every(
            (a) => a !== "" && a !== undefined,
        );
    }, [currentIndicator]);
    const onChange = useCallback(
        async (value: string, dataElement: string) => {
            if (dataElement === "kHRn35W3Gq4" && value === "new indicator") {
                setCurrentInstance((prev) => {
                    if (prev)
                        return {
                            ...prev,
                            attributesObject: {
                                ...prev.attributesObject,
                                kHRn35W3Gq4: "",
                            },
                        };
                    return prev;
                });
                showModal();
            } else {
                if (displayInstance) {
                    setCurrentInstance((prev) => {
                        if (prev) {
                            return {
                                ...prev,
                                attributesObject: {
                                    ...prev.attributesObject,
                                    [dataElement]: value,
                                },
                            };
                        }
                        return prev;
                    });
                } else {
                    setCurrentInstance(() => ({
                        trackedEntityInstance: entity,
                        attributesObject: {
                            [dataElement]: value,
                        },
                    }));
                }
                if (dataElement === "TG1QzFgGTex") {
                    setCurrentInstance((prev) => {
                        if (prev)
                            return {
                                ...prev,
                                attributesObject: {
                                    ...prev.attributesObject,
                                    kHRn35W3Gq4: "",
                                },
                            };
                        return prev;
                    });
                }
            }
        },
        [entity, displayInstance],
    );

    return (
        <Stack
            borderRadius="md"
            boxShadow="0 0 20px rgba(0, 0, 0, 0.1)"
            p="15px"
        >
            <Row gutter={[24, 24]}>
                {currentAttributes.map(({ trackedEntityAttribute }) => {
                    if (trackedEntityAttribute.id === "eZrfD4QnQfl")
                        return null;

                    if (trackedEntityAttribute.id === "iInAQ40vDGZ") {
                        return (
                            <Col span={8} key={trackedEntityAttribute.id}>
                                <Stack direction="column" width="100%">
                                    <Text>
                                        {`${trackedEntityAttribute.displayFormName || trackedEntityAttribute.name}`}
                                    </Text>
                                    <FormElement
                                        id={trackedEntityAttribute.id}
                                        value={
                                            currentInstance?.attributesObject?.[
                                                trackedEntityAttribute.id
                                            ] ?? ""
                                        }
                                        optionSet={
                                            trackedEntityAttribute.optionSet
                                        }
                                        valueType={
                                            trackedEntityAttribute.valueType
                                        }
                                        onChange={onChange}
                                        multiple={
                                            trackedEntityAttribute.multiple
                                        }
                                        optionSetValue={
                                            trackedEntityAttribute.optionSetValue
                                        }
                                        disabledDate={(currentDate) =>
                                            currentDate.isBefore(
                                                dayjs(
                                                    displayInstance
                                                        ?.attributesObject?.[
                                                        "y3hJLGjctPk"
                                                    ],
                                                ),
                                            )
                                        }
                                    />
                                </Stack>
                            </Col>
                        );
                    }
                    if (trackedEntityAttribute.valueType === "TRUE_ONLY") {
                        return (
                            <Col span={8} key={trackedEntityAttribute.id}>
                                <Stack
                                    direction="row"
                                    width="100%"
                                    alignItems="center"
                                >
                                    <FormElement
                                        id={trackedEntityAttribute.id}
                                        value={
                                            currentInstance?.attributesObject?.[
                                                trackedEntityAttribute.id
                                            ] ?? ""
                                        }
                                        optionSet={
                                            trackedEntityAttribute.optionSet
                                        }
                                        valueType={
                                            trackedEntityAttribute.valueType
                                        }
                                        multiple={
                                            trackedEntityAttribute.multiple
                                        }
                                        optionSetValue={
                                            trackedEntityAttribute.optionSetValue
                                        }
                                        onChange={onChange}
                                    />
                                    <Text>
                                        {`${trackedEntityAttribute.displayFormName || trackedEntityAttribute.name}`}
                                    </Text>
                                </Stack>
                            </Col>
                        );
                    }
                    return (
                        <Col span={8} key={trackedEntityAttribute.id}>
                            <Stack direction="column" width="100%">
                                <Text>
                                    {`${trackedEntityAttribute.displayFormName || trackedEntityAttribute.name}`}
                                </Text>
                                <FormElement
                                    id={trackedEntityAttribute.id}
                                    value={
                                        currentInstance?.attributesObject?.[
                                            trackedEntityAttribute.id
                                        ] ?? ""
                                    }
                                    optionSet={trackedEntityAttribute.optionSet}
                                    valueType={trackedEntityAttribute.valueType}
                                    onChange={onChange}
                                    multiple={trackedEntityAttribute.multiple}
                                    optionSetValue={
                                        trackedEntityAttribute.optionSetValue
                                    }
                                />
                            </Stack>
                        </Col>
                    );
                })}
            </Row>
            <Stack direction="row">
                <Button
                    onClick={() =>
                        navigate({
                            search: (s) => ({
                                ou: String(s.ou),
                                page: 1,
                                pageSize: 10,
                                disabled: true,
                                type: s.type,
                                registration: s.registration,
                            }),
                            to: "/data-entry/$program/tracked-entities",
                            params: { program },
                        })
                    }
                >
                    Cancel
                </Button>
                <Spacer />
                <Button
                    disabled={!isValid()}
                    onClick={() => saveProject()}
                    loading={loading}
                >
                    Save Project
                </Button>
            </Stack>
            <Modal
                title="Basic Modal"
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                okText={pending ? "Loading..." : "Ok"}
                okButtonProps={{
                    loading: pending,
                    disabled: pending || !isDisabled,
                }}
                cancelButtonProps={{ disabled: pending }}
            >
                <Stack>
                    {indicatorAttributes.map(({ dataElement }) => (
                        <Stack
                            direction="column"
                            width="100%"
                            id={dataElement.id}
                        >
                            <Text>
                                {`${dataElement.formName || dataElement.name}`}
                            </Text>
                            <FormElement
                                id={dataElement.id}
                                value={currentIndicator[dataElement.id] ?? ""}
                                optionSet={dataElement.optionSet}
                                valueType={dataElement.valueType}
                                onChange={onIndicatorChange}
                                multiple={false}
                                optionSetValue={dataElement.optionSetValue}
                            />
                        </Stack>
                    ))}
                    <pre>{JSON.stringify(currentIndicator, null, 2)}</pre>
                </Stack>
            </Modal>
        </Stack>
    );
});

export default RegistrationForm;
