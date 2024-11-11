import type { TreeDataNode } from "antd";
import { OptionBase } from "chakra-react-select";
import { z } from "zod";

export interface Option extends OptionBase {
    label: string;
    value: string;
}

export interface OrgUnit extends TreeDataNode {
    pId?: string;
    value: string;
    id: string;
    title: string;
    children?: OrgUnit[];
}
export type OrgUnits = {
    organisationUnits: OrgUnit[];
};

export interface TrackedEntityType {
    id: string;
}

export interface Program {
    name: string;
    enrollmentDateLabel: string;
    incidentDateLabel: string;
    programType: string;
    selectEnrollmentDatesInFuture: boolean;
    selectIncidentDatesInFuture: boolean;
    registration: boolean;
    id: string;
    organisationUnits: OrganisationUnit[];
    programStages: ProgramStage[];
    programTrackedEntityAttributes: ProgramTrackedEntityAttribute[];
    trackedEntityType: TrackedEntityType;
}

export interface ProgramTrackedEntityAttribute {
    name: string;
    displayInList: boolean;
    sortOrder: number;
    mandatory: boolean;
    allowFutureDate: boolean;
    valueType: ValueType;
    id: string;
    trackedEntityAttribute: TrackedEntityAttribute;
}

export interface TrackedEntityAttribute {
    name: string;
    valueType: string;
    unique: boolean;
    generated: boolean;
    pattern: string;
    orgunitScope: boolean;
    displayFormName: string;
    optionSetValue: boolean;
    id: string;
    optionSet?: OptionSet;
    multiple?: boolean;
}

export interface ProgramStage {
    name: string;
    programStageDataElements: ProgramStageDataElement[];
    sortOrder: number;
    id: string;
    repeatable: boolean;
}

export interface ProgramStageDataElement {
    dataElement: DataElement;
    compulsory: boolean;
    optionSetValue: boolean;
    optionSet: { options: Option[] };
}

export interface DataElement {
    name: string;
    formName?: string;
    valueType: ValueType;
    optionSetValue: boolean;
    id: string;
    optionSet?: OptionSet;
}

export interface OptionSet {
    options: Option[];
}

export interface OptionOption {
    code: string;
    name: string;
    id: string;
}

export interface OrganisationUnit {
    name: string;
    id: string;
}

export interface OptionGroup {
    name: string;
    id: string;
    options: Option[];
}

export type ValueType =
    | "TEXT"
    | "LONG_TEXT"
    | "LETTER"
    | "PHONE_NUMBER"
    | "EMAIL"
    | "BOOLEAN"
    | "TRUE_ONLY"
    | "DATE"
    | "DATETIME"
    | "TIME"
    | "NUMBER"
    | "UNIT_INTERVAL"
    | "PERCENTAGE"
    | "INTEGER"
    | "INTEGER_POSITIVE"
    | "INTEGER_NEGATIVE"
    | "INTEGER_ZERO_OR_POSITIVE"
    | "TRACKER_ASSOCIATE"
    | "USERNAME"
    | "COORDINATE"
    | "ORGANISATION_UNIT"
    | "REFERENCE"
    | "AGE"
    | "URL"
    | "FILE_RESOURCE"
    | "IMAGE"
    | "GEOJSON"
    | "MULTI_TEXT";

export interface Beneficiary {
    trackedEntity: string;
    CfpoFtRmK1z: string;
    huFucxA3e5c: string;
    HLKc2AKR9jW: string;
    enrollment: string;
    occurredAt?: string;
}

export interface SearchCriteria {
    [key: string]: string;
}

export type RelativePeriodType =
    | "DAILY"
    | "WEEKLY"
    | "BIWEEKLY"
    | "WEEKS_THIS_YEAR"
    | "MONTHLY"
    | "BIMONTHLY"
    | "QUARTERLY"
    | "SIXMONTHLY"
    | "FINANCIAL"
    | "YEARLY";

export type FixedPeriodType =
    | "DAILY"
    | "WEEKLY"
    | "WEEKLYWED"
    | "WEEKLYTHU"
    | "WEEKLYSAT"
    | "WEEKLYSUN"
    | "BIWEEKLY"
    | "MONTHLY"
    | "BIMONTHLY"
    | "QUARTERLY"
    | "QUARTERLYNOV"
    | "SIXMONTHLY"
    | "SIXMONTHLYAPR"
    | "SIXMONTHLYNOV"
    | "YEARLY"
    | "FYNOV"
    | "FYOCT"
    | "FYJUL"
    | "FYAPR";

export type FixedPeriod = {
    id: string;
    iso?: string;
    name: string;
    startDate: string;
    endDate: string;
};

export interface Period extends Option {
    startDate?: string;
    endDate?: string;
    type: "fixed" | "relative" | "range";
    periodType: FixedPeriodType | RelativePeriodType;
}

