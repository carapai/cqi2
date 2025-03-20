import EventTable from "@/components/EventTable";
import { Loading } from "@/components/Loading";
import MultiEvents from "@/components/MultiEvents";
import { InstanceValidator } from "@/interfaces";
import { trackedEntityQueryOptions } from "@/queryOptions";
import { Stack } from "@chakra-ui/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
    createFileRoute,
    useLoaderData,
    useNavigate,
    useParams,
    useSearch,
} from "@tanstack/react-router";

import type { TabsProps } from "antd";
import { Tabs } from "antd";

export const Route = createFileRoute(
    "/data-entry/$program/tracked-entities_/$entity/",
)({
    component: DataEntryProgramTrackedEntitiesEntityComponent,
    validateSearch: InstanceValidator,

    loaderDeps: ({ search: { editing, registration } }) => ({
        editing,
        registration,
    }),
    loader: ({
        params: { entity, program },
        context: { queryClient },
        deps: { editing, registration },
    }) =>
        queryClient.ensureQueryData(
            trackedEntityQueryOptions({
                entity,
                program,
                editing,
                registration,
            }),
        ),

    pendingComponent: () => <Loading />,
});

function DataEntryProgramTrackedEntitiesEntityComponent() {
    const { entity, program: currentProgram } = useParams({
        from: "/data-entry/$program/tracked-entities_/$entity/",
    });
    const { editing, stage, registration } = useSearch({
        from: "/data-entry/$program/tracked-entities_/$entity/",
    });
    const { program } = useLoaderData({
        from: "/data-entry/$program",
    });

    const navigate = useNavigate({
        from: Route.fullPath,
    });

    const onChange = (key: string) => {
        navigate({ search: (prev) => ({ ...prev, stage: key }) });
    };

    const { data: displayInstance } = useSuspenseQuery(
        trackedEntityQueryOptions({
            entity,
            program: currentProgram,
            editing,
            registration,
        }),
    );

    const items: TabsProps["items"] = program.programStages.map(
        ({ id, name }) => {
            const events = displayInstance.enrollments?.flatMap((enrollment) =>
                enrollment.events.filter((event) => event.programStage === id),
            );
            const programStageDataElements = program.programStages.flatMap(
                (stage) => {
                    if (stage.id === id) {
                        return stage.programStageDataElements;
                    }
                    return [];
                },
            );
            const label =
                stage === "UTZ2gDIXFP1"
                    ? "Add Summary of Observations"
                    : "Add Changes Worksheet";
            let children = (
                <EventTable
                    events={events}
                    programStageDataElements={programStageDataElements}
                    label={label}
                />
            );

            if (id === "eB7oMPVRytu") {
                children = <MultiEvents events={events} />;
            }
            return {
                key: id,
                label: name,
                children: (
                    <Stack
                        borderRadius="md"
                        boxShadow="0 0 20px rgba(0, 0, 0, 0.1)"
                        p="15px"
                        children={children}
                    />
                ),
            };
        },
    );

    return <Tabs defaultActiveKey={stage} items={items} onChange={onChange} />;
}
