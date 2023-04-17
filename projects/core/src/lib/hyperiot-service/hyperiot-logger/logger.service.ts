import { Injectable, Optional, Inject } from "@angular/core";
import { LOG_LEVEL, LogRegistry, LogRegistryEntry } from './logger-config';

@Injectable({
    providedIn: 'root'
})
export class LoggerService {
    /**
     * This variables specifies the log level implemented globally in the application.
     */
    private globalLogLevel: LOG_LEVEL = LOG_LEVEL.DEBUG;

    /**
     * Variable used to specify the log level for a specific class.
     */
    private logRegistry: LogRegistry = null;

    /**
     * This is the constructor of the class.
     */
    constructor(
        @Optional() @Inject('logLevel') logLevel: LOG_LEVEL,
        @Optional() @Inject('registry') registry: any
    ) {
        if (logLevel !== null) {

        }
    }

    /**
     * This method sets the log level to 
     */
    setLogLevel(logLevel: LOG_LEVEL) {
        this.globalLogLevel = logLevel;
    }

    /**
     * This method 
     */
    setRegistry(registry: any) {
        for (const className in registry) {
            if (registry.hasOwnProperty(className)) {
                this.setToRegistry(className, registry[className]);
            }
        }
    }

    /**
     * This method sets a class and the desired log level in the registry.
     */
    public setToRegistry(className: string, config: LogRegistryEntry) {
        this.logRegistry.registry.set(className, config);
    }

    /**
     * This method deletes a class from the registry.
     */
    public removeFromRegistry(className: string) {
        this.logRegistry.registry.delete(className);
    }

    /**
     * This method returns the registry by key
     */
    public getRegistryByKey(key: string): LogRegistryEntry {
        const hasKey: boolean = this.logRegistry && this.logRegistry.registry.has(key);
        return hasKey ? this.logRegistry.registry.get(key) : null;
    }

    /**
     * This method writes an error log.
     */
    public error(msg: any, ...params: any[]) {
        this.writeLog(LOG_LEVEL.ERROR, null, msg, ...params);
    }

    /**
     * This method writes an info log.
     */
    public info(msg: any, ...params: any[]) {
        this.writeLog(LOG_LEVEL.INFO, null, msg, ...params);
    }

    /**
     * This method writes a warning log.
     */
    public warn(msg: any, ...params: any[]) {
        this.writeLog(LOG_LEVEL.WARN, null, msg, ...params)
    }

    /**
     * This method writes a debugging log.
     */
    public debug(msg: any, ...params: any[]) {
        this.writeLog(LOG_LEVEL.WARN, null, msg, ...params)
    }

    /**
     * This method writes a tracing log.
     */
    public trace(msg: any, ...params: any[]) {
        this.writeLog(LOG_LEVEL.TRACE, null, msg, ...params);
    }

    /**
     * This method tells whether or not a log can be written.
     */
    private canWriteLog(logLevel: LOG_LEVEL, className: string) {
        let registryConfig: LogRegistryEntry = null;

        // custom configurations
        if (className) {
            registryConfig = this.getRegistryByKey(className);
        }

        if (registryConfig) {
            // custom configuration has priority on global one
            if (registryConfig.logLevel < logLevel) {
                return false;
            } else {
                return true;
            }
        } else {
            if (this.globalLogLevel < logLevel) {
                return false;
            } else {
                return true;
            }
        }

        return true;
    }

    /**
     * This method gets the log level in console.
     */
    private getConsoleLevel(level: LOG_LEVEL) {
        switch (LOG_LEVEL[level]) {
            case LOG_LEVEL[LOG_LEVEL.DEBUG]:
                return 'log';
            case LOG_LEVEL[LOG_LEVEL.TRACE]:
                return 'log';
            case LOG_LEVEL[LOG_LEVEL.ERROR]:
                return 'error';
            case LOG_LEVEL[LOG_LEVEL.INFO]:
                return 'info';
            case LOG_LEVEL[LOG_LEVEL.WARN]:
                return 'warn';
            default:
                return 'log';
        }
    }

    /**
     * This method associates the colors to their corrispondent log types.
     */
    private getColor(level: LOG_LEVEL) {
        switch (LOG_LEVEL[level]) {
            case LOG_LEVEL[LOG_LEVEL.DEBUG]:
                return 'blue';
            case LOG_LEVEL[LOG_LEVEL.TRACE]:
                return 'green';
            case LOG_LEVEL[LOG_LEVEL.ERROR]:
                return 'red';
            case LOG_LEVEL[LOG_LEVEL.INFO]:
                return 'teal';
            case LOG_LEVEL[LOG_LEVEL.WARN]:
                return 'orange';

            default:
                return 'black';
        }
    }

    /**
     * This method is used to write a log in the console.
     */
    public writeLog(level: LOG_LEVEL, className: string, msg: any, ...params: any[]) {
        const color = this.getColor(level);
        const logLevel = this.getConsoleLevel(level);

        // console log
        if (this.canWriteLog(level, className)) {
            if (className) {
                console[logLevel](`%c[${LOG_LEVEL[level]} - ${className}] ${msg}`, 'color: ' + color, params);
            } else {
                console[logLevel](`%c[${LOG_LEVEL[level]}] ${msg}`, 'color: ' + color, params);
            }
        }
    }

}