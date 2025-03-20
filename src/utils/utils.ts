import type { DatePickerProps } from "antd";
import dayjs, { ManipulateType } from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import quarterOfYear from "dayjs/plugin/quarterOfYear";
import { Style as ExcelStyle } from "exceljs";
import { ExcelGenerator } from "@/ExcelGenerator";
import {
    Dictionary,
    fromPairs,
    isArray,
    orderBy,
    range,
    sum,
    uniq,
} from "lodash";
import {
    AnalyticsStructure,
    ExcelHeader,
    Option,
    CellStyle,
    Parent,
    DisplayInstance,
    ProgramTrackedEntityAttribute,
    DashboardQuery,
    TrackedEntityInstance,
    TrackedEntityInstances,
    InstanceDisplay,
} from "../interfaces";
import { db } from "@/db";
import { getDHIS2Resource } from "@/dhis2";

dayjs.extend(isoWeek);
dayjs.extend(quarterOfYear);
export const createOption = (array: Array<string>): Array<Option> => {
    return array.map((value) => {
        const option: Option = { label: value, value };
        return option;
    });
};

export const createOptions2 = (
    array: Array<string>,
    array2: Array<string>,
): Array<Option> => {
    return array.map((value, index) => {
        return { label: value, value: array2[index] };
    });
};

export const convertInstances = async (
    trackedEntityInstances: TrackedEntityInstance[],
    processedIndicators: Record<string, Record<string, string>>,
    processedOptions: Record<string, string>,
) => {
    const allOrganizations = uniq(
        trackedEntityInstances.map(({ orgUnit }) => orgUnit),
    );
    const { organisationUnits } = await getDHIS2Resource<{
        organisationUnits: Array<{
            id: string;
            name: string;
            parent?: Parent;
        }>;
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
                [name, ...convertParent([], parent)].reverse().join("/"),
            ];
        }),
    );

    const processed: Array<InstanceDisplay> = trackedEntityInstances.map(
        ({ attributes, enrollments, ...rest }) => {
            const allEvents: Record<string, string> = {};
            orderBy(
                enrollments[0].events.filter(
                    ({ programStage }) => programStage === "eB7oMPVRytu",
                ),
                "eventDate",
                "asc",
            ).forEach((e, index) => {
                allEvents[`${index}e`] = dayjs(e.eventDate).format(
                    "YYYY-MM-DD",
                );
                const numerator = e.dataValues.find(
                    (dv) => dv.dataElement === "rVZlkzOwWhi",
                );
                const denominator = e.dataValues.find(
                    (dv) => dv.dataElement === "RgNQcLejbwX",
                );
                if (numerator) {
                    allEvents[`${index}n`] = numerator.value ?? "";
                }
                if (denominator) {
                    allEvents[`${index}d`] = denominator.value ?? "";
                }
            });
            const attributeValues: Record<string, string> = {};
            attributes
                .concat(
                    enrollments.flatMap(({ attributes }) => attributes ?? []),
                )
                .forEach(({ value, attribute }) => {
                    if (attribute === "kHRn35W3Gq4") {
                        attributeValues["kToJ1rk0fwY"] =
                            processedIndicators[value]?.["kToJ1rk0fwY"];
                        attributeValues["WI6Qp8gcZFX"] =
                            processedIndicators[value]?.["WI6Qp8gcZFX"];
                        attributeValues["krwzUepGwj7"] =
                            processedIndicators[value]?.["krwzUepGwj7"];
                    } else if (attribute === "TG1QzFgGTex") {
                        attributeValues[attribute] =
                            processedOptions[value] ?? "";
                    } else {
                        attributeValues[attribute] = value;
                    }
                });
            return {
                ...rest,
                attributesObject: {
                    ...attributeValues,
                    path: facilities[rest.orgUnit],
                    ...allEvents,
                },
                attributes,
                firstEnrollment:
                    enrollments.length > 0 ? enrollments[0].enrollment : "",
            };
        },
    );
    return processed;
};

