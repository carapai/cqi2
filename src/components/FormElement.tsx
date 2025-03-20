import { formElements } from "@/components/form-elements";
import { OptionSet, ValueType } from "@/interfaces";
import { Select } from "antd";
import dayjs from "dayjs";
import { isArray } from "lodash";
import React from "react";

export const FormElement = React.memo(
    ({
        placeholder = "",
        onChange,
        disabledDate,
        optionSetValue,
        valueType,
        id,
        optionSet,
        multiple,
        value,
    }: {
        placeholder?: string;
        onChange: (value: string, dataElement: string) => void;
        disabledDate?: (currentDate: dayjs.Dayjs) => boolean;
        optionSetValue: boolean;
        valueType: ValueType;
        id: string;
        optionSet?: OptionSet;
        multiple?: boolean;
        value: string;
    }) => {
        if (optionSetValue) {
            return (
                <Select
                    style={{ width: "100%" }}
                    showSearch
                    allowClear
                    placeholder={placeholder}
                    mode={multiple ? "multiple" : undefined}
                    value={multiple && value ? value.split(",") : value}
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
                value={value}
                onChange={(value) => onChange(value, id)}
                onBlur={() => {}}
                disabledDate={disabledDate}
            />
        ) : null;
    },
);
