import AppsDropdown from "@/components/AppsDropdown";
import { LinkButton } from "@/components/LinkButton";
import { UserDropdown } from "@/components/UserDropdown";
import { initialQueryOptions } from "@/queryOptions";
import { Spacer, Stack, Text } from "@chakra-ui/react";
import { QueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { Image } from "antd";

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
        data: {
            ou,
            viewUnits,
            options,
            indicators,
            apps,
            systemName,
            initialsString,
        },
    } = useSuspenseQuery(initialQueryOptions);

    const pa = options?.[0].code;
    const ind = indicators.find((i) => i["kuVtv8R9n8q"] === pa)?.["event"];

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
                <Stack
                    as="a"
                    href="../../.."
                    direction="row"
                    spacing={2}
                    alignItems="center"
                >
                    <Image
                        src="../../api/staticContent/logo_banner"
                        height="40px"
                        preview={false}
                        alt="DHIS2 Logo"
                    />
                    <Text fontSize="sm" fontWeight="bold">
                        {systemName} - Continuous Quality Improvement
                    </Text>
                </Stack>

                <Spacer />
                <Stack direction="row" spacing={8} alignItems="center">
                    <Image
                        src="interpretations.png"
                        width="20px"
                        alt="Interpretations Icon"
                        preview={false}
                    />
                    <Image
                        src="messages.png"
                        width="20px"
                        alt="Messages Icon"
                        preview={false}
                    />

                    <AppsDropdown apps={apps} />
                    <UserDropdown
                        initials={initialsString}
                        fullName="Administrator System"
                        email="amutesasira@hispuganda.org"
                    />
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
                    <LinkButton
                        to="/"
                        shape="round"
                        activeProps={{
                            style: { background: "#1677ff", color: "white" },
                        }}
                    >
                        Home
                    </LinkButton>
                    <LinkButton
                        to="/data-entry/$program/tracked-entities"
                        activeProps={{
                            style: { background: "#1677ff", color: "white" },
                        }}
                        search={{
                            ou,
                            registration: true,
                            pageSize: 10,
                            page: 1,
                            type: "KSy4dEvpMWi",
                            ouMode: "DESCENDANTS",
                        }}
                        params={{ program: "vMfIVFcRWlu" }}
                        shape="round"
                    >
                        Data Entry
                    </LinkButton>

                    <LinkButton
                        to="/dashboards/$id"
                        params={{ id: "layered" }}
                        activeProps={{
                            style: { background: "#1677ff", color: "white" },
                        }}
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
                        shape="round"
                    >
                        Layered Dashboard
                    </LinkButton>

                    <LinkButton
                        to="/dashboards/$id"
                        params={{ id: "indicators" }}
                        activeProps={{
                            style: { background: "#1677ff", color: "white" },
                        }}
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
                        shape="round"
                    >
                        All Indicators
                    </LinkButton>

                    <LinkButton
                        to="/dashboards/$id"
                        params={{ id: "projects" }}
                        search={{
                            page: 1,
                            pageSize: 10,
                            ou: viewUnits,
                            mode: "multiple",
                        }}
                        activeProps={{
                            style: { background: "#1677ff", color: "white" },
                        }}
                        shape="round"
                    >
                        Projects
                    </LinkButton>

                    <LinkButton
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
                        activeProps={{
                            style: { background: "#1677ff", color: "white" },
                        }}
                        shape="round"
                    >
                        {/* <Button
                            shape="round"
                            style={{ borderColor: "#9B2C2C", color: "#9B2C2C" }}
                        > */}
                        Admin Dashboard
                        {/* </Button> */}
                    </LinkButton>
                </Stack>
            </Stack>
            <Outlet />
        </Stack>
    );
}
