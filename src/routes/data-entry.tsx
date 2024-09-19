import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/data-entry")({
    component: () => <div>Hello /data-entry!</div>,
});
