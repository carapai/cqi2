import Dexie, { Table } from "dexie";
import "dexie-observable";
import { OrgUnit, Program } from "./interfaces";
export class CQIDexie extends Dexie {
    organisationUnits!: Table<OrgUnit>;
    dataViewOrgUnits!: Table<OrgUnit>;
    programs!: Table<Program>;
    constructor() {
        super("cqi");
        this.version(2).stores({
            organisationUnits: "id,value,key,title,pId",
            dataViewOrgUnits: "id,value,key,title,pId",
            programs: "id",
        });
    }
}

export const db = new CQIDexie();
