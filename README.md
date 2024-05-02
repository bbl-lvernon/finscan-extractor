

# <FONT COLOR=red>WARNING</FONT> - SANDBOX REPO - PROOF OF CONCEPT ONLY
<FONT COLOR=red>## WARNING</FONT COLOR> - THIS REPO IS CURRENTLY UNDER DEVELOPMENT
<FONT COLOR=red>## WARNING</FONT COLOR> - DB PROVISIONING FOR CUSTOM TABLES PENDING

(This repo may be added to BelizeBankLtd github after development is finished)

<!-- PROJECT LOGO -->
<br />
<p align="center">
  <a href="https://github.com/BelizeBankLimited/finscan-extractor">
    <img src="images/logo.png" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">FinScan Extractor</h3>

  <p align="center">
    A Node JS program, to extract and transpose client information to be digested by FinScan.
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

* Open DB connection
* Retrieve payload from the FINSCAN_CUSTINFO view in the database. This is basically all active cients.
* Populate file with payload, separating each field with pipes (|).
* Writes data to ./output/FinScan_'YYYYMMDD'.out.
* Writes a log file to ./log.

A more comprehensive profile of this can be found here: 
```sh
\\mainw2k\isd\FinscanExtractor Specification
```

### BBIL Mode

* To run the program in BBIL mode, modify the file common.ts in 'src/config/'
* Set 'BBILMODE' to true, save.
* Now, you can run the program. Important: Remember to change the BBILMODE setting back to false!

### Files

* Output file => /finscan-extractor/output/ (this should be transerred to FinScan for processing)
* Log file => /finscan-extractor/logs (detailed log of process)

<!-- GETTING STARTED -->
### Getting Started

This is an example of how you may setup your project locally.
To get a local copy up and running follow these simple example steps.

* npm (skip if Node 10+ already installed on server/machine)
  ```sh
  npm install npm@latest -g
  ```


### Installation

1. Clone the repo to a server with NodeJS 10+ installed && access to a DB2 database (FBE dev/regression/production)
   ```sh
   git clone https://github.com/BelizeBankLimited/finscan-extractor.git
   ```
2. Install NPM packages 
   ```sh
   npm install
   ```
3. Start the app
   ```sh
   npm start
   ```

   Note:
   Ensure your machine has proper authority to access Database contents and ability to make changes to your filesystem.



