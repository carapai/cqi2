import { db } from "@/db";
import { getDHIS2Resource } from "@/dhis2";
import {
    AnalyticsStructure,
    DashboardQuery,
    DevApp,
    DisplayInstance,
    OrgUnit,
    OU,
    Period,
    ProdApp,
    Program,
    SystemInfo,
    TrackedEntityInstance,
    TrackedEntityInstances,
} from "@/interfaces";
import { generateUid } from "@/utils/uid";
import { convertInstances, convertParent } from "@/utils/utils";
import { queryOptions } from "@tanstack/react-query";
import dayjs from "dayjs";
import { IndexableType, Table } from "dexie";
import { fromPairs, isArray, uniq } from "lodash";
import { generateDHIS2Periods } from "./periods";

import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);

type DHIS2OrgUnit = {
    id: string;
    name: string;
    leaf: boolean;
    parent: { id: string };
};

const getAnalyticsRowData = async (
    dataViewOrganisationUnits: DHIS2OrgUnit[],
) => {
    let data: Array<Record<string, string | string[] | number | null>> = [];
    const params = new URLSearchParams();
    params.append("hierarchyMeta", "true");
    params.append("showHierarchy", "true");
    params.append("dimension", "rVZlkzOwWhi");
    params.append("dimension", "RgNQcLejbwX");
    params.append("dimension", "TG1QzFgGTex");
    params.append("dimension", "kHRn35W3Gq4");
    params.append("dimension", "ef2RxnUK9ac");
    params.append("dimension", "eZrfD4QnQfl");
    params.append("stage", "eB7oMPVRytu");

    params.append(
        "dimension",
        `ou:${dataViewOrganisationUnits.map((d) => d.id).join(";")}`,
    );
    params.append("ouMode", "DESCENDANTS");
    params.append("startDate", "2018-01-01");
    params.append("endDate", new Date().toISOString().split("T")[0]);
    params.append("pageSize", "1000");

    let page = 1;
    let total = 1;

    let currentUnits: Record<string, string> = {};

    while (total > 0) {
        params.delete("page");
        params.append("page", page.toString());
        const results = await getDHIS2Resource<AnalyticsStructure>({
            resource: `analytics/events/query/vMfIVFcRWlu?${params.toString()}`,
        });
        let processedData = results.rows.map((row) => {
            return {
                ...row.reduce<
                    Record<string, string | string[] | number | null>
                >((acc, val, index) => {
                    const key = results.headers[index].name;
                    acc[key] = val;
                    return acc;
                }, {}),
            };
        });

        const facilities: string[] = processedData.flatMap((a) => {
            if (a["ou"] && currentUnits[String(a["ou"])]) {
                return [];
            }
            return String(a["ou"]);
        });

        if (facilities.length > 0) {
            const { organisationUnits } = await getDHIS2Resource<{
                organisationUnits: Array<{
                    id: string;
                    path: string;
                }>;
            }>({
                resource: "organisationUnits.json",
                params: {
                    fields: "id,path",
                    filter: `id:in:[${uniq(facilities).join(",")}]`,
                    paging: "false",
                },
            });

            currentUnits = {
                ...currentUnits,
                ...fromPairs(organisationUnits.map((a) => [a.id, a.path])),
            };
        }
        processedData = processedData.map((a) => {
            if (a["eventdate"]) {
                return {
                    ...a,
                    periods: Object.values(
                        generateDHIS2Periods(new Date(String(a["eventdate"]))),
                    ),
                    path: currentUnits[String(a["ou"])]?.split("/").slice(1),
                };
            }
            return {
                ...a,
                path: currentUnits[String(a["ou"])].split("/").slice(1),
            };
        });
        data = data.concat(processedData);
        total = results.height;
        page = page + 1;
    }
    return data;
};

