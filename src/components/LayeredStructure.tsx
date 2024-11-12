import { analyticsStructureQueryOptions } from "@/queryOptions";
import { useQuery } from "@tanstack/react-query";
import { useSearch } from "@tanstack/react-router";
import Layered from "./Layered";
import { Loading } from "@/components/Loading";
export default function Structure() {
    const { periods, level, ou, pa, ind } = useSearch({
        from: "/dashboards/$id",
    });
    const { isLoading, data } = useQuery(
        analyticsStructureQueryOptions({ level, ou, periods, pa, ind }),
    );
    if (isLoading || !data) return <Loading />;

    return <Layered structure={data} />;
}
