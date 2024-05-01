// dependencies
import fs from 'fs';
import path from 'path';
import moment from 'moment';
import _, { isLength, StringNullableChain, toNumber } from 'lodash';
import * as winston from 'winston';
import dayjs from 'dayjs';
import { commonConf, BBILMODE } from'./config/common';
//import db drivers
import { bbankDB2 } from './lib/db2';
import { bbankMYSQL } from './lib/mysql';
//import loggers
import { ApplicationLogger } from './logger/logger';

const mysql = new bbankMYSQL();
const db2 = new bbankDB2();
const appLogger = new ApplicationLogger();

const logger = winston.loggers.get('appLogger');

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

    private lineNo = 1;

//TODO  fix constructor below??    
//constructor(private env: any) {}

constructor() {}
      public async main():  Promise<void> {
        try{
        //await this.prepareLogger();
        if(BBILMODE == true){
        logger.info('------ *BBL DOMESTIC* MODE INITIATED --------');}else{
        logger.info('------ *BBIL INTERNATIONAL* MODE INITIATED --');
        }
        logger.info('------ FINSCAN EXTRACT PROCESS STARTED ------');
        logger.info('------ 1/3 openFile PROCESS STARTED ---------');
        await this.openFile();
        logger.info('------ 2/3 populateFile PROCESS STARTED -----');
        await this.populateFile();
        logger.info('------ 3/3 closeFile PROCESS STARTED --------');
        await this.closeFile();
        logger.info('------ EXTRACT PROCESS SUCCESS --------------');
        } catch(err){
            logger.error(`!Error occurred while processing runtime! ` + err);
            throw err;
        }  

    }

    private sanitizeString(str: string): string {
        return str.replace(/'/g, '');
      }    
      
    private sanitizeDate(date: string): string {
        return dayjs(date, 'DD.MM.YYYY HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
      }

    private getQuery(mode: boolean):string {
        if(mode == true){
            const sql = 'SELECT * FROM BBIL.BSIPROFILES';
            return sql;
        }else{
            const sql = 'SELECT * FROM BBL.BSIPROFILES';
            return sql;
        }


    }
    

    private async openFile(): Promise<void> {
        
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
            logger.info(`Creating directories...`);
            fs.mkdirSync(this.FilePath, { recursive: true });
        }
        // Open the file for writing, delete if exists
        this.FilePointer = fs.createWriteStream(filePath, { flags: 'w' });
        logger.info('Writing to file: \\output\\' + fileName);
    }

    private async writeHeader(): Promise<void> {
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
        //logger.info('at writeFileLine');
        //1. Write a single line of data to the file.

        if (this.FilePointer) {
            this.FilePointer.write(line, (err: Error | null) => {
                if (err) {
                    logger.error('Error writing line to file:', err);
                }
            });
        }
    }

    private async closeFile(): Promise<void> {
        logger.info('Saving to disk...');
        // 1. Close the file stream once all data is written.
                if (this.FilePointer) {
                    this.FilePointer.end();
                }
    }

    private async populateFile(): Promise<void> {
        logger.info('Populating file...');
        // 1. Load customer information from the database.
        // 2. Format the data retrieved from the database.
        // 3. Write each formatted line of data to the output file.
        try{
                // Write header
                this.writeHeader();

                // Load customer information from the database
                let allInfo = await this.loadCustInfo();


                //entire sql result
                logger.info('Number of Clients obtained from DB: ' + allInfo.length);
                //logger.info('[ populateFile() ] stringified customerInfo: recieved' + JSON.stringify(allInfo));
                // Populate file with data
                for (const info of allInfo) {
                    // Format data and write to file
                    //logger.info('Stringified info Object from Database: ' + JSON.stringify(info));
                    //logger.info('literal info Object from Database: ' + info)

                    let branch = await this.getSourceCode(info.BRANCH);

                    //BSI OBJECT
            let line = `${padWithSpaces(`${branch}`,15)}|${
                    padWithSpaces(this.sanitizeString(info.NAME),50)}|${
                    padWithSpaces(info.PARTYID,20)}|${
                    padWithSpaces(info.DEPACCT,20)}|${
                    padWithSpaces(info.LOANACCT,20)}|${
                    padWithSpaces(`${info.BSISTATUS}`,10)}|${
                    padWithSpaces(`${info.DEDUCTBASIS}`,20)}|${
                    padWithSpaces(`${info.QUOTA}`,20)}|${
                    padWithSpaces(branch,20)}|${
                    padWithSpaces(info.MODIFYDATE,50)}\n`;

                    //CUSTINFO OBJECT
                    // let line1 = `${branch}|${
                    // padWithSpaces(info.ClientId, 50)}|${
                    // info.LastModified}|${
                    // info.StatusIndicator}|${
                    // info.RecordType}| ${
                    // padWithSpaces(info.Gender,1)}| ${
                    // padWithSpaces(this.sanitizeString(info.FullName), 50)}|${
                    // padWithSpaces(info.AddressLine1, 50)}|${
                    // padWithSpaces(info.AddressLine2, 50)}|${
                    // padWithSpaces(info.AddressLine3, 50)}|${
                    // padWithSpaces(info.City, 20)}|${
                    // padWithSpaces(info.CountryOrState, 20)}|${
                    // padWithSpaces(info.ZipOrPostcode, 20)}|${
                    // padWithSpaces(info.Country, 20)}|${
                    // padWithSpaces(info.Dob, 20)}|${
                    // padWithSpaces(info.NationalID, 20)}|${
                    // padWithSpaces(info.DisplayField1, 20)}|${
                    // padWithSpaces(info.DisplayField2, 20)}|${
                    // padWithSpaces(info.DisplayField3, 20)}|${
                    // padWithSpaces(info.Comment1, 100)}|${
                    // padWithSpaces(info.Comment2, 100)} \n`;
                    
                    function padWithSpaces(value: string, length: number): string {
                        return value.padEnd(length);
                    }
                    this.writeFileLine(line);
                    //every 500 display a log
                    this.lineNo = this.lineNo + 1;
                    (this.lineNo % 500 === 0) && logger.info(`Lines written so far: ${this.lineNo}`);            
                }           
                logger.info(`Total lines written to file: ` + this.lineNo);   
            }catch(err){logger.error('Unable to obtain database payload. Error as follows: ' + err); throw err}
        }
            
    private async loadCustInfo(): Promise<any> {
        logger.info('Obtaining database payload...');
        // 	1. Execute a query to retrieve customer information from the database.
        //  2. Process the query results and return the data as an array.
        let sql = this.getQuery(BBILMODE);
        //uncomment for prod
        //let sql = `select * from BLB.FINSCAN_CUSTINFO`;
        //logger.info('DIRECT SQL QUERY: ' + sql);
        try{
            this.sqlResult = await mysql.executeQuery(sql);
        }catch(err){
         logger.error('Unable to retrieve database payload. \n' + err );
         throw err;    
        }            
        return this.sqlResult;
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

let app = new finscanExtractor();
app.main();