export const relativePeriods: { [key: string]: Option[] } = {
    DAILY: [
        { value: "TODAY", label: "Today" },
        { value: "YESTERDAY", label: "Yesterday" },
        { value: "LAST_3_DAYS", label: "Last 3 days" },
        { value: "LAST_7_DAYS", label: "Last 7 days" },
        { value: "LAST_14_DAYS", label: "Last 14 days" },
        { value: "LAST_30_DAYS", label: "Last 30 days" },
        { value: "LAST_60_DAYS", label: "Last 60 days" },
        { value: "LAST_90_DAYS", label: "Last 90 days" },
        { value: "LAST_180_DAYS", label: "Last 180 days" },
    ],
    WEEKLY: [
        { value: "THIS_WEEK", label: "This week" },
        { value: "LAST_WEEK", label: "Last week" },
        { value: "LAST_4_WEEKS", label: "Last 4 weeks" },
        { value: "LAST_12_WEEKS", label: "Last 12 weeks" },
        { value: "LAST_52_WEEKS", label: "Last 52 weeks" },
        { value: "WEEKS_THIS_YEAR", label: "Weeks this year" },
    ],
    BIWEEKLY: [
        { value: "THIS_BIWEEK", label: "This bi-week" },
        { value: "LAST_BIWEEK", label: "Last bi-week" },
        { value: "LAST_4_BIWEEKS", label: "Last 4 bi-weeks" },
    ],
    MONTHLY: [
        { value: "THIS_MONTH", label: "This month" },
        { value: "LAST_MONTH", label: "Last month" },
        { value: "LAST_3_MONTHS", label: "Last 3 months" },
        { value: "LAST_6_MONTHS", label: "Last 6 months" },
        { value: "LAST_12_MONTHS", label: "Last 12 months" },
        {
            value: "MONTHS_THIS_YEAR",
            label: "Months this year",
        },
    ],
    BIMONTHLY: [
        { value: "THIS_BIMONTH", label: "This bi-month" },
        { value: "LAST_BIMONTH", label: "Last bi-month" },
        {
            value: "LAST_6_BIMONTHS",
            label: "Last 6 bi-months",
        },
        {
            value: "BIMONTHS_THIS_YEAR",
            label: "Bi-months this year",
        },
    ],
    QUARTERLY: [
        { value: "THIS_QUARTER", label: "This quarter" },
        { value: "LAST_QUARTER", label: "Last quarter" },
        { value: "LAST_4_QUARTERS", label: "Last 4 quarters" },
        {
            value: "QUARTERS_THIS_YEAR",
            label: "Quarters this year",
        },
    ],
    SIXMONTHLY: [
        { value: "THIS_SIX_MONTH", label: "This six-month" },
        { value: "LAST_SIX_MONTH", label: "Last six-month" },
        {
            value: "LAST_2_SIXMONTHS",
            label: "Last 2 six-month",
        },
    ],
    FINANCIAL: [
        {
            value: "THIS_FINANCIAL_YEAR",
            label: "This financial year",
        },
        {
            value: "LAST_FINANCIAL_YEAR",
            label: "Last financial year",
        },
        {
            value: "LAST_5_FINANCIAL_YEARS",
            label: "Last 5 financial years",
        },
    ],
    YEARLY: [
        { value: "THIS_YEAR", label: "This year" },
        { value: "LAST_YEAR", label: "Last year" },
        { value: "LAST_5_YEARS", label: "Last 5 years" },
        { value: "LAST_10_YEARS", label: "Last 10 years" },
    ],
};
export const fixedPeriods = [
    "DAILY",
    "WEEKLY",
    "WEEKLYWED",
    "WEEKLYTHU",
    "WEEKLYSAT",
    "WEEKLYSUN",
    "BIWEEKLY",
    "MONTHLY",
    "BIMONTHLY",
    "QUARTERLY",
    "QUARTERLYNOV",
    "SIXMONTHLY",
    "SIXMONTHLYAPR",
    "SIXMONTHLYNOV",
    "YEARLY",
    "FYNOV",
    "FYOCT",
    "FYJUL",
    "FYAPR",
];

