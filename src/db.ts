import Dexie, { Table } from "dexie";
import "dexie-observable";
import { OrgUnit } from "./interfaces";
export class CQIDexie extends Dexie {
    organisationUnits!: Table<OrgUnit>;
    constructor() {
        super("cqi");
        this.version(1).stores({
            organisationUnits: "id,value,key,title,pId",
        });
    }
}

export const db = new CQIDexie();