const processDHIS2OrgUnit = ({ id, name, leaf, parent }: DHIS2OrgUnit) => {
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
};

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
        const { organisationUnits, dataViewOrganisationUnits, displayName } =
            await getDHIS2Resource<{
                organisationUnits: DHIS2OrgUnit[];
                dataViewOrganisationUnits: DHIS2OrgUnit[];
                displayName: string;
            }>({
                resource: "me.json",
                params: {
                    fields: "displayName,organisationUnits[id,name,leaf,parent],dataViewOrganisationUnits[id,name,leaf,parent]",
                },
            });

        const { systemName } = await getDHIS2Resource<SystemInfo>({
            resource: "system/info",
        });

        const initials = displayName.split(" ");
        const initialsString = `${initials[0][0]}${initials[1][0]}`;
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
        let apps: Array<{ name: string; image: string; path: string }> = [];

        if (process.env.NODE_ENV === "development") {
            const currentApps = await getDHIS2Resource<Array<DevApp>>({
                resource: "apps",
            });
            apps = currentApps.map(
                ({ name, launchUrl, baseUrl, icons: { "48": icon } }) => {
                    return {
                        path: launchUrl,
                        name,
                        image: `${baseUrl}/${icon}`,
                    };
                },
            );
        } else {
            const { modules } = await getDHIS2Resource<{
                modules: Array<ProdApp>;
            }>({
                resource: "dhis-web-commons/menu/getModules.action",
                includeApi: false,
            });
            apps = modules.map(({ defaultAction, displayName, icon, name }) => {
                let path = defaultAction;
                let image = icon;
                if (icon.startsWith("../")) {
                    path = path.replace("../", "../../../");
                    image = image.replace("../", "../../../");
                }
                return {
                    name: displayName || name,
                    path,
                    image,
                };
            });
        }

        const { programs } = await getDHIS2Resource<{
            programs: Array<{
                id: string;
                name: string;
                trackedEntityType: {
                    id: string;
                };
                withoutRegistration: boolean;
                registration: boolean;
            }>;
        }>({
            resource: "programs.json",
            params: {
                paging: "false",
                fields: "id,name,trackedEntityType,withoutRegistration,registration",
            },
        });
        const units = organisationUnits.map(processDHIS2OrgUnit);
        const viewUnits = dataViewOrganisationUnits.map(processDHIS2OrgUnit);
        await db.organisationUnits.bulkPut(units);
        await db.dataViewOrgUnits.bulkPut(viewUnits);

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

        const indicators: Array<Record<string, string>> = rows.map(
            (row: string[]) => {
                return fromPairs(
                    row.map((r, index) => [headers[index].name, r]),
                );
            },
        );
        const indicatorsObject = indicators.reduce<
            Record<string, Record<string, string>>
        >((acc, indicator) => {
            acc[indicator["event"]] = indicator;
            return acc;
        }, {});

        const programAreas = options.reduce<Record<string, string>>(
            (acc, option) => {
                acc[option.code] = option.name;
                return acc;
            },
            {},
        );
        await db.analytics.clear();
        const data = await getAnalyticsRowData(dataViewOrganisationUnits);
        await db.analytics.bulkPut(data);
        return {
            programs,
            ou: organisationUnits[0].id,
            viewUnits: dataViewOrganisationUnits.map((d) => d.id),
            options,
            organisationUnitLevels,
            indicators,
            apps,
            indicatorsObject,
            programAreas,
            systemName,
            initialsString,
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

export const dashboardsQueryOptions = (fetch?: boolean) => {
    return queryOptions({
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
            const organisationUnitLevels = await getDHIS2Resource<
                Array<{
                    id: string;
                    level: number;
                    name: string;
                }>
            >({
                resource: "filledOrganisationUnitLevels",
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
                return fromPairs(
                    row.map((r, index) => [headers[index].name, r]),
                );
            });
            if (fetch || fetch === undefined) {
                const data = await getAnalyticsRowData(
                    dataViewOrganisationUnits,
                );
                await db.analytics.bulkPut(data);
            }

            return {
                options,
                organisationUnitLevels,
                indicators,
                analyticsData: [],
            };
        },
    });
};

