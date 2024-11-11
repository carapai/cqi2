import Admin from "@/components/Admin";
import Indicators from "@/components/Indicators";
import LayeredStructure from "@/components/LayeredStructure";
import Projects from "@/components/Projects";
import SwitchComponent, { Case } from "@/components/SwitchComponent";
import { createFileRoute, useParams } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboards/$id")({
    component: Component,
});

function Component() {
    const { id } = useParams({ from: Route.fullPath });
    return (
        <SwitchComponent condition={id}>
            <Case value="projects">
                <Projects />
            </Case>
            <Case value="indicators">
                <Indicators />
            </Case>
            <Case value="layered">
                <LayeredStructure />
            </Case>
            <Case value="admin">
                <Admin />
            </Case>
            <Case default>{id}</Case>
        </SwitchComponent>
    );
}
