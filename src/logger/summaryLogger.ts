const moment = require ('moment');
const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
import { commonConf } from '../config/common';

// Define custom format for logs
const customFormat = winston.format.combine(
    winston.format.splat(),
    winston.format.simple(),
    winston.format.timestamp(),
    winston.format.printf(info => `${info.message}`)
  );

export class SummaryLogger {

    constructor(){}
    
    instiantiateLogger() {
        // Instantiate loggers, rotate daily
        winston.loggers.add('summaryLogger', {
            exitOnError: false,
            format: winston.format.combine(
                customFormat
            ),
            transports: [
                new DailyRotateFile({
                    filename:  `${commonConf.logDir}${commonConf.summaryFile}-%DATE%.log`,
                    datePattern: 'YYYY-MM-DD',
                    zippedArchive: true,
                    level: 'info'
                })
            ]
        });
    }

}
