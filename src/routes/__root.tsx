import { Spacer, Stack, Text, Box } from "@chakra-ui/react";
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
    <Stack w="100vw" h="100vh" bgColor="#f5f5f5" p="10px">
      <Stack
        direction="row"
        alignItems="center"
        p="10px"
        bgColor="white"
        borderRadius="md"
        boxShadow="sm"
        spacing={6}
      >
        <Image
          src="https://raw.githubusercontent.com/HISP-Uganda/covid-dashboard/master/src/images/Coat_of_arms_of_Uganda.svg"
          width="50px"
        />

        <Text fontSize="xl" fontWeight="bold" color="#1A202C">
          Continuous Quality Improvement (CQI) Database
        </Text>

        <Spacer />

        <Stack direction="row" spacing={4}>
          <Link to="/">
            <Button
              type="primary"
              shape="round"
              style={{ backgroundColor: "#3182CE", borderColor: "#3182CE" }}
            >
              Home
            </Button>
          </Link>

          <Link to="/data-entry">
            <Button
              shape="round"
              style={{ borderColor: "#2B6CB0", color: "#2B6CB0" }}
            >
              Data Entry
            </Button>
          </Link>

          <Link to="/dashboards/layered">
            <Button
              shape="round"
              style={{ borderColor: "#2C5282", color: "#2C5282" }}
            >
              Layered Dashboard
            </Button>
          </Link>

          <Link to="/dashboards/indicators">
            <Button
              shape="round"
              style={{ borderColor: "#2C7A7B", color: "#2C7A7B" }}
            >
              All Indicators
            </Button>
          </Link>

          <Link to="/dashboards/projects" search={{ page: 1, pageSize: 10 }}>
            <Button
              shape="round"
              style={{ borderColor: "#2F855A", color: "#2F855A" }}
            >
              Projects
            </Button>
          </Link>

          <Link to="/dashboards/admin">
            <Button
              shape="round"
              style={{ borderColor: "#9B2C2C", color: "#9B2C2C" }}
            >
              Admin Dashboard
            </Button>
          </Link>
        </Stack>
      </Stack>

      <Box
        mt={5}
        p={5}
        borderRadius="md"
        boxShadow="md"
        bgColor="white"
        flexGrow={1}
      >
        <Outlet />
      </Box>
    </Stack>
  );
}
