import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboards/indicators")({
    component: () => <div>Hello /dashboards/indicators!</div>,
});
