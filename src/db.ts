import Dexie, { Table } from "dexie";
import "dexie-observable";
import { DisplayInstance, OrgUnit, Program } from "./interfaces";
export class CQIDexie extends Dexie {
    organisationUnits!: Table<OrgUnit>;
    dataViewOrgUnits!: Table<OrgUnit>;
    programs!: Table<Partial<Program>>;
    instances!: Table<Partial<DisplayInstance>>;
    analytics!: Table<Record<string, string | string[] | number | null>>;
    indicators!: Table<Record<string, string>>;

    constructor() {
        super("cqi");
        this.version(1).stores({
            organisationUnits: "id,value,key,title,pId",
            dataViewOrgUnits: "id,value,key,title,pId",
            instances: "trackedEntityInstance",
            programs: "id",
            analytics: "psi,TG1QzFgGTex,kHRn35W3Gq4,*path,*periods",
            indicators: "event,kuVtv8R9n8q,orgUnit",
        });
    }
}

export const db = new CQIDexie();
