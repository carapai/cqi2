import OrgUnitSelect from "@/components/OrgUnitSelect";
import { db } from "@/db";
import { initialQueryOptions } from "@/queryOptions";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
export const Route = createFileRoute("/")({
    component: Home,
    loader: ({ context: { queryClient } }) =>
        queryClient.ensureQueryData(initialQueryOptions),
});
function Home() {
    const [value, setValue] = useState<string>("");

    useSuspenseQuery(initialQueryOptions);

    return (
        <div>
            <OrgUnitSelect
                table={db.organisationUnits}
                value={value}
                onChange={(value) => setValue(() => value)}
            />
        </div>
    );
}
