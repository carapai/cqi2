import { Checkbox, DatePicker, Input, Radio } from "antd";
import dayjs from "dayjs";
import { JSX } from "react";
import DOBComponent from "./DOBComponent";
type InputProps = {
    value: string | undefined;
    onChange: (value: string) => void;
    onBlur: (value: string) => void;
    disabledDate?: (currentDate: dayjs.Dayjs) => boolean;
};
export const formElements: Record<string, (args: InputProps) => JSX.Element> = {
    TEXT: ({ onChange, value, onBlur }: InputProps) => (
        <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={(e) => onBlur(e.target.value)}
        />
    ),
    LONG_TEXT: ({ onChange, value, onBlur }: InputProps) => (
        <Input.TextArea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={(e) => onBlur(e.target.value)}
            rows={5}
        />
    ),
    LETTER: ({ onChange, value, onBlur }: InputProps) => (
        <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={(e) => onBlur(e.target.value)}
        />
    ),
    PHONE_NUMBER: ({ onChange, value, onBlur }: InputProps) => (
        <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={(e) => onBlur(e.target.value)}
        />
    ),
    EMAIL: ({ onChange, value, onBlur }: InputProps) => (
        <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={(e) => onBlur(e.target.value)}
        />
    ),
    BOOLEAN: ({ onChange, value, onBlur }: InputProps) => (
        <Radio.Group
            onChange={(e) => {
                onChange(e.target.value);
                onBlur(e.target.value);
            }}
            value={value}
        >
            <Radio value="true">Yes</Radio>
            <Radio value="false">No</Radio>
        </Radio.Group>
    ),
    TRUE_ONLY: ({ onChange, value, onBlur }: InputProps) => (
        <Checkbox
            onChange={(e) => {
                onChange(e.target.checked ? "true" : "false");
                onBlur(e.target.checked ? "true" : "false");
            }}
            checked={value === "true"}
        />
    ),
    DATE: ({ onChange, value, onBlur, disabledDate }: InputProps) => (
        <DatePicker
            onChange={(e) => {
                if (e) {
                    onChange(e.format("YYYY-MM-DD"));
                    onBlur(e.format("YYYY-MM-DD"));
                } else {
                    onChange("");
                    onBlur("");
                }
            }}
            value={value ? dayjs(value) : null}
            disabledDate={disabledDate}
        />
    ),
    DATETIME: ({ onChange, value, onBlur }: InputProps) => (
        <DatePicker
            onChange={(e) => {
                if (e) {
                    onChange(e.format("YYYY-MM-DD"));
                    onBlur(e.format("YYYY-MM-DD"));
                } else {
                    onChange("");
                    onBlur("");
                }
            }}
            value={value ? dayjs(value) : null}
        />
    ),
    TIME: ({ onChange, value, onBlur }: InputProps) => (
        <DatePicker
            onChange={(e) => {
                if (e) {
                    onChange(e.format("YYYY-MM-DD"));
                    onBlur(e.format("YYYY-MM-DD"));
                } else {
                    onChange("");
                    onBlur("");
                }
            }}
            value={value ? dayjs(value) : null}
        />
    ),
    AGE: ({ onChange, value, onBlur }: InputProps) => (
        <DOBComponent
            onChange={(e) => {
                if (e) {
                    onChange(e.format("YYYY-MM-DD"));
                    onBlur(e.format("YYYY-MM-DD"));
                }
            }}
            value={value ? dayjs(value) : null}
        />
    ),
    NUMBER: ({ onChange, value, onBlur }: InputProps) => (
        <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={(e) => onBlur(e.target.value)}
        />
    ),
    UNIT_INTERVAL: ({ onChange, value, onBlur }: InputProps) => (
        <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={(e) => onBlur(e.target.value)}
        />
    ),
    PERCENTAGE: ({ onChange, value, onBlur }: InputProps) => (
        <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={(e) => onBlur(e.target.value)}
        />
    ),
    INTEGER: ({ onChange, value, onBlur }: InputProps) => (
        <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={(e) => onBlur(e.target.value)}
        />
    ),
    INTEGER_POSITIVE: ({ onChange, value, onBlur }: InputProps) => (
        <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={(e) => onBlur(e.target.value)}
        />
    ),
    INTEGER_NEGATIVE: ({ onChange, value, onBlur }: InputProps) => (
        <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={(e) => onBlur(e.target.value)}
        />
    ),
    INTEGER_ZERO_OR_POSITIVE: ({ value, onChange, onBlur }: InputProps) => (
        <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={(e) => onBlur(e.target.value)}
        />
    ),
    TRACKER_ASSOCIATE: ({ onChange, value, onBlur }: InputProps) => (
        <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={(e) => onBlur(e.target.value)}
        />
    ),
    USERNAME: ({ onChange, value, onBlur }: InputProps) => (
        <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={(e) => onBlur(e.target.value)}
        />
    ),
    COORDINATE: ({ onChange, value, onBlur }: InputProps) => (
        <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={(e) => onBlur(e.target.value)}
        />
    ),
    ORGANISATION_UNIT: ({ onChange, value, onBlur }: InputProps) => (
        <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={(e) => onBlur(e.target.value)}
        />
    ),
    REFERENCE: ({ onChange, value, onBlur }: InputProps) => (
        <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={(e) => onBlur(e.target.value)}
        />
    ),
    URL: ({ onChange, value, onBlur }: InputProps) => (
        <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={(e) => onBlur(e.target.value)}
        />
    ),
    FILE_RESOURCE: ({ onChange, value, onBlur }: InputProps) => (
        <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={(e) => onBlur(e.target.value)}
        />
    ),
    GEOJSON: ({ onChange, value, onBlur }: InputProps) => (
        <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={(e) => onBlur(e.target.value)}
        />
    ),
    MULTI_TEXT: ({ onChange, value, onBlur }: InputProps) => (
        <Input.TextArea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={(e) => onBlur(e.target.value)}
        />
    ),
};
