import OrgUnitSelect from "@/components/OrgUnitSelect";
import PeriodPicker from "@/components/PeriodPicker";
import { db } from "@/db";
import { DashboardQueryValidator } from "@/interfaces";
import { dashboardsQueryOptions } from "@/queryOptions";
import {
  Box,
  Spacer,
  Stack,
  Text,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  Outlet,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { Select } from "antd";

export const Route = createFileRoute("/dashboards")({
  component: DashboardComponent,
  validateSearch: DashboardQueryValidator,
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(dashboardsQueryOptions),
});

function DashboardComponent() {
  const {
    data: { options, indicators, organisationUnitLevels },
  } = useSuspenseQuery(dashboardsQueryOptions);
  const { pa, ind, level, ou, periods } = useSearch({ from: "/dashboards" });
  const navigate = useNavigate({ from: "/dashboards" });

  const filteredIndicators = indicators
    .filter((row: Record<string, string>) => row["kuVtv8R9n8q"] === pa)
    .map(({ kToJ1rk0fwY, event }) => ({
      label: kToJ1rk0fwY,
      value: event,
    }));

  return (
    <Stack spacing={6} p={6} bgColor="#f9fafb" borderRadius="md" boxShadow="md">
      <Stack spacing={6} p={6} bgColor="white" borderRadius="md" boxShadow="sm">
        <Text fontSize="2xl" fontWeight="bold" color="teal.700">
          Dashboard Filters
        </Text>

        <Stack direction="row" spacing={6} w="100%">
          <FormControl flex={1}>
            <FormLabel fontSize="sm" fontWeight="bold" color="gray.600" mb={1}>
              Program Area
            </FormLabel>
            <Select
              value={pa}
              style={{
                width: "100%",
                borderRadius: "8px",
                borderColor: "#cbd5e0",
              }}
              onChange={(value) => {
                navigate({
                  search: (s) => ({
                    ...s,
                    pa: value,
                  }),
                });
              }}
              options={options.map((a) => ({
                label: a.name,
                value: a.code,
              }))}
            />
          </FormControl>
          <FormControl flex={1}>
            <FormLabel fontSize="sm" fontWeight="bold" color="gray.600" mb={1}>
              Indicator
            </FormLabel>
            <Select
              value={ind}
              style={{
                width: "100%",
                borderRadius: "8px",
                borderColor: "#cbd5e0",
              }}
              onChange={(value) => {
                navigate({
                  search: (s) => ({
                    ...s,
                    ind: value,
                  }),
                });
              }}
              options={filteredIndicators}
            />
          </FormControl>
        </Stack>

        <Stack direction="row" spacing={6} w="100%">
          <FormControl flex={1}>
            <FormLabel fontSize="sm" fontWeight="bold" color="gray.600" mb={1}>
              Organisation
            </FormLabel>
            <Box width="100%" borderRadius="8px" borderColor="#cbd5e0">
              <OrgUnitSelect
                table={db.dataViewOrgUnits}
                onChange={(value) =>
                  navigate({
                    search: (s) => ({
                      ...s,
                      ou: value,
                    }),
                  })
                }
                value={ou ?? ""}
              />
            </Box>
          </FormControl>
          <FormControl flex={1}>
            <FormLabel fontSize="sm" fontWeight="bold" color="gray.600" mb={1}>
              Level
            </FormLabel>
            <Select
              value={level}
              style={{
                width: "100%",
                borderRadius: "8px",
                borderColor: "#cbd5e0",
              }}
              onChange={(value) => {
                navigate({
                  search: (s) => ({
                    ...s,
                    level: value,
                  }),
                });
              }}
              options={organisationUnitLevels.map(({ name, level }) => ({
                label: name,
                value: level,
              }))}
            />
          </FormControl>
          <Spacer />
          <FormControl flex={1}>
            <FormLabel fontSize="sm" fontWeight="bold" color="gray.600" mb={1}>
              Period
            </FormLabel>
            <PeriodPicker
              periods={periods}
              changePeriod={(periods) =>
                navigate({
                  search: (s) => ({
                    ...s,
                    periods,
                  }),
                })
              }
            />
          </FormControl>
        </Stack>
      </Stack>
      <Outlet />
    </Stack>
  );
}
