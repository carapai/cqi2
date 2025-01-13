import { PromiseExtended } from "dexie";
import { useLiveQuery } from "dexie-react-hooks";
import React from "react";

export function useOneLiveQuery<T, R = string>(
    query: PromiseExtended<T[]>,
    deps: R[] = [],
) {
    const tableQuery = useLiveQuery(() => query, deps);

    return React.useMemo(() => {
        if (tableQuery === undefined) {
            return { loading: true, data: undefined };
        }
        return { loading: false, data: tableQuery };
    }, [tableQuery]);
}
