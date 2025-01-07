import { Loading } from "@/components/Loading";
import RegistrationForm from "@/components/RegistrationForm";
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
    loaderDeps: ({ search: { editing } }) => ({
        editing,
    }),
    loader: ({
        params: { entity, program },
        context: { queryClient },
        deps: { editing },
    }) =>
        queryClient.ensureQueryData(
            trackedEntityQueryOptions({
                entity,
                program,
                editing,
            }),
        ),
    pendingComponent: () => <Loading />,
});

function DataEntryProgramTrackedEntitiesEntityFormComponent() {
    const { entity, program: currentProgram } = useParams({
        from: "/data-entry/$program/tracked-entities_/$entity/form",
    });
    const { editing } = useSearch({
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
        }),
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
