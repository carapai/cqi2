import { trackedEntityInstancesOptions } from "@/queryOptions";
import { useQuery } from "@tanstack/react-query";
import { useSearch } from "@tanstack/react-router";
import ProjectList from "./ProjectList";
export default function Projects() {
    const search = useSearch({ from: "/dashboards/$id" });
    const { data, isLoading, isError, error } = useQuery(
        trackedEntityInstancesOptions("vMfIVFcRWlu", search),
    );
    if (isError) return <pre>{JSON.stringify(error)}</pre>;

    if (isLoading) return <pre>Loading...</pre>;

    if (data) return <ProjectList data={data} />;
}
