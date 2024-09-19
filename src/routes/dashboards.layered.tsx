import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboards/layered")({
    component: () => <div>Hello /dashboards/layered!</div>,
});
