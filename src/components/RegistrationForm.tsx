import { formElements } from "@/components/form-elements";
import { postDHIS2Resource } from "@/dhis2";
import {
    DisplayInstance,
    Option,
    ProgramTrackedEntityAttribute,
} from "@/interfaces";
import { generateUid } from "@/utils/uid";
import { Spacer, Stack, Text } from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import {
    useLoaderData,
    useNavigate,
    useParams,
    useSearch,
} from "@tanstack/react-router";
import { Button, Col, Row, Select } from "antd";
import { isArray, isEmpty } from "lodash";
import React, { useCallback, useMemo } from "react";

const FormElement = React.memo(
    ({
        attribute,
        displayInstance,
        onChange,
    }: {
        attribute: ProgramTrackedEntityAttribute["trackedEntityAttribute"];
        displayInstance: DisplayInstance | undefined;
        onChange: (value: string, dataElement: string) => void;
    }) => {
        const { optionSetValue, valueType, id, optionSet, multiple } =
            attribute;
        const val = (displayInstance?.attributesObject ?? {})[id];

        if (optionSetValue) {
            return (
                <Select
                    style={{ width: "100%" }}
                    showSearch
                    allowClear
                    placeholder="Select a person"
                    mode={multiple ? "multiple" : undefined}
                    value={multiple && val ? val.split(",") : val}
                    filterOption={(input, option) =>
                        (option?.label ?? "")
                            .toLowerCase()
                            .includes(input.toLowerCase())
                    }
                    options={optionSet?.options}
                    onChange={(value) =>
                        onChange(isArray(value) ? value.join(",") : value, id)
                    }
                />
            );
        }

        const Element = formElements[valueType];
        return Element ? (
            <Element
                value={(displayInstance?.attributesObject ?? {})[id]}
                onChange={(value) => onChange(value, id)}
                onBlur={() => {}}
            />
        ) : null;
    },
);

const RegistrationForm: React.FC<{
    program: string;
    programTrackedEntityAttributes: ProgramTrackedEntityAttribute[];
    displayInstance?: DisplayInstance;
}> = React.memo(({ displayInstance, programTrackedEntityAttributes }) => {
    const queryClient = useQueryClient();
    const [currentInstance, setCurrentInstance] = React.useState<
        DisplayInstance | undefined
    >(displayInstance);
    const { indicators } = useLoaderData({ from: "__root__" });
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
                    let options: Option[] = [];
                    if (programArea) {
                        options = indicators
                            .filter(
                                (row: Record<string, string>) =>
                                    programArea === row["kuVtv8R9n8q"],
                            )
                            .map(({ kToJ1rk0fwY, event }) => ({
                                label: kToJ1rk0fwY,
                                value: event,
                            }));
                    }
                    return {
                        ...e,
                        trackedEntityAttribute: {
                            ...e.trackedEntityAttribute,
                            optionSetValue: true,
                            multiple: false,
                            optionSet: {
                                options: options,
                            },
                        },
                    };
                }
                return e;
            }),
        [programTrackedEntityAttributes, programArea, indicators],
    );
    const onChange = useCallback(
        async (value: string, dataElement: string) => {
            if (displayInstance) {
                setCurrentInstance((prev) => {
                    if (prev)
                        return {
                            ...prev,
                            attributesObject: {
                                ...prev.attributesObject,
                                [dataElement]: value,
                            },
                        };
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
                    if (trackedEntityAttribute.valueType === "TRUE_ONLY") {
                        return (
                            <Col span={8} key={trackedEntityAttribute.id}>
                                <Stack
                                    direction="row"
                                    width="100%"
                                    alignItems="center"
                                >
                                    <FormElement
                                        attribute={trackedEntityAttribute}
                                        displayInstance={currentInstance}
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
                                    attribute={trackedEntityAttribute}
                                    displayInstance={currentInstance}
                                    onChange={onChange}
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
        </Stack>
    );
});

export default RegistrationForm;
