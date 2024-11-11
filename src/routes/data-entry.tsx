import { DataEntryValidator } from "@/interfaces";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/data-entry")({
    component: DataEntryComponent,
    validateSearch: DataEntryValidator,
});

function DataEntryComponent() {
    return <Outlet />;
}