export const periodDBColumns = {
    DAILY: "daily",
    WEEKLY: "weekly",
    WEEKLYWED: "weeklywednesday",
    WEEKLYTHU: "weeklythursday",
    WEEKLYSAT: "weeklysaturday",
    WEEKLYSUN: "weeklysunday",
    BIWEEKLY: "biweekly",
    MONTHLY: "monthly",
    BIMONTHLY: "bimonthly",
    QUARTERLY: "quarterly",
    QUARTERLYNOV: "quarterlynov",
    SIXMONTHLY: "sixmonthly",
    SIXMONTHLYAPR: "sixmonthlyapr",
    SIXMONTHLYNOV: "sixmonthlynov",
    YEARLY: "yearly",
    FYNOV: "financialnov",
    FYOCT: "financialoct",
    FYJUL: "financialjuly",
    FYAPR: "financialapril",
};

/*
 * Get an array of last periods
 *
 * @param n the number to look back e.g n months back
 * @param periodType the type of periods. one of weeks, months, quarters, years
 * @paran includeCurrent whether to include current period. e.g if true last_3_months includes the current month
 * @return a list of relative periods
 */
const lastNPeriods = (
    n: number,
    periodType: ManipulateType,
    includeCurrent: boolean = false,
) => {
    /*The momentjs fomarts for the periodsTypes*/
    const dateFormats: { [key: string]: string } = {
        days: "YYYYMMDD",
        weeks: "YYYY[W]W",
        months: "YYYYMM",
        years: "YYYY",
        quarters: "YYYY[Q]Q",
    };

    const periods = new Set<string>();
    /* toLocaleUpperCase() is added because of special treatment to quarters formating*/
    if (n === 0) {
        periods.add(dayjs().format(dateFormats[periodType]));
        return Array.from(periods);
    }
    for (let i = n; i >= 1; i--) {
        periods.add(
            dayjs().subtract(i, periodType).format(dateFormats[periodType]),
        );
    }
    if (includeCurrent) {
        periods.add(dayjs().format(dateFormats[periodType]));
    }
    return Array.from(periods);
};

export const relativePeriods2: { [key: string]: string[] } = {
    TODAY: lastNPeriods(0, "days"),
    YESTERDAY: lastNPeriods(1, "days"),
    LAST_3_DAYS: lastNPeriods(3, "days"),
    LAST_7_DAYS: lastNPeriods(7, "days"),
    LAST_14_DAYS: lastNPeriods(14, "days"),
    LAST_30_DAYS: lastNPeriods(30, "days"),
    LAST_60_DAYS: lastNPeriods(60, "days"),
    LAST_90_DAYS: lastNPeriods(90, "days"),
    LAST_180_DAYS: lastNPeriods(180, "days"),
    THIS_WEEK: lastNPeriods(0, "weeks"),
    LAST_WEEK: lastNPeriods(1, "weeks"),
    LAST_4_WEEKS: lastNPeriods(4, "weeks"),
    LAST_12_WEEKS: lastNPeriods(12, "weeks"),
    LAST_52_WEEKS: lastNPeriods(52, "weeks"),
    WEEKS_THIS_YEAR: lastNPeriods(dayjs().isoWeek() - 1, "weeks", true),
    THIS_MONTH: lastNPeriods(0, "months"),
    LAST_MONTH: lastNPeriods(1, "months"),
    LAST_3_MONTHS: lastNPeriods(3, "months"),
    LAST_6_MONTHS: lastNPeriods(6, "months"),
    LAST_12_MONTHS: lastNPeriods(12, "months"),
    MONTHS_THIS_YEAR: lastNPeriods(dayjs().month(), "months", true),
    THIS_YEAR: lastNPeriods(0, "years"),
    LAST_YEAR: lastNPeriods(1, "years"),
    LAST_5_YEARS: lastNPeriods(5, "years"),
    LAST_10_YEARS: lastNPeriods(10, "years"),
    THIS_QUARTER: lastNPeriods(0, "months"),
    LAST_QUARTER: lastNPeriods(1 * 3, "months"),
    LAST_4_QUARTERS: lastNPeriods(4 * 3, "months"),
    QUARTERS_THIS_YEAR: lastNPeriods(
        (dayjs().quarter() - 1) * 3,
        "months",
        true,
    ),
};

