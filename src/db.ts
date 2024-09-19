import Dexie, { Table } from "dexie";
import "dexie-observable";
import { OrgUnit } from "./interfaces";
export class CQIDexie extends Dexie {
    organisationUnits!: Table<OrgUnit>;
    dataViewOrgUnits!: Table<OrgUnit>;
    constructor() {
        super("cqi");
        this.version(2).stores({
            organisationUnits: "id,value,key,title,pId",
            dataViewOrgUnits: "id,value,key,title,pId",
        });
    }
}

export const db = new CQIDexie();
