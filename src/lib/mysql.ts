import * as mysql from 'mysql2';
import * as winston from 'winston';
import { ApplicationLogger } from '../logger/logger';
import { BBLParams } from '../config/common';
const appLogger = new ApplicationLogger();
appLogger.instiantiateLogger();
const logger = winston.loggers.get('appLogger');


export const Connect = async () =>
new Promise<mysql.Connection>((resolve, reject) => {
    //logger.info(`Currently attemping to connect without ssh... Connection params as follows: ${JSON.stringify(BBLParams)}`); 
    //TODO: remove   
    let connection = mysql.createConnection(BBLParams);
    connection.connect((error:any) => {
        if (error) {
            reject(error);
            logger.error(`1. Failed at connection stage.`);
            return;
        }
        else{
            logger.info(`Connected to MySQL DB`);
            resolve(connection);}
    });
});

export const Query = async (connection: mysql.Connection, query: string) =>
new Promise((resolve, reject) => {
    //logger.info('Currently attemping to execute query...'); //TODO: remove
    connection.query(query, connection, (error, result) => {
        if (error) {
            logger.error(`2. Failed at query stage.`);
            reject(error);
            return;
        }else{
        logger.info(`Query result: Success`);
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
                    //logger.info(`Right at connecting in executeQuery async`);
                    Query(connection, sqlQuery)
                        .then(
                            resp => {
                                //logger.info(`Right after query execution`);
                                resolve(<any>resp);
                            },
                            err => {
                                // logger.error(`MySQL Database threw an error for query provided.`);
                                reject(err);
                            },
                        )
                        .catch(err => {
                            reject({
                                message: err.message,
                                error: err,
                            });
                        });
                        connection.end()
                });
             }catch(error){
                logger.error("Error!" + error);
                reject(error);
            }
            });
             
    } 
}