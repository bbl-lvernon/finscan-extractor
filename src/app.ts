// dependencies
import fs from 'fs';
import path from 'path';
import * as txt from 'fast-csv';
import moment from 'moment';
import _, { isLength, StringNullableChain, toNumber } from 'lodash';
import * as winston from 'winston';
import dayjs from 'dayjs';
import conf from 'dotenv-safe';
import { commonConf } from'./config/common';
//import db drivers
import { bbankDB2 } from './lib/db2';
import { bbankMYSQL } from './lib/mysql';
//import loggers
import { SummaryLogger } from './logger/summaryLogger';
import { ApplicationLogger } from './logger/logger';

const mysql = new bbankMYSQL();
const db2 = new bbankDB2();
const appLogger = new ApplicationLogger();
const summaryLogger = new SummaryLogger();

const logger = winston.loggers.get('appLogger');
const summaryLog = winston.loggers.get('summaryLogger');

summaryLogger.instiantiateLogger();
appLogger.instiantiateLogger();

// config


export class finscanExtractor {

    private sqlResult: any[] = [];
    private FilePath: string = '';
    private FilePointer: fs.WriteStream | null = null;
    private CurrDate: string = '';

    private SourceCode: string = '';
    private ClientId: string = '';
    private LastModified: string = '';
    private StatusIndicator: string = '';
    private RecordType: string = '';
    private Gender: string = '';
    private FullName: string = '';
    private AddressLine1: string = '';
    private AddressLine2: string = '';
    private AddressLine3: string = '';
    private City: string = '';
    private CountryOrState: string = '';
    private ZipOrPostcode: string = '';
    private Country: string = '';
    private Dob: string = '';
    private NationalID: string = '';
    private DisplayField1: string = '';
    private DisplayField2: string = '';
    private DisplayField3: string = '';
    private Comment1: string = '';
    private Comment2: string = '';
    private BranchCode: string = '';

    constructor(private env: conf) {}
      public async main():  Promise<void> {
        try{
        //await this.prepareLogger();
        await this.openFile();
        await this.populateFile();
        await this.closeFile();
        logger.info('FINSCAN EXTRACT PROCESS COMPLETE')
        } catch(err){
            console.error(`Error occurred while processing runtime`);
            throw err;
        }  

    }