export const convertParent = (found: string[], parent?: Parent): string[] => {
    if (parent) {
        found = [...found, parent.name];
        if (parent.parent) {
            return convertParent(found, parent.parent);
        }
    }

    return found;
};

export const reviewPeriodString = (
    frequency: string | undefined,
): DatePickerProps["picker"] => {
    const Options: Record<string, DatePickerProps["picker"]> = {
        Daily: "date",
        Weekly: "week",
        Monthly: "month",
    };

    if (frequency) {
        return Options[frequency];
    }
    return "month";
};

export const computerIndicator = (
    processedData: Array<Record<string, string | string[] | number | null>>,
) => {
    const numerators = processedData.map((i) => Number(i["rVZlkzOwWhi"] ?? 0));
    const denominators = processedData.map((i) =>
        Number(i["RgNQcLejbwX"] ?? 0),
    );
    let value = NaN;

    if (
        numerators.length > 0 &&
        denominators.length > 0 &&
        sum(denominators) > 0
    ) {
        value = sum(numerators) / sum(denominators);

        return {
            value,
            numerator: sum(numerators),
            denominator: sum(denominators),
        };
    } else if (sum(denominators) === 0) {
        value = 0;

        return {
            value,
            numerator: sum(numerators),
            denominator: sum(denominators),
        };
    }

    return { value: 0, numerator: "-", denominator: "-" };
};

export function convertToExcelStyle(
    customStyle?: CellStyle,
): Partial<ExcelStyle> | undefined {
    if (!customStyle) return undefined;

    return {
        font: customStyle.font,
        fill: customStyle.fill,
        border: customStyle.border,
        alignment: customStyle.alignment,
        numFmt: customStyle.numFmt,
    };
}

export const DEFAULT_HEADER_STYLE: CellStyle = {
    font: {
        bold: true,
        color: { argb: "000000" },
    },
    fill: {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE0E0E0" },
    },
    alignment: {
        vertical: "middle",
        horizontal: "center",
    },
    borders: {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
    },
};

