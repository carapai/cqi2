import { trackedEntityInstancesOptions } from "@/queryOptions";
import { useQuery } from "@tanstack/react-query";
import { useLoaderData, useSearch } from "@tanstack/react-router";
import ProjectList from "@/components/ProjectList";
import { Loading } from "@/components/Loading";
export default function Projects() {
    const search = useSearch({ from: "/dashboards/$id" });

    const { indicators, options } = useLoaderData({ from: "__root__" });
    const processedIndicators = indicators.reduce<
        Record<string, Record<string, string>>
    >((acc, i) => {
        acc[i.event] = i;
        return acc;
    }, {});

    const processedOptions = options.reduce<Record<string, string>>(
        (acc, i) => {
            acc[i.code] = i.name;
            return acc;
        },
        {},
    );
    const { data, isLoading, isError, error } = useQuery(
        trackedEntityInstancesOptions(
            "vMfIVFcRWlu",
            search,
            processedIndicators,
            processedOptions,
        ),
    );

    console.log(data);
    if (isError) return <pre>{JSON.stringify(error)}</pre>;

    if (isLoading) return <Loading />;

    if (data) return <ProjectList data={data} />;
}
