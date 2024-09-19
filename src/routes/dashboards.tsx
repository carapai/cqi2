import { Stack, Text } from "@chakra-ui/react";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboards")({
    component: DashboardComponent,
});

function DashboardComponent() {
    return (
        <Stack>
            <Text>Tree</Text>
            <Outlet />;
        </Stack>
    );
}
