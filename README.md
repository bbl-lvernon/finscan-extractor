
<!-- PROJECT LOGO -->
<br />
<p align="center">
  <a href="https://github.com/BelizeBankLimited/ekyash-gl-posting">
    <img src="images/logo.png" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">E-KYASH GL Posting</h3>

  <p align="center">
    A Node JS program, written in TypeScript, to read the EKYASH gl file and generate a posting file for FBE
  </p>
</p>



<!-- TABLE OF CONTENTS -->
<details open="open">
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#files">Files</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
### About The Project

This program is written in TypeScript and uses NodeJS.

What does it do?

* Open and read the file yyyy-mm-dd-GeneralLedgerPosting.csv as input from ./input (Note: the file is dated for yesterday's date)
* Group the file by Operation Type ID and Transaction Type ID
* Connect to DB2 and get all configured transaction types, using this SQL: SELECT ID AS ID, OPERATION_TYPE AS OPERATIONTYPE, TXN_TYPE AS TXNTYPE, CREDIT_ACCOUNT AS CREDITACCOUNT, DEBIT_ACCOUNT AS DEBITACCOUNT, DEBIT_TXN_CODE AS DEBITTXNCODE, CREDIT_TXN_CODE AS CREDITTXNCODE,TXN_CURRENCY_CODE AS TXNCURRENCYCODE FROM BLB.BBL_EKYASH_TXN_GL
* For each operation type + transaction type key combination in the file that is also in the table, total the $$ amount per transaction type and write a debit/credit to the respective accounts.
* Writes transactions to ./output/GeneralLedgerPostingYYYY-MM-DD
* Writes a log file to ./log and a summary log file to ./log (summary log file is used by Automate to confirm program completion)
* Writes an xlsx report of the processing for Finance to reconcile with. Written to ./output
* Moves input file from ./input to ./completed

## ADHOC Mode

* To run the program in adhoc mode, modify the file common.ts in /opt/ekyash-gl-posting/src/config 
* Set allowAdhoc to true
* Specify a string date as yyyy-mm-dd for the adhocDate
* Now, you can run the program. Important: Remember to change the allowAdhoc setting back to false!

* A test version of this program is on the OLB Regression machine at /opt

## Files

* Input file => ./input/yyyy-mm-dd-GeneralLedgerPosting.csv (this comes from wallet factory)
* Output file => ./output/GeneralLedgerPostingyyyy-mm-dd.txt (this should be transerred to FBE for posting in the batch)
* Log file => ./logs/GeneralLedgerPosting-yyyy-mm-dd.log (detailed log of process)
* Summary log file => ./logs/GeneralLedgerPosting_summary-yyyy-mm-dd.log (summary log; used by Automate to see if the process completed)
* EXCEL report => ./output/GeneralLedgerPostingyyyy-mm-dd.xlsx (protected xlsx rpt to be used by Finance for reconc.)

Of course, there is no substitute to actually reading the code. Clone the repo for yourself. :smile:

<!-- GETTING STARTED -->
## Getting Started

This is an example of how you may setup your project locally.
To get a local copy up and running follow these simple example steps.

* npm (skip if Node 10+ already installed on server/machine)
  ```sh
  npm install npm@latest -g
  ```


### Installation

1. Clone the repo to a server with NodeJS 10+ installed && access to a DB2 database (FBE dev/regression/production)
   ```sh
   git clone https://github.com/BelizeBankLimited/ekyash-gl-posting.git
   ```
3. Install NPM packages 
   ```sh
   npm install
   ```
4. Create a .env file in the project root with the same properties as in  `.env.example`
   ```JS
   NAME=
   CONNECTOR=
   HOST=
   PORT=
   DBUSER=
   PASSWORD=
   DATABASE=
   SCHEMA=
   FILEPASSWORD=
   ```
5. [Optional] If BLB.BBL_EKYASH_TXN_GL does not exist. Find the create/load script in ./scripts/ekyash-gl-posting.sql and run in the database.

6. Place an input file in the ./input folder (you may need to create this), then run:
   ```sh
   npm start
   ```



