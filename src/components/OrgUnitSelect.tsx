import { OrgUnit } from "@/interfaces";
import { orgUnitQueryOptions } from "@/queryOptions";
import { useQueryClient } from "@tanstack/react-query";
import type { TreeSelectProps } from "antd";
import { TreeSelect } from "antd";
import { IndexableType, Table } from "dexie";
import { useLiveQuery } from "dexie-react-hooks";
import { FC } from "react";

const OrgUnitSelect: FC<{
    table: Table<OrgUnit, IndexableType>;
    value: string | string[] | undefined;
    onChange: (newValue: string | string[] | undefined) => void;
    isMulti?: boolean;
    disabled?: boolean;
}> = ({ table, value, onChange, isMulti, disabled }) => {
    const queryClient = useQueryClient();
    const organisationUnits = useLiveQuery(() => table.toArray());

    const onLoadData: TreeSelectProps["loadData"] = async ({ value }) => {
        if (value) {
            await queryClient.ensureQueryData(
                orgUnitQueryOptions(value.toString(), table),
            );
        }
    };
    return (
        <TreeSelect
            disabled={disabled}
            treeDataSimpleMode
            allowClear
            style={{ width: "100%" }}
            value={value}
            dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
            placeholder="Please select"
            onChange={onChange}
            loadData={onLoadData}
            treeData={organisationUnits}
            multiple={isMulti}
        />
    );
};

export default OrgUnitSelect;
