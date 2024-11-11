import { initialQueryOptions } from "@/queryOptions";
import { Spacer, Stack, Text } from "@chakra-ui/react";
import { QueryClient, useSuspenseQuery } from "@tanstack/react-query";
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
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(initialQueryOptions),
  pendingComponent: () => <div>Loading...</div>,
});

function RootComponent() {
  const {
    data: { ou, viewUnits, options, indicators },
  } = useSuspenseQuery(initialQueryOptions);

  const pa = options?.[0].code;
  const ind = indicators.find((i) => i["kuVtv8R9n8q"] === pa)?.["event"];
  const userInitials = "AM";

  return (
    <Stack w="100vw" h="100vh" bgColor="white">
      <Stack
        direction="row"
        alignItems="center"
        p="10px"
        bgColor="#2C6693"
        color="white"
        boxShadow="sm"
        spacing={4}
        h="48px"
        maxH="48px"
        minH="48px"
      >
        <Image src="/dhis2whitelogo.png" width="30px" alt="DHIS2 Logo" />
        <Text fontSize="sm" fontWeight="bold">
          Integrated CQI Database - Continuous Quality Improvement
        </Text>
        <Spacer />

        <Stack direction="row" spacing={8} alignItems="center">
          <Image
            src="/interpretations.png"
            width="20px"
            alt="Interpretations Icon"
          />
          <Image src="/messages.png" width="20px" alt="Messages Icon" />
          <Image src="/appmenu.png" width="20px" alt="App Menu Icon" />
          <Stack
            alignItems="center"
            justifyContent="center"
            bgColor="#1A202C"
            borderRadius="full"
            w="32px"
            h="32px"
            title="User"
          >
            <Text fontWeight="bold" color="white" fontSize="sm">
              {userInitials}
            </Text>
          </Stack>
        </Stack>
      </Stack>

      <Stack
        direction="row"
        alignItems="center"
        p="10px"
        bgColor="white"
        borderRadius="md"
        boxShadow="sm"
        spacing={6}
        h="48px"
        maxH="48px"
        minH="48px"
      >
        <Image
          src="https://raw.githubusercontent.com/HISP-Uganda/covid-dashboard/master/src/images/Coat_of_arms_of_Uganda.svg"
          width="40px"
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
              style={{
                backgroundColor: "#3182CE",
                borderColor: "#3182CE",
              }}
            >
              Home
            </Button>
          </Link>

          <Link
            to="/data-entry/$program/tracked-entities"
            activeProps={{ style: { background: "yellow" } }}
            search={{
              ou,
              registration: true,
              pageSize: 10,
              page: 1,
              type: "KSy4dEvpMWi",
            }}
            params={{ program: "vMfIVFcRWlu" }}
          >
            <Button
              shape="round"
              style={{ borderColor: "#2B6CB0", color: "#2B6CB0" }}
            >
              Data Entry
            </Button>
          </Link>

          <Link
            to="/dashboards/$id"
            params={{ id: "layered" }}
            activeProps={{ style: { background: "yellow" } }}
            search={{
              periods: [
                {
                  value: "THIS_YEAR",
                  label: "This Year",
                  periodType: "YEARLY",
                },
                {
                  value: "LAST_YEAR",
                  label: "Last Year",
                  periodType: "YEARLY",
                },
              ],
              ou: viewUnits,
              pa,
              ind,
            }}
          >
            <Button
              shape="round"
              style={{ borderColor: "#2C5282", color: "#2C5282" }}
            >
              Layered Dashboard
            </Button>
          </Link>

          <Link
            to="/dashboards/$id"
            params={{ id: "indicators" }}
            activeProps={{ style: { background: "yellow" } }}
            search={{
              periods: [
                {
                  value: "THIS_YEAR",
                  label: "This Year",
                  periodType: "YEARLY",
                },
                {
                  value: "LAST_YEAR",
                  label: "Last Year",
                  periodType: "YEARLY",
                },
              ],
              ou: viewUnits,
              filter: "period",
              mode: "multiple",
            }}
          >
            <Button
              shape="round"
              style={{ borderColor: "#2C7A7B", color: "#2C7A7B" }}
            >
              All Indicators
            </Button>
          </Link>

          <Link
            to="/dashboards/$id"
            params={{ id: "projects" }}
            search={{
              page: 1,
              pageSize: 10,
              ou: viewUnits,
              mode: "multiple",
            }}
            activeProps={{ style: { background: "yellow" } }}
          >
            <Button
              shape="round"
              style={{ borderColor: "#2F855A", color: "#2F855A" }}
            >
              Projects
            </Button>
          </Link>

          <Link
            to="/dashboards/$id"
            params={{ id: "admin" }}
            search={{
              periods: [
                {
                  value: "THIS_YEAR",
                  label: "This Year",
                  periodType: "YEARLY",
                },
                {
                  value: "LAST_YEAR",
                  label: "Last Year",
                  periodType: "YEARLY",
                },
              ],
              ou: viewUnits,
              counting: "projects",
              mode: "multiple",
            }}
            activeProps={{ style: { background: "yellow" } }}
          >
            <Button
              shape="round"
              style={{ borderColor: "#9B2C2C", color: "#9B2C2C" }}
            >
              Admin Dashboard
            </Button>
          </Link>
        </Stack>
      </Stack>
      <Outlet />
    </Stack>
  );
}
