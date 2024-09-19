import { db } from "@/db";
import { orgUnitQueryOptions } from "@/queryOptions";
import { useQueryClient } from "@tanstack/react-query";
import type { TreeSelectProps } from "antd";
import { TreeSelect } from "antd";
import { useLiveQuery } from "dexie-react-hooks";
import { FC, useState } from "react";

const OrgUnitSelect: FC = () => {
    const queryClient = useQueryClient();
    const [value, setValue] = useState<string>();
    const organisationUnits = useLiveQuery(() =>
        db.organisationUnits.toArray(),
    );

    const onLoadData: TreeSelectProps["loadData"] = async ({
        value,
        ...rest
    }) => {
        console.log(rest);
        if (value) {
            await queryClient.ensureQueryData(
                orgUnitQueryOptions(value.toString()),
            );
        }
    };

    const onChange = (newValue: string) => {
        setValue(newValue);
    };

    return (
        <TreeSelect
            treeDataSimpleMode
            style={{ width: "100%" }}
            value={value}
            dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
            placeholder="Please select"
            onChange={onChange}
            loadData={onLoadData}
            treeData={organisationUnits}
        />
    );
};

export default OrgUnitSelect;
