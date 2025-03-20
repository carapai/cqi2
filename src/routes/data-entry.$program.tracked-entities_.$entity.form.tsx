import { Loading } from "@/components/Loading";
import RegistrationForm from "@/components/RegistrationForm";
import SMAndESheet from "@/components/SMAndESheet";
import { FormValidator } from "@/interfaces";
import { trackedEntityQueryOptions } from "@/queryOptions";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
    createFileRoute,
    useLoaderData,
    useParams,
    useSearch,
} from "@tanstack/react-router";

export const Route = createFileRoute(
    "/data-entry/$program/tracked-entities_/$entity/form",
)({
    component: DataEntryProgramTrackedEntitiesEntityFormComponent,
    validateSearch: FormValidator,
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

function DataEntryProgramTrackedEntitiesEntityFormComponent() {
    const { entity, program: currentProgram } = useParams({
        from: "/data-entry/$program/tracked-entities_/$entity/form",
    });
    const { editing, registration } = useSearch({
        from: "/data-entry/$program/tracked-entities_/$entity/form",
    });
    const { program } = useLoaderData({
        from: "/data-entry/$program",
    });
    const { data: displayInstance } = useSuspenseQuery(
        trackedEntityQueryOptions({
            entity,
            program: currentProgram,
            editing,
            registration,
        }),
    );
    if (currentProgram === "IWbUuKygUEV")
        return (
            <SMAndESheet
                programStageSections={
                    program.programStages[0].programStageSections
                }
                displayInstance={displayInstance}
            />
        );

    return (
        <RegistrationForm
            programTrackedEntityAttributes={
                program.programTrackedEntityAttributes
            }
            program={program.id}
            displayInstance={displayInstance}
        />
    );
}