export const trackedEntityInstancesOptions = (
    program: string,
    search: DashboardQuery,
    processedIndicators: Record<string, Record<string, string>>,
    processedOptions: Record<string, string>,
) => {
    return queryOptions({
        queryKey: ["tracked-entity-instances", ...Object.values(search)],
        queryFn: async () => {
            const { ou, pa, ind } = search;

            let pas: string[] = [];
            let indicators: string[] = [];

            if (pa && isArray(pa) && pa.length > 0) {
                pas = pa;
            } else if (pa && !isArray(pa)) {
                pas = [pa];
            }

            if (ind && isArray(ind) && ind.length > 0) {
                indicators = ind;
            } else if (ind && !isArray(ind)) {
                indicators = [ind];
            }

            let params: Record<string, string | number> = {
                fields: "*",
                program,
                totalPages: "true",
                page: search.page ?? 1,
                pageSize: search.pageSize ?? 10,
            };
            if (ou && isArray(ou) && ou.length > 0) {
                params = { ...params, ou: ou[0], ouMode: "DESCENDANTS" };
            } else if (ou && !isArray(ou)) {
                params = { ...params, ou, ouMode: "DESCENDANTS" };
            } else {
                params = {
                    ...params,
                    ouMode: "ALL",
                };
            }
            if (indicators.length > 0) {
                params = {
                    ...params,
                    filter: `kHRn35W3Gq4:IN:${indicators.join(";")}`,
                };
            } else if (pas.length > 0) {
                params = {
                    ...params,
                    filter: `TG1QzFgGTex:IN:${pas.join(";")}`,
                };
            }
            let currentProgram = await db.programs.get(program);
            if (currentProgram === undefined) {
                currentProgram = await getDHIS2Resource<Program>({
                    resource: `programs/${program}`,
                    params: {
                        fields: "id,name,registration,programType,selectIncidentDatesInFuture,selectEnrollmentDatesInFuture,incidentDateLabel,enrollmentDateLabel,trackedEntityType[id],organisationUnits[id,name],programTrackedEntityAttributes[id,name,mandatory,valueType,displayInList,sortOrder,allowFutureDate,trackedEntityAttribute[id,name,generated,pattern,unique,valueType,orgunitScope,optionSetValue,displayFormName,optionSet[options[code,name]]]],programStages[id,name,repeatable,sortOrder,programStageDataElements[compulsory,dataElement[id,name,formName,optionSetValue,valueType,optionSet[options[code,name]]]]]",
                    },
                });
                db.programs.put(currentProgram);
            }

            const {
                trackedEntityInstances,
                pager: { total },
            } = await getDHIS2Resource<TrackedEntityInstances>({
                resource: "trackedEntityInstances",
                params,
            });
            const processed = await convertInstances(
                trackedEntityInstances,
                processedIndicators,
                processedOptions,
            );
            return { processed, total, currentProgram };
        },
    });
};

export const analyticsStructureQueryOptions = ({
    periods = [],
    level,
    ou,
}: Partial<{
    periods: Period[];
    ou: string | string[];
    level: number;
    pa: string | string[];
    ind: string | string[];
}>) => {
    const pe = periods.map((a) => a.value).join(";");
    const ous = isArray(ou) ? ou.join(";") : ou ? ou : "";

    return queryOptions({
        queryKey: ["analyticsStructure", pe, ous, level],
        queryFn: async () => {
            const params = new URLSearchParams();
            params.append("skipData", "true");
            params.append("showHierarchy", "true");
            if (pe && ous) {
                params.append("dimension", `ou:${ous};LEVEL-${level}`);
            } else if (ous) {
                params.append("dimension", `ou:${ous}`);
            } else if (level) {
                params.append("dimension", `ou:LEVEL-${level}`);
            }

            if (periods) {
                params.append("dimension", `pe:${pe}`);
            }
            const structure = await getDHIS2Resource<AnalyticsStructure>({
                resource: `analytics.json?${params.toString()}`,
            });
            return structure;
        },
    });
};

export const rawDataQueryOptions = ({
    periods = [],
    ou,
    pa = [],
    ind = [],
    level,
}: Partial<{
    periods: Period[];
    ou: string | string[];
    pa: string | string[] | undefined;
    ind: string | string[] | undefined;
    level: number | undefined;
}>) => {
    const pe = periods.map((a) => a.value);
    const ous = isArray(ou) ? ou : ou ? [ou] : [];
    const areas = isArray(pa) ? pa : pa ? [pa] : [];
    const indicators = isArray(ind) ? ind : ind ? [ind] : [];
    return queryOptions({
        queryKey: ["rawData", level, pe, ous, ...areas, ...indicators],
        queryFn: async () => {
            const data: Array<
                Record<string, string | string[] | number | null>
            > = await db.analytics.toArray();
            return data;
        },
    });
};

export const initialDataEntryOptionsOptions = queryOptions({
    queryKey: ["initial"],
    queryFn: async () => {
        const { programs } = await getDHIS2Resource<{
            programs: Array<Partial<Program>>;
        }>({
            resource: "programs.json",
            params: {
                fields: "id,name,registration,trackedEntityType",
                paging: "false",
            },
        });

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

        const previous = await db.programs.toArray();
        if (previous.length === 0) {
            await db.programs.put({
                id: programs[0].id,
            });
        }
        return { programs, ou: organisationUnits[0].id };
    },
});

