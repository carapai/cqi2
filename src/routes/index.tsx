import OrgUnitSelect from "@/components/OrgUnitSelect";
import { initialQueryOptions } from "@/queryOptions";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/")({
    component: Home,
    loader: ({ context: { queryClient } }) =>
        queryClient.ensureQueryData(initialQueryOptions),
});
function Home() {
    useSuspenseQuery(initialQueryOptions);
    return (
        <div>
            <OrgUnitSelect />
        </div>
    );
}