export const DashboardQueryValidator = z.object({
    pa: z.union([z.string().array(), z.string()]).optional(),
    ind: z.union([z.string().array(), z.string()]).optional(),
    level: z.number().optional(),
    ou: z.union([z.string().array(), z.string()]).optional(),
    periods: z.any().array().optional(),
    pageSize: z.number().optional(),
    page: z.number().optional(),
    filter: z.enum(["period", "ou"]).optional(),
    counting: z.enum(["projects", "units"]).optional(),
    mode: z.enum(["multiple", "tags"]).optional(),
});

export const DataEntryValidator = z.object({
    ou: z.string().optional(),
    disabled: z.boolean().optional(),
});
export const FormValidator = z.object({
    editing: z.boolean(),
    type: z.string().optional(),
    registration: z.boolean(),
});

export const InstanceValidator = z.object({
    editing: z.boolean(),
    type: z.string().optional(),
    registration: z.boolean(),
    stage: z.string().optional(),
});

export const TrackerValidator = z.object({
    ou: z.string(),
    pageSize: z.number().optional(),
    page: z.number().optional(),
    type: z.string().optional(),
    registration: z.boolean(),
});

export type DashboardQuery = z.infer<typeof DashboardQueryValidator>;

export interface TrackedEntityInstances {
    pager: Pager;
    trackedEntityInstances: TrackedEntityInstance[];
}

export interface TrackedEntityInstance {
    created: string;
    orgUnit: string;
    createdAtClient: string;
    trackedEntityInstance: string;
    lastUpdated: string;
    trackedEntityType: string;
    lastUpdatedAtClient: string;
    potentialDuplicate: boolean;
    inactive: boolean;
    deleted: boolean;
    featureType: string;
    programOwners: ProgramOwner[];
    enrollments: Enrollment[];
    attributes: Attribute[];
}

interface Attribute {
    lastUpdated: string;
    storedBy: string;
    displayName: string;
    created: string;
    valueType: string;
    attribute: string;
    value: string;
}

export interface Enrollment {
    storedBy: string;
    createdAtClient: string;
    program: string;
    lastUpdated: string;
    created: string;
    orgUnit: string;
    trackedEntityInstance: string;
    enrollment: string;
    trackedEntityType: string;
    orgUnitName: string;
    lastUpdatedAtClient: string;
    enrollmentDate: string;
    deleted: boolean;
    incidentDate: string;
    status: string;
    events: Event[];
    attributes: Attribute[];
}

export interface Event {
    storedBy: string;
    dueDate: string;
    program: string;
    event: string;
    programStage: string;
    orgUnit: string;
    trackedEntityInstance: string;
    enrollment: string;
    enrollmentStatus: string;
    status: string;
    orgUnitName: string;
    eventDate: string;
    attributeCategoryOptions: string;
    lastUpdated: string;
    created: string;
    deleted: boolean;
    attributeOptionCombo: string;
    dataValues: Array<Partial<DataValue>>;
    completedDate?: string;
}

export interface DataValue {
    lastUpdated: string;
    created: string;
    dataElement: string;
    value: string;
    providedElsewhere: boolean;
}

export interface ProgramOwner {
    ownerOrgUnit: string;
    program: string;
    trackedEntityInstance: string;
}

interface Pager {
    page: number;
    pageCount: number;
    total: number;
    pageSize: number;
}

export type InstanceDisplay = Partial<
    TrackedEntityInstance & {
        attributesObject: { [key: string]: string };
        firstEnrollment: string;
        program: string;
    }
>;

export type EventDisplay = Partial<Event> & {
    values: { [key: string]: string };
};

export interface AnalyticsStructure {
    headers: Array<Record<string, string>>;
    metaData: MetaData;
    rows: string[][];
    height: number;
    headerWidth: number;
    width: number;
}

interface MetaData {
    items: Record<string, { name: string }>;
    ouNameHierarchy: Record<string, string>;
    dimensions: Dimensions;
}

interface Dimensions {
    pe: string[];
    ou: string[];
    co: string[];
}

export interface SQLView {
    pager: Pager;
    listGrid: ListGrid;
}

interface ListGrid {
    metaData: MetaData;
    headerWidth: number;
    subtitle: string;
    width: number;
    title: string;
    height: number;
    headers: Header[];
    rows: string[][];
}

interface Header {
    hidden: boolean;
    meta: boolean;
    name: keyof AnalyticData;
    column: string;
    type: string;
}

interface Pager {
    page: number;
    pageCount: number;
    total: number;
    pageSize: number;
}