export const programQueryOptions = (program: string) =>
    queryOptions({
        queryKey: ["programs", program],
        queryFn: async () => {
            const currentProgram = await getDHIS2Resource<Program>({
                resource: `programs/${program}.json`,
                params: {
                    fields: "id,name,registration,programType,selectIncidentDatesInFuture,selectEnrollmentDatesInFuture,incidentDateLabel,enrollmentDateLabel,trackedEntityType[id],organisationUnits[id,name],programTrackedEntityAttributes[id,name,mandatory,valueType,displayInList,sortOrder,allowFutureDate,trackedEntityAttribute[id,name,generated,pattern,unique,valueType,orgunitScope,optionSetValue,displayFormName,optionSet[options[code~rename(value),name~rename(label)]]]],programStages[id,name,repeatable,sortOrder,programStageDataElements[compulsory,dataElement[id,name,formName,optionSetValue,valueType,optionSet[options[code~rename(value),name~rename(label)]]]]]",
                    paging: "false",
                },
            });

            return { program: currentProgram };
        },
    });

export const trackedEntitiesQueryOptions = ({
    program,
    ou,
    registration,
    page,
    pageSize,
    ouMode,
}: {
    program: string;
    registration: boolean;
    ou: string;
    page: number;
    pageSize: number;
    ouMode: string;
}) =>
    queryOptions({
        queryKey: [
            "programs",
            program,
            ou,
            registration,
            page,
            pageSize,
            ouMode,
        ],
        queryFn: async () => {
            let results: { trackedEntities: DisplayInstance[]; total: number } =
                {
                    trackedEntities: [],
                    total: 0,
                };
            if (registration) {
                let params: Record<string, string | number> = {
                    fields: "*",
                    program,
                    totalPages: "true",
                    page,
                    pageSize,
                    order: "updatedAt:desc",
                    ouMode,
                };
                if (ou && isArray(ou) && ou.length > 0) {
                    params = {
                        ...params,
                        ou: ou[0],
                    };
                } else if (ou && !isArray(ou)) {
                    params = {
                        ...params,
                        ou,
                    };
                } else {
                    params = {
                        ...params,
                        ouMode: "ALL",
                    };
                }

                const {
                    trackedEntityInstances,
                    pager: { total },
                } = await getDHIS2Resource<TrackedEntityInstances>({
                    resource: "trackedEntityInstances",
                    params,
                });

                const allOrganizations = uniq(
                    trackedEntityInstances.map(({ orgUnit }) => orgUnit),
                );
                const { organisationUnits } = await getDHIS2Resource<{
                    organisationUnits: Array<OU>;
                }>({
                    resource: "organisationUnits.json",
                    params: {
                        filter: `id:in:[${allOrganizations.join(",")}]`,
                        fields: "id,name,parent[id,name,parent[id,name,parent[id,name,parent[id,name]]]]",
                    },
                });

                const facilities = fromPairs(
                    organisationUnits.map(({ id, name, parent }) => {
                        return [
                            id,
                            [name, ...convertParent([], parent)]
                                .reverse()
                                .join("/"),
                        ];
                    }),
                );

                const trackedEntities: Array<DisplayInstance> =
                    trackedEntityInstances.map(
                        ({ attributes, enrollments, ...rest }) => ({
                            ...rest,
                            attributesObject: fromPairs(
                                attributes
                                    .concat(
                                        enrollments.flatMap(
                                            ({ attributes }) =>
                                                attributes ?? [],
                                        ),
                                    )
                                    .map(({ value, attribute }) => [
                                        attribute,
                                        value,
                                    ]),
                            ),
                            attributes,
                            firstEnrollment:
                                enrollments.length > 0
                                    ? enrollments[0].enrollment
                                    : "",
                            path: facilities[rest.orgUnit],
                        }),
                    );

                results = { ...results, trackedEntities, total };
            } else {
                console.log("not registration");
            }
            return results;
        },
    });

export const trackedEntityQueryOptions = ({
    entity,
    program,
    editing,
}: {
    entity: string;
    program: string;
    editing: boolean;
}) =>
    queryOptions({
        queryKey: ["entity", entity, editing, program],
        queryFn: async () => {
            await db.instances.clear();
            let displayInstance: DisplayInstance = {
                attributesObject: {},
                firstEnrollment: generateUid(),
            };
            if (editing) {
                const instance = await getDHIS2Resource<TrackedEntityInstance>({
                    resource: `trackedEntityInstances/${entity}.json`,
                    params: { fields: "*", program },
                });
                displayInstance = {
                    ...instance,
                    attributesObject: fromPairs(
                        instance.attributes
                            .concat(
                                instance.enrollments.flatMap(
                                    ({ attributes }) => attributes ?? [],
                                ),
                            )
                            .map(({ value, attribute }) => [attribute, value]),
                    ),
                    firstEnrollment:
                        instance.enrollments.length > 0
                            ? instance.enrollments[0].enrollment
                            : "",
                };

                await db.instances.put(displayInstance);
            }
            return displayInstance;
        },
    });
