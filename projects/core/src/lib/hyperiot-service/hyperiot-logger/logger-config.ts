/**
 * A set of numerical constants used to identify log levels.
 */
export enum LOG_LEVEL {
    NOLOG = 0,
    ERROR = 1,
    WARN = 2,
    INFO = 3,
    DEBUG = 4,
    TRACE = 5
}

/**
 * A singole log entry in the registry.
 */
export class LogRegistryEntry {
    logLevel: LOG_LEVEL = LOG_LEVEL.DEBUG;
}

/**
 * LogRegistry
 */
export class LogRegistry {
    registry: Map<string, LogRegistryEntry> = new Map();
}