export interface AnalyticData {
    uidlevel1: string;
    uidlevel2: string;
    uidlevel3: string;
    uidlevel4: string;
    uidlevel5: string;
    rabKTDhptNW: null | string;
    pvIOzuzeYrI: null | string;
    gjDR8EJ4TYj: null | string;
    pv1jqIeNLbO: string;
    qPIRLHZ6dTm: string;
    au4gnriblmx: string;
    Dz3bAHiSjAf: string;
    E2fcwOxOuR4: string;
    daily: string;
    weekly: string;
    weeklywednesday: string;
    weeklythursday: string;
    weeklysaturday: string;
    weeklysunday: string;
    biweekly: string;
    monthly: string;
    bimonthly: string;
    quarterly: string;
    sixmonthly: string;
    sixmonthlyapril: string;
    sixmonthlynov: string;
    yearly: string;
    financialapril: string;
    financialjuly: string;
    financialoct: string;
    financialnov: string;
    vlcuyaFe8XA: null | string;
    EF7Cwwpegv1: null | string;
    ef2RxnUK9ac: null | string;
    RgNQcLejbwX: null | number;
    TY4BoFr95UI: null | string;
    rVZlkzOwWhi: null | number;
    megrn75m57y: null | string;
    vj0HLP3eHbe: null | string;
    f9bjMbi3j3j: null | string;
    gB9GbPqeAzv: null | string;
    y3hJLGjctPk: string;
    iInAQ40vDGZ: string;
    WQcY6nfPouv: string;
    pIl8z4w8msL: string;
    EvGGaaviqOn: string;
    WEudJ6nxlzz: string;
    TG1QzFgGTex: string;
    kHRn35W3Gq4: string;
    VWxBILfLC9s: string;
    eCbusIaigyj: string;
    rFSjQbZjJwF: string;
    AETf2xvUmc8: string;
    eZrfD4QnQfl: null | string;
    psi: string;
    pi: string;
    ps: string;
    ao: string;
    enrollmentdate: string;
    incidentdate: string;
    executiondate: string;
    duedate: string;
    completeddate: null | string;
    created: string;
    lastupdated: string;
    storedby: string;
    pistatus: string;
    psistatus: string;
    psigeometry: null | string;
    longitude: null | string;
    latitude: null | string;
    ou: string;
    ouname: string;
    oucode: null | string;
    oulevel: number;
    ougeometry: Record<string, string>;
    pigeometry: null | string;
    tei: string;
}

export type DisplayInstance = Partial<
    TrackedEntityInstance & {
        attributesObject: { [key: string]: string };
        firstEnrollment: string;
        program: string;
    }
>;

interface DatabaseInfo {
    name: string;
    user: string;
    url: string;
    databaseVersion: string;
    spatialSupport: boolean;
}

export interface SystemInfo {
    contextPath: string;
    userAgent: string;
    calendar: string;
    dateFormat: string;
    serverDate: string;
    serverTimeZoneId: string;
    serverTimeZoneDisplayName: string;
    lastAnalyticsTableSuccess: string;
    intervalSinceLastAnalyticsTableSuccess: string;
    lastAnalyticsTableRuntime: string;
    version: string;
    revision: string;
    buildTime: string;
    jasperReportsVersion: string;
    environmentVariable: string;
    fileStoreProvider: string;
    readOnlyMode: string;
    nodeId: string;
    javaVersion: string;
    javaVendor: string;
    javaOpts: string;
    osName: string;
    osArchitecture: string;
    osVersion: string;
    externalDirectory: string;
    databaseInfo: DatabaseInfo;
    readReplicaCount: number;
    memoryInfo: string;
    cpuCores: number;
    encryption: boolean;
    emailConfigured: boolean;
    redisEnabled: boolean;
    systemId: string;
    systemName: string;
    clusterHostname: string;
    isMetadataVersionEnabled: boolean;
    metadataSyncEnabled: boolean;
}

export interface HeaderChild {
    title: string;
    key?: string;
    width?: number;
    span?: number;
}

export interface HeaderParent extends HeaderChild {
    children?: (HeaderParent | HeaderChild)[];
}

export type ExcelHeader = HeaderParent;

export interface ColumnInfo {
    totalColumns: number;
    merges: Array<{
        start: { row: number; col: number };
        end: { row: number; col: number };
    }>;
    columns: Array<{
        header: string;
        key: string;
        width: number;
    }>;
}

export interface CellStyle {
    font?: {
        bold?: boolean;
        color?: { argb: string };
    };
    fill?: {
        type: "pattern";
        pattern: "solid";
        fgColor: { argb: string };
    };
    alignment?: {
        vertical?: "middle" | "top" | "bottom";
        horizontal?: "center" | "left" | "right";
    };
    border?: {
        top?: { style: "thin" | "medium" | "thick" };
        left?: { style: "thin" | "medium" | "thick" };
        bottom?: { style: "thin" | "medium" | "thick" };
        right?: { style: "thin" | "medium" | "thick" };
    };
}