export const downloadProjects = async ({
    programTrackedEntityAttributes,
    search,
    program,
    processedIndicators,
    processedOptions,
}: {
    search: DashboardQuery;
    program: string;
    programTrackedEntityAttributes: ProgramTrackedEntityAttribute[];
    processedIndicators: Record<string, Record<string, string>>;
    processedOptions: Record<string, string>;
}) => {
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

    let page = 1;
    let total = 1;

    let instances: DisplayInstance[] = [];
    while (total > 0) {
        const { trackedEntityInstances } =
            await getDHIS2Resource<TrackedEntityInstances>({
                resource: "trackedEntityInstances",
                params: { ...params, page },
            });
        const displayInstance = await convertInstances(
            trackedEntityInstances,
            processedIndicators,
            processedOptions,
        );
        instances = instances.concat(displayInstance);
        total = trackedEntityInstances.length;
        page++;
    }

    const headers: ExcelHeader[] = programTrackedEntityAttributes
        .flatMap((pea) => {
            if (pea.trackedEntityAttribute.id === "kHRn35W3Gq4") {
                return [
                    {
                        title: pea.trackedEntityAttribute.name,
                        key: "kToJ1rk0fwY",
                        autoWidth: true,
                    },
                    {
                        title: "Numerator",
                        key: "WI6Qp8gcZFX",
                        autoWidth: true,
                    },
                    {
                        title: "Denominator",
                        key: "krwzUepGwj7",
                        autoWidth: true,
                    },
                ];
            }
            return {
                title: pea.trackedEntityAttribute.name,
                key: pea.trackedEntityAttribute.id,
                autoWidth: true,
            };
        })
        .concat(
            range(12).map((i) => ({
                title: `Period ${i + 1}`,
                autoWidth: true,
                key: `Period ${i + 1}`,
                children: [
                    {
                        title: "P",
                        key: `${i}e`,
                        autoWidth: true,
                    },
                    {
                        title: "N",
                        key: `${i}n`,
                        autoWidth: true,
                    },
                    {
                        title: "D",
                        key: `${i}n`,
                        autoWidth: true,
                    },
                ],
            })),
        );

    const generator = new ExcelGenerator();

    const finalData = instances.map((d) => {
        return d.attributesObject ?? {};
    });

    try {
        await generator.downloadExcel(headers, finalData, "projects.xlsx", {
            sheetName: "Projects",
        });
    } catch (error) {
        console.error("Error generating Excel file:", error);
    }
};
export const downloadIndicators = async ({
    structure,
    filter,
    indicators,
}: {
    structure: AnalyticsStructure;
    filter?: "ou" | "period";
    indicators: Dictionary<string>[];
}) => {
    const availableData: Array<
        Record<string, string | string[] | number | null>
    > = await db.analytics.toArray();
    const headers: ExcelHeader[] = [
        {
            title: "Indicator",
            key: "kToJ1rk0fwY",
            autoWidth: true,
        },
        ...(filter === "ou"
            ? structure.metaData.dimensions.pe.map<ExcelHeader>((pe) => {
                  return {
                      title: structure.metaData.items[pe].name,
                      key: pe,
                      autoWidth: true,
                      children: [
                          {
                              title: "N",
                              key: `${pe}_n`,
                          },
                          {
                              title: "D",
                              key: `${pe}_d`,
                          },
                          {
                              title: "%",
                              key: `${pe}_percent`,
                              conditionalFormats: [
                                  // Red for <= 50
                                  {
                                      type: "cellIs",
                                      operator: "lessThanOrEqual",
                                      value: 50,
                                      customStyle: {
                                          fill: {
                                              type: "pattern",
                                              pattern: "solid",
                                              fgColor: { argb: "FFFF0000" }, // Red
                                          },
                                      },
                                  },
                                  // Yellow for 50-75
                                  {
                                      type: "cellIs",
                                      operator: "between",
                                      minValue: 51,
                                      maxValue: 75,
                                      customStyle: {
                                          fill: {
                                              type: "pattern",
                                              pattern: "solid",
                                              fgColor: { argb: "FFFFFF00" }, // Yellow
                                          },
                                      },
                                  },
                                  // Green for > 75
                                  {
                                      type: "cellIs",
                                      operator: "greaterThan",
                                      value: 75,
                                      customStyle: {
                                          fill: {
                                              type: "pattern",
                                              pattern: "solid",
                                              fgColor: { argb: "FF00FF00" }, // Green
                                          },
                                      },
                                  },
                              ],
                          },
                      ],
                  };
              })
            : structure.metaData.dimensions.ou.map<ExcelHeader>((ou) => {
                  return {
                      title: structure.metaData.items[ou].name,
                      key: ou,
                      autoWidth: true,
                      children: [
                          {
                              title: "N",
                              key: `${ou}_n`,
                          },
                          {
                              title: "D",
                              key: `${ou}_d`,
                          },
                          {
                              title: "%",
                              key: `${ou}_percent`,
                              conditionalFormats: [
                                  // Red for <= 50
                                  {
                                      type: "cellIs",
                                      operator: "lessThanOrEqual",
                                      value: 50,
                                      customStyle: {
                                          fill: {
                                              type: "pattern",
                                              pattern: "solid",
                                              fgColor: { argb: "FFFF0000" }, // Red
                                          },
                                      },
                                  },
                                  // Yellow for 50-75
                                  {
                                      type: "cellIs",
                                      operator: "between",
                                      minValue: 51,
                                      maxValue: 75,
                                      customStyle: {
                                          fill: {
                                              type: "pattern",
                                              pattern: "solid",
                                              fgColor: { argb: "FFFFFF00" }, // Yellow
                                          },
                                      },
                                  },
                                  // Green for > 75
                                  {
                                      type: "cellIs",
                                      operator: "greaterThan",
                                      value: 75,
                                      customStyle: {
                                          fill: {
                                              type: "pattern",
                                              pattern: "solid",
                                              fgColor: { argb: "FF00FF00" }, // Green
                                          },
                                      },
                                  },
                              ],
                          },
                      ],
                  };
              })),
    ];
    const data = indicators.map((indicator) => ({
        ...indicator,
        ...(filter === "ou"
            ? structure.metaData.dimensions.pe.reduce<
                  Record<string, number | string>
              >((acc, pe) => {
                  const available = availableData.filter((d) => {
                      return (
                          d.kHRn35W3Gq4 === indicator.event &&
                          isArray(d.periods) &&
                          d.periods.includes(pe)
                      );
                  });
                  const { value, numerator, denominator } =
                      computerIndicator(available);

                  acc[`${pe}_percent`] = value * 100;
                  acc[`${pe}_n`] = numerator;
                  acc[`${pe}_d`] = denominator;
                  return acc;
              }, {})
            : structure.metaData.dimensions.ou.reduce<
                  Record<string, number | string>
              >((acc, ou) => {
                  const available = availableData.filter((d) => {
                      return (
                          d.kHRn35W3Gq4 === indicator.event &&
                          isArray(d.path) &&
                          d.path.includes(ou)
                      );
                  });

                  const { value, numerator, denominator } =
                      computerIndicator(available);

                  acc[`${ou}_percent`] = value * 100;
                  acc[`${ou}_n`] = numerator;
                  acc[`${ou}_d`] = denominator;
                  return acc;
              }, {})),
    }));

    const generator = new ExcelGenerator();

    try {
        await generator.downloadExcel(headers, data, "report.xlsx", {
            sheetName: "Indicators",
        });
    } catch (error) {
        console.error("Error generating Excel file:", error);
    }
};
export const downloadLayered = async ({
    structure,
    indicator,
}: {
    structure: AnalyticsStructure;
    indicator: string;
}) => {
    let availableData: Array<
        Record<string, string | string[] | number | null>
    > = await db.analytics.toArray();
    availableData = availableData.filter((d) => d["kHRn35W3Gq4"] === indicator);
    const headers: ExcelHeader[] = [
        {
            title: "Organisation",
            key: "ou",
        },
        ...structure.metaData.dimensions.pe.map((pe) => {
            return {
                title: structure.metaData.items[pe].name,
                key: pe,
            };
        }),
    ];

    const data = structure.metaData.dimensions.ou.map((ou) => ({
        ou: structure.metaData.items[ou].name,
        ...structure.metaData.dimensions.pe.reduce<
            Record<string, number | string>
        >((acc, pe) => {
            const available = availableData.filter(
                (d) =>
                    isArray(d.periods) &&
                    d.periods.includes(pe) &&
                    isArray(d.path) &&
                    d.path.includes(ou),
            );
            if (available.length > 0) {
                acc[pe] = new Intl.NumberFormat("en-US", {
                    style: "percent",
                }).format(computerIndicator(available).value);
            } else {
                acc[pe] = "-";
            }
            return acc;
        }, {}),
    }));

    const generator = new ExcelGenerator();

    try {
        await generator.downloadExcel(headers, data, "report.xlsx", {
            sheetName: "Layered",
        });
    } catch (error) {
        console.error("Error generating Excel file:", error);
    }
};
export const downloadAdminDashboard = async ({
    structure,
    counting,
    indicators,
}: {
    structure: AnalyticsStructure;
    counting?: "projects" | "units";
    indicators: Dictionary<string>[];
}) => {
    const availableData: Array<
        Record<string, string | string[] | number | null>
    > = await db.analytics.toArray();
    let headers: ExcelHeader[] = [
        {
            title: "Organisation",
            key: "ou",
            width: 30,
        },
        ...structure.metaData.dimensions.pe.map((pe) => {
            return {
                title: structure.metaData.items[pe].name,
                children: [
                    {
                        title: structure.metaData.items[pe].name,
                        key: `${pe}_total`,
                        width: 30,
                    },
                    {
                        title: "Running",
                        key: `${pe}_running`,
                        width: 30,
                    },
                    {
                        title: "Completed",
                        key: `${pe}_completed`,
                        width: 30,
                    },
                ],
            };
        }),
    ];

    if (counting === "units") {
        headers = [
            {
                title: "Indicator",
                key: "kToJ1rk0fwY",
            },
            ...structure.metaData.dimensions.pe.map((pe) => {
                return {
                    title: structure.metaData.items[pe].name,
                    children: [
                        {
                            title: "Total",
                            key: `${pe}_total`,
                        },
                        {
                            title: "Running",
                            key: `${pe}_running`,
                        },
                        {
                            title: "Completed",
                            key: `${pe}_completed`,
                        },
                    ],
                };
            }),
        ];
    }
    let data: Array<Record<string, string | number>> = [];

    const firstRow: Record<string, string> = {};

    if (counting === "units") {
        firstRow["kToJ1rk0fwY"] = "";
        structure.metaData.dimensions.pe.forEach((pe) => {
            firstRow[`${pe}_total`] = "Total";
            firstRow[`${pe}_running`] = "Running";
            firstRow[`${pe}_completed`] = "Completed";
        });
        data = [
            firstRow,
            ...indicators.map((indicator) => ({
                ...indicator,
                ...structure.metaData.dimensions.pe.reduce<
                    Record<string, number>
                >((acc, pe) => {
                    const available = availableData.filter(
                        (d) =>
                            isArray(d.periods) &&
                            d.periods?.includes(pe) &&
                            d["kHRn35W3Gq4"] === indicator["event"],
                    );
                    acc[`${pe}_total`] = uniq(
                        available.flatMap(({ ou }) => ou),
                    ).length;
                    acc[`${pe}_running`] = uniq(
                        available.flatMap(({ eZrfD4QnQfl, ou }) => {
                            if (eZrfD4QnQfl === "") return ou;
                            return [];
                        }),
                    ).length;
                    acc[`${pe}_completed`] = uniq(
                        available.flatMap(({ eZrfD4QnQfl, ou }) => {
                            if (eZrfD4QnQfl === "1") return ou;
                            return [];
                        }),
                    ).length;
                    return acc;
                }, {}),
            })),
        ];
    } else {
        firstRow["ou"] = "";
        structure.metaData.dimensions.pe.forEach((pe) => {
            firstRow[`${pe}_total`] = "Total";
            firstRow[`${pe}_running`] = "Running";
            firstRow[`${pe}_completed`] = "Completed";
        });
        data = [
            firstRow,
            ...structure.metaData.dimensions.ou.map((ou) => ({
                ou: String(structure.metaData.ouNameHierarchy[ou]).slice(1),
                ...structure.metaData.dimensions.pe.reduce<
                    Record<string, number>
                >((acc, pe) => {
                    const available = availableData.filter(
                        (d) =>
                            isArray(d.periods) &&
                            d.periods.includes(pe) &&
                            isArray(d.path) &&
                            d.path.includes(ou),
                    );
                    acc[`${pe}_total`] = uniq(
                        available.flatMap(({ pi }) => pi),
                    ).length;
                    acc[`${pe}_running`] = uniq(
                        available.flatMap(({ eZrfD4QnQfl, pi }) => {
                            if (eZrfD4QnQfl === "") return pi;
                            return [];
                        }),
                    ).length;
                    acc[`${pe}_completed`] = uniq(
                        available.flatMap(({ eZrfD4QnQfl, pi }) => {
                            if (eZrfD4QnQfl === "1") return pi;
                            return [];
                        }),
                    ).length;
                    return acc;
                }, {}),
            })),
        ];
    }

    const generator = new ExcelGenerator();

    try {
        await generator.downloadExcel(headers, data, "report.xlsx", {
            sheetName: "Admin",
        });
    } catch (error) {
        console.error("Error generating Excel file:", error);
    }
};
