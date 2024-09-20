import { Spacer, Stack, Text } from "@chakra-ui/react";
import { QueryClient } from "@tanstack/react-query";
import {
    Link,
    Outlet,
    createRootRouteWithContext,
} from "@tanstack/react-router";
import { Button, Image } from "antd";
export const Route = createRootRouteWithContext<{
    queryClient: QueryClient;
}>()({
    component: RootComponent,
});
function RootComponent() {
    return (
        <Stack w="100vw" h="100vh" bgColor="white" p="2px">
            <Stack direction="row" alignItems="center">
                <Image
                    src="https://raw.githubusercontent.com/HISP-Uganda/covid-dashboard/master/src/images/Coat_of_arms_of_Uganda.svg"
                    width="40px"
                />
                <Text>Continuous Quality Improvement (CQI) Database</Text>
                <Spacer />
                <Stack direction="row">
                    <Link to="/">
                        <Button>Home</Button>
                    </Link>

                    <Link to="/data-entry">
                        <Button>Data Entry</Button>
                    </Link>
                    <Link to="/dashboards/layered">
                        <Button>Layered Dashboard</Button>
                    </Link>
                    <Link to="/dashboards/indicators">
                        <Button>All Indicators</Button>
                    </Link>
                    <Link
                        to="/dashboards/projects"
                        search={{ page: 1, pageSize: 10 }}
                    >
                        <Button>Projects</Button>
                    </Link>
                    <Link to="/dashboards/admin">
                        <Button>Admin Dashboard</Button>
                    </Link>
                </Stack>
            </Stack>
            <Outlet />
        </Stack>
    );
}
