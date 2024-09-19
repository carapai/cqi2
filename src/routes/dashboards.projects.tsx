import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboards/projects")({
    component: () => <div>Hello /dashboards/projects!</div>,
});
