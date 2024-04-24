import * as mysql from 'mysql2';
require('dotenv-safe').config();
import * as winston from 'winston';
import { ApplicationLogger } from '../logger/logger';
const appLogger = new ApplicationLogger();
appLogger.instiantiateLogger();
const logger = winston.loggers.get('appLogger');
import {mysqlParams} from '@env/environment';




//can let params be same as connectionconf if not specified here. 
//todo use env file instead!!
// let params = {
    // "user": "isdept",
    // "host": "172.16.7.101",
    // "port": 3306,
    // "password": "P@ssw0rd1",
    // "database": "BBL",
    // "dateStrings": true
//     }

//this.connectionString = `DATABASE=${process.env.DATABASE};HOSTNAME=${process.env.HOST};PORT=${process.env.PORT};UID=${process.env.DBUSER};PWD=${process.env.PASSWORD}`;


export const Connect = async () =>
new Promise<mysql.Connection>((resolve, reject) => {
    logger.info(`Currently attemping to connect without ssh... Connection params as follows: ${JSON.stringify(mysqlParams)}`); 
    //TODO: remove   
    let connection = mysql.createConnection(mysqlParams);
    connection.connect((error:any) => {
        if (error) {
            reject(error);
            console.log(`1. Failed at connection stage.`);
            return;
        }
        else{
        console.log(`Connected successfully!`);
        resolve(connection);}
    });
});

export const Query = async (connection: mysql.Connection, query: string) =>
new Promise((resolve, reject) => {
    logger.info('Currently attemping to execute query...'); //TODO: remove
    connection.query(query, connection, (error, result) => {
        if (error) {
            console.log(`2. Failed at query stage.`);
            reject(error);
            return;
        }else{
        logger.info(`Executed query successfully!`);
        resolve(result);}
    });
});

export class bbankMYSQL {

    constructor() { }

    // tslint:disable-next-line:no-any
    public async executeQuery(sqlQuery: string): Promise<any> {
        // tslint:disable-next-line:no-any
        return new Promise<any>((resolve, reject) => {
        try{
            Connect()
                .then(connection => {
                    logger.info(`Right at connecting in executeQuery async`);
                    Query(connection, sqlQuery)
                        .then(
                            resp => {
                                logger.info(`Right after query execution`);
                                resolve(<any>resp);
                            },
                            err => {
                                logger.info(`3. Failed at executeQuery function. MySQL Database threw an error.`);
                                reject(err);
                            },
                        )
                        .catch(err => {
                            logger.info(`4. Failed at executeQuery catch function.`);
                            reject({
                                message: err.message,
                                error: err,
                            });
                        });
                        connection.end()
                // })
                // .catch(err => {
                //     console.log(`5. Failed at Connection stage in executeQuery function.`);
                //     reject({
                //         message: err.message,
                //         error: err,
                //     });
                });
             }catch(error){
                logger.info("Error!" + error);
                reject(error);
            }
            });
             
    } 
}