    private sanitizeString(str: string): string {
        return str.replace(/'/g, '');
      }    
      
    private sanitizeDate(date: string): string {
        return dayjs(date, 'DD.MM.YYYY HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
      }
    
    // public mainOLD() {
        
    //     logger.info('-------------------------------------------------------------------');
    //     logger.info('--------------BEGIN FinScan Extract from FBE MySQL-----------------');
    //     logger.info('-------------------------------------------------------------------');      
    //     summaryLog.info('Process-Begin');
    //     // if (commonConf.allowAdhoc) {
    //     //     this.processingDate = commonConf.adhocDate;
    //     // } else {
    //         let today = new Date()
    //         this.processingDate = today.toISOString().split('T')[0];
    //     //}
    //     logger.info('-------------------------------------------------------------------');      
    //     logger.info(`Processing Date = ${this.processingDate}`);
    //     logger.info('-------------------------------------------------------------------');      
    //     logger.info(`STEP 1 - Connect & Retrieve data from MySQL DB`);
    //     logger.info('-------------------------------------------------------------------');
    //     this.clientData = await this.parseFile();
    //     if (this.transactions && this.transactions.length > 0) {
    //         //group by transaction type
    //         logger.info(`Grouping records by operationTypeId & transactionTypeId.`);
    //         const SEPERATOR = "--";
    //         this.groupTransaction = _.chain(this.transactions).groupBy((transaction)=>`${transaction.operationTypeId}${SEPERATOR}${transaction.transactionTypeId}`).value();
    //         // obtain gl transaction types
    //         logger.info('-------------------------------------------------------------------');
    //         logger.info(`STEP 2 - Get Transaction Types (DB2/Database Query)`);
    //         logger.info('-------------------------------------------------------------------');
    //         this.ekyashTxnGLs = await this.getTransactionTypes();
    //         this.ekyashTxnGLs.forEach((ekyashTxnGL) => {
    //             this.transactionKeyCombination.push(ekyashTxnGL.ID);
    //         });
    //         if (this.ekyashTxnGLs && this.ekyashTxnGLs.length > 0) {
    //             logger.info('-------------------------------------------------------------------');
    //             logger.info(`STEP 3 - Open Posting File, Group Transaction Types & Create Records. (I/O, misc.)`);
    //             logger.info('-------------------------------------------------------------------');
    //             logger.info(`Opening output posting file ${commonConf.outputDir}${commonConf.outputFile}${this.processingDate}.txt`);
    //             this.writeStream = fs.createWriteStream(path.resolve(commonConf.outputDir, commonConf.outputFile + this.processingDate + '.txt'))
    //                 .on('error', (error) => {
    //                     logger.error('--------------------------------ERROR------------------------------');
    //                     logger.error(`Function: main().`);
    //                     logger.error(`Action: Error opening the ouput file`)
    //                     logger.error(`Message: ${error}`)
    //                     logger.error('-------------------------------------------------------------------');
    //                 });
               
    //             for (const [key, value] of Object.entries(this.groupTransaction)) {
    //                 if (this.transactionKeyCombination.includes(key)) {
    //                     logger.info(`Processing Operation Type Id -- Transaction Type Id = [${key}]`);
    //                     this.process(value);
    //                 }
    //             }
    //             await this.insertTxnIntoEkyashDB();

    //             logger.info('-------------------------------------------------------------------');
    //             logger.info('----------------------------SUMMARY--------------------------------');
    //             logger.info(`# of transactions/rows in input file = ${this.rowCount}`);
    //             logger.info(`# of transactions/rows inserted into BLB.EKYASH_EOD_TRANS  = ${this.txnToDb.length}`);
    //             logger.info(`# of transactions/rows processed from input file = ${this.individualTxnCounter}`);
    //             logger.info(`# of debits written to posting file = ${this.transactionCounter/2}`);
    //             logger.info(`# of credits written to posting file = ${this.transactionCounter/2}`);
    //             logger.info(`Total # of transactions written to posting file = ${this.transactionCounter}`);
    //             logger.info(`Total $ Amount: $${this.transactionTotal.toFixed(2)}`);
    //             summaryLog.info(`# of transactions/rows in input file = ${this.rowCount}`);
    //             summaryLog.info(`# of transactions/rows processed from input file = ${this.individualTxnCounter}`);
    //             summaryLog.info(`# of debits written to posting file = ${this.transactionCounter/2}`);
    //             summaryLog.info(`# of credits written to posting file = ${this.transactionCounter/2}`);
    //             summaryLog.info(`Total # of transactions written to posting file = ${this.transactionCounter}`);
    //             summaryLog.info(`Total $ Amount: $${this.transactionTotal.toFixed(2)}`);
    //             logger.info('-------------------------------------------------------------------');
    //             logger.info('---------------------------MOVE INPUT FILE-------------------------');
    //             let movedFile: boolean = await this.moveFile(`${commonConf.inputDir}${this.processingDate}-${commonConf.inputFile}`,`${commonConf.completedDir}${this.processingDate}-${commonConf.inputFile}`, commonConf.completedDir);
    //             if (movedFile) {
    //                 logger.info(`File moved to /completed successfully.`)
    //             } else {
    //                 logger.error(`File could not be moved to /completed.`)
    //             }
    //             // protect xslx file
	// 							// GALVAREZ 11-08-2021 no protection
    //             // write workbook to file
    //             await workbook.xlsx.writeFile(`${commonConf.outputDir}${commonConf.outputFile}${this.processingDate}.xlsx`);
    //             logger.info('-------------------------------------------------------------------');
    //             logger.info('--------------------END EKYASH-GL-POSTING--------------------------');
    //             logger.info('-------------------------------------------------------------------');
    //             summaryLog.info('Process-End');
    //         }
    //     } else {
    //         logger.info('ERROR. No transactions found in file. Please verify.')
    //     }
    // }


    private async openFile(): Promise<void> {
        logger.info('at openFile');
        // 1. Prepare the file path and file name for the output file.
        // 2. Create directories if they don't exist.
        // 3. Generate the current date to include in the file name.
        // 4. Open the file for writing using the appropriate file stream.

        this.FilePath = path.join(commonConf.outputDir);
        this.CurrDate = moment().format('YYYYMMDD');
        const fileName = `FinScan_${this.CurrDate}.out`;
        const filePath = path.join(this.FilePath, fileName);

        // Create directories if they don't exist
        if (!fs.existsSync(this.FilePath)) {
            logger.info(`Creating directories, they don't exist`);
            fs.mkdirSync(this.FilePath, { recursive: true });
        }

        // Open the file for writing, delete if exists
        this.FilePointer = fs.createWriteStream(filePath, { flags: 'w' });

    }0

    private async writeHeader(): Promise<void> {
        logger.info('at writeHeader');
        //1. Write the header line to the file with column names.

        this.SourceCode      = "Source-Code";
        this.ClientId        = "Client-ID";
        this.LastModified    = "Last-Modified-Date";
        this.StatusIndicator = "Status-Indicator";
        this.RecordType      = "Record-Type";
        this.Gender          = "Gender";
        this.FullName        = "Full-Name";
        this.AddressLine1    = "Address-1";
        this.AddressLine2    = "Address-2";
        this.AddressLine3    = "Address-3";
        this.City            = "City";
        this.CountryOrState  = "Country/State";
        this.ZipOrPostcode   = "Zip/Postcode";
        this.Country         = "Country";
        this.Dob             = "Date-Of-Bith";
        this.NationalID      = "National-ID";
        this.DisplayField1   = "Display-Field-1";
        this.DisplayField2   = "Display-Field-2";
        this.DisplayField3   = "Display-Field-3";
        this.Comment1        = "Comment-1";
        this.Comment2        = "Comment-2";

        const headerLine = `${this.SourceCode}|${this.ClientId}|${this.LastModified}|${this.StatusIndicator}|${this.RecordType}|${this.Gender}|${this.FullName}|${this.AddressLine1}|${this.AddressLine2}|${this.AddressLine3}|${this.City}|${this.CountryOrState}|${this.ZipOrPostcode}|${this.Country}|${this.Dob}|${this.NationalID}|${this.DisplayField1}|${this.DisplayField2}|${this.DisplayField3}|${this.Comment1}|${this.Comment2}|\n`;
        this.writeFileLine(headerLine);
    }

    private async writeFileLine(line: string): Promise<void> {
        logger.info('at writeFileLine');
        //1. Write a single line of data to the file.

        if (this.FilePointer) {
            this.FilePointer.write(line, (err: Error | null) => {
                if (err) {
                    console.error('Error writing line to file:', err);
                }
            });
        }
    }

    private async closeFile(): Promise<void> {
        logger.info('at closeFile');
        // 1. Close the file stream once all data is written.
                if (this.FilePointer) {
                    this.FilePointer.end();
                }
    }

    private async populateFile(): Promise<void> {
        logger.info('at populateFile');
        // 1. Load customer information from the database.
        // 2. Format the data retrieved from the database.
        // 3. Write each formatted line of data to the output file.
        try{
                // Write header
                this.writeHeader();

                // Load customer information from the database
                let allInfo = await this.loadCustInfo();

                //entire sql result
                //logger.info('[ populateFile() ] literal customerInfo.length: recieved: ' + allInfo.length);
                //logger.info('[ populateFile() ] stringified customerInfo: recieved' + JSON.stringify(allInfo));
                // Populate file with data
                for (const info of allInfo) {
                    // Format data and write to file
                    logger.info('Stringified info Object from Database: ' + JSON.stringify(info));
                    logger.info('literal info Object from Database: ' + info)


                    let branch = await this.getSourceCode(info.BRANCH);

            // let line = `${padWithSpaces(`${branch}`,15)}|${
            //         padWithSpaces(info.NAME,50)}|${
            //         padWithSpaces(info.PARTYID,20)}|${
            //         padWithSpaces(info.DEPACCT,20)}|${
            //         padWithSpaces(info.LOANACCT,20)}|${
            //         padWithSpaces(`${info.BSISTATUS}`,10)}|${
            //         padWithSpaces(`${info.DEDUCTBASIS}`,20)}|${
            //         padWithSpaces(`${info.QUOTA}`,20)}|${
            //         padWithSpaces(branch,20)}|${
            //         padWithSpaces(info.MODIFYDATE,50)}\n`;

                    let line = `${branch}| 
                    ${padWithSpaces(info.ClientId, 50)}| 
                    ${info.LastModified}| 
                    ${info.StatusIndicator}| 
                    ${info.RecordType}| 
                    ${padWithSpaces(info.Gender,1)}| 
                    ${padWithSpaces(this.sanitizeString(info.FullName), 50)}| 
                    ${padWithSpaces(info.AddressLine1, 50)}| 
                    ${padWithSpaces(info.AddressLine2, 50)}| 
                    ${padWithSpaces(info.AddressLine3, 50)}| 
                    ${padWithSpaces(info.City, 20)}|  
                    ${padWithSpaces(info.CountryOrState, 20)}| 
                    ${padWithSpaces(info.ZipOrPostcode, 20)}| 
                    ${padWithSpaces(info.Country, 20)}| 
                    ${padWithSpaces(info.Dob, 20)}| 
                    ${padWithSpaces(info.NationalID, 20)}| 
                    ${padWithSpaces(info.DisplayField1, 20)}| 
                    ${padWithSpaces(info.DisplayField2, 20)}| 
                    ${padWithSpaces(info.DisplayField3, 20)}| 
                    ${padWithSpaces(info.Comment1, 100)}| 
                    ${padWithSpaces(info.Comment2, 100)} \n`;
                    
                    function padWithSpaces(value: string, length: number): string {
                        return value.padEnd(length);
                    }
                    
                    
                    this.writeFileLine(line);
                    //every 500 display a log
                    (allInfo.length % 5000 === 0) && logger.info(`Lines written so far: ${allInfo.length}`);            
                }
                logger.info(`Success. Populating file complete.`);   
            }catch(err){logger.error('Unable to obtain database values. Error as follows: ' + err); throw err}
        }
            
    private async loadCustInfo(): Promise<any> {
        logger.info('at loadCustInfo');
        // 	1. Execute a query to retrieve customer information from the database.
        //  2. Process the query results and return the data as an array.
    //let sql = 'select * from BBL.BSIPROFILES';
    //uncomment 
    let sql = `select * from BLB.FINSCAN_CUSTINFO`;
    logger.info('[ loadCustInfo() ] sql Query= ' + sql);
    let sqlResult = await mysql.executeQuery(sql);
    summaryLog.info('[  loadCustInfo() ] sql Result= ' + JSON.stringify(sqlResult));
    return sqlResult;
    }

    private async getSourceCode(branchShortCode: string){
        // 1. Determine the source code based on the provided branch code.
        // 2. Return the corresponding source code.
        
        try{
        if (parseInt(branchShortCode) == 110) {
			this.SourceCode = "BBLBU";
		}
		else
		if (parseInt(branchShortCode) == 200){
			this.SourceCode = "BBLIN";	
			}
		else 
		if (parseInt(branchShortCode) == 625) {
			this.SourceCode = "BBLDG";
		}
		else 
		if (parseInt(branchShortCode) == 626) {
			this.SourceCode = "BBLPL";	
			}
		else 
		if (parseInt(branchShortCode) == 630) {
			this.SourceCode = "BBLPG";	
			}
		else 
		if (parseInt(branchShortCode) == 635) {
			this.SourceCode = "BBLCZ";		
		    }
		else 
		if (parseInt(branchShortCode) == 640) {
			this.SourceCode = "BBLOW";			
			}
		else 
		if (parseInt(branchShortCode) == 645) {
			this.SourceCode = "BBLBP";				
			}
		else 
		if (parseInt(branchShortCode) == 650) {
			this.SourceCode = "BBLSI";					
			}
		else 
		if ((parseInt(branchShortCode) == 670) || (parseInt(branchShortCode) == 690)) {
			this.SourceCode = "BBLSP";						
			}
		else 
		if (parseInt(branchShortCode) == 680) {
			this.SourceCode = "BBLNS";							
			}
		else 
		if (parseInt(branchShortCode) == 685) {
			this.SourceCode = "BBLLV";								
			}
		else 
		if (parseInt(branchShortCode) == 695) {
			this.SourceCode = "BBLMO";									
			}
		else 
		if (parseInt(branchShortCode) == 700) {
			this.SourceCode = "BBLHR";										
			}
		else {
			this.SourceCode = "BBLFN";
		}
    }catch(err){
        logger.error(`Unable to retrieve source code for branchShortCode: ${branchShortCode}`);
        throw(err);
    }
        return this.SourceCode;
    }
 
}

let app = new finscanExtractor(conf);
app.main();