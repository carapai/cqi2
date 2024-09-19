import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboards/admin")({
    component: () => <div>Hello /dashboards/admin!</div>,
});
