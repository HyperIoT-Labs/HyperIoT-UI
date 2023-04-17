import { Injectable } from "@angular/core";
import { LoggerService } from './logger.service';
import { LOG_LEVEL } from './logger-config';

@Injectable()
/**
 * This class has the all methods used to create the logs.
 */
export class Logger {

    private className: string = null;

    /**
     * This is the constructor of the class. 
     */
    constructor(private loggerService: LoggerService) { }

    /**
     * This method inizializes the logger in the class using the class name.
     */
    registerClass(className: string) {
        this.className = className;
    }

    /**
     * This method writes an error log.
     */
    public error(msg: any, ...params: any[]) {
        this.loggerService.writeLog(LOG_LEVEL.ERROR, this.className, msg, ...params);
    }

    /**
     * This method writes a warning log.
     */
    public warn(msg: any, ...params: any[]) {
        this.loggerService.writeLog(LOG_LEVEL.ERROR, this.className, msg, ...params);
    }

    /**
     * This method writes an info log.
     */
    public info(msg: any, ...params: any[]) {
        this.loggerService.writeLog(LOG_LEVEL.INFO, this.className, msg, ...params);
    }

    /**
     * This method writes debug logs.
     */
    public debug(msg: any, ...params: any[]) {
        this.loggerService.writeLog(LOG_LEVEL.DEBUG, this.className, msg, ...params);
    }

    /**
     * This method writes a tracing log.
     */
    public trace(msg: any, ...params: any[]) {
        this.loggerService.writeLog(LOG_LEVEL.TRACE, this.className, msg, ...params);
    }

    /**
     * This method writes a generic log.
     */
    public log(level: LOG_LEVEL, msg: any, ...params: any[]) {
        this.loggerService.writeLog(level, this.className, msg, ...params);
    }
}