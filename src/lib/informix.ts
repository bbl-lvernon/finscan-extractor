"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db2 = require("ibm_db");
require('dotenv-safe').config();
export class bbankInformix {
    connectionString: string = ``;
    constructor() {
        // We are getting the connection string from the db2 datasource
        this.connectionString = `DATABASE=${process.env.DATABASE};HOSTNAME=${process.env.HOST};PORT=${process.env.PORT};UID=${process.env.DBUSER};PWD=${process.env.PASSWORD}`;
    }
    // tslint:disable-next-line:no-any
    async executeQuery(sqlQuery, params?) {
        // tslint:disable-next-line:no-any
        return new Promise((resolve, reject) => {
            this.openConnection(this.connectionString).then((db2conn: any) => {
                db2conn.query(sqlQuery, params).then(resp => { resolve(resp); }, err => { reject(err); });
            }, err => { reject(err); });
        });
    }
    async openConnection(connectionString) {
        return new Promise((resolve, reject) => {
            //We are defining a variable that contains the call back functionality
            const callback = (err, db) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(db);
                }
            };
            db2.open(connectionString, callback.bind(this));
        });
    }
}