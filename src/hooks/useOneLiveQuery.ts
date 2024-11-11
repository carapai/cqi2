import { PromiseExtended } from "dexie";
import { useLiveQuery } from "dexie-react-hooks";
import React from "react";

export function useOneLiveQuery<T, R = string>(
    query: PromiseExtended<T[]>,
    deps: R[] = [],
) {
    const tableQuery = useLiveQuery(() => query, deps);

    const result = React.useMemo(() => {
        if (!tableQuery) return null;
        return tableQuery;
    }, [tableQuery]);

    return result;
}
