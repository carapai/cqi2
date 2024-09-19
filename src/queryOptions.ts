import { getDHIS2Resource } from "@/dhis2";
import { OrgUnit } from "@/interfaces";
import { queryOptions } from "@tanstack/react-query";
import { db } from "./db";
import { fromPairs } from "lodash";
import { IndexableType, Table } from "dexie";

const getApps = async () => {
    if (process.env.NODE_ENV === "production") {
        const { modules } = await getDHIS2Resource<{
            modules: Array<{
                name: string;
                namespace: string;
                defaultAction: string;
                displayName: string;
                icon: string;
                description: string;
            }>;
        }>({
            resource: "dhis-web-commons/menu/getModules.action",
            includeApi: false,
        });
        return modules;
    }
    return [];
};

export const initialQueryOptions = queryOptions({
    queryKey: ["initial"],
    queryFn: async () => {
        const { organisationUnits } = await getDHIS2Resource<{
            organisationUnits: Array<{
                id: string;
                name: string;
                leaf: boolean;
                parent: { id: string };
            }>;
        }>({
            resource: "me.json",
            params: {
                fields: "organisationUnits[id,name,leaf,parent]",
            },
        });

        const { headers, rows } = await getDHIS2Resource<{
            headers: Array<Record<string, string>>;
            rows: string[][];
        }>({
            resource: "events/query.json",
            params: {
                ouMode: "ALL",
                programStage: "vPQxfsUQLEy",
                includeAllDataElements: "true",
                skipPaging: "true",
            },
        });
        const { organisationUnitLevels } = await getDHIS2Resource<{
            organisationUnitLevels: Array<{
                id: string;
                level: number;
                name: string;
            }>;
        }>({
            resource: "organisationUnitLevels",
            params: {
                fields: "id,name,level",
                order: "level:asc",
            },
        });
        const { options } = await getDHIS2Resource<{
            options: Array<{ id: string; code: string; name: string }>;
        }>({
            resource: "optionSets/uKIuogUIFgl",
            params: {
                fields: "options[id,code,name]",
            },
        });
        const { programs } = await getDHIS2Resource<{
            programs: Array<{
                id: string;
                name: string;
                trackedEntityType: string;
                withoutRegistration: boolean;
            }>;
        }>({
            resource: "programs.json",
            params: {
                paging: "false",
                fields: "id,name,trackedEntityType,withoutRegistration",
            },
        });

        const units = organisationUnits.map(({ id, name, leaf, parent }) => {
            let current: OrgUnit = {
                id,
                title: name,
                isLeaf: leaf,
                value: id,
                key: id,
            };

            if (parent && parent.id) {
                current = {
                    ...current,
                    pId: parent.id,
                };
            }
            return current;
        });
        await db.organisationUnits.bulkPut(units);

        const indicators = rows.map((row: string[]) => {
            return fromPairs(row.map((r, index) => [headers[index].name, r]));
        });

        return {
            programs,
            ou: organisationUnits[0].id,
            options,
            organisationUnitLevels,
            indicators,
        };
    },
});

export const orgUnitQueryOptions = (
    orgUnit: string,
    table: Table<OrgUnit, IndexableType>,
) => {
    return queryOptions({
        queryKey: ["organisations", orgUnit],
        queryFn: async () => {
            const { children } = await getDHIS2Resource<{
                children: Array<{
                    id: string;
                    name: string;
                    leaf: boolean;
                }>;
            }>({
                resource: `organisationUnits/${orgUnit}`,
                params: {
                    fields: "children[id,name,leaf]",
                },
            });

            const organisationUnits = children.map(({ id, name, leaf }) => {
                const current: OrgUnit = {
                    id,
                    title: name,
                    isLeaf: leaf,
                    value: id,
                    key: id,
                    pId: orgUnit,
                };
                return current;
            });
            await table.bulkPut(organisationUnits);
            return "Done";
        },
    });
};

export const appsQueryOptions = queryOptions({
    queryKey: ["apps"],
    queryFn: async () => {
        return getApps();
    },
});

export const dashboardsQueryOptions = queryOptions({
    queryKey: ["dashboards"],
    queryFn: async () => {
        const { dataViewOrganisationUnits } = await getDHIS2Resource<{
            dataViewOrganisationUnits: Array<{
                id: string;
                name: string;
                leaf: boolean;
                parent: { id: string };
            }>;
        }>({
            resource: "me.json",
            params: {
                fields: "dataViewOrganisationUnits[id,name,leaf,parent]",
            },
        });

        const { headers, rows } = await getDHIS2Resource<{
            headers: Array<Record<string, string>>;
            rows: string[][];
        }>({
            resource: "events/query.json",
            params: {
                ouMode: "ALL",
                programStage: "vPQxfsUQLEy",
                includeAllDataElements: "true",
                skipPaging: "true",
            },
        });
        const { organisationUnitLevels } = await getDHIS2Resource<{
            organisationUnitLevels: Array<{
                id: string;
                level: number;
                name: string;
            }>;
        }>({
            resource: "organisationUnitLevels",
            params: {
                fields: "id,name,level",
                order: "level:asc",
            },
        });
        const { options } = await getDHIS2Resource<{
            options: Array<{ id: string; code: string; name: string }>;
        }>({
            resource: "optionSets/uKIuogUIFgl",
            params: {
                fields: "options[id,code,name]",
            },
        });

        const organisationUnits = dataViewOrganisationUnits.map(
            ({ id, name, leaf, parent }) => {
                let current: OrgUnit = {
                    id,
                    title: name,
                    isLeaf: leaf,
                    value: id,
                    key: id,
                };

                if (parent && parent.id) {
                    current = {
                        ...current,
                        pId: parent.id,
                    };
                }
                return current;
            },
        );
        await db.dataViewOrgUnits.bulkPut(organisationUnits);

        const indicators = rows.map((row: string[]) => {
            return fromPairs(row.map((r, index) => [headers[index].name, r]));
        });

        return {
            options,
            organisationUnitLevels,
            indicators,
        };
    },
});
