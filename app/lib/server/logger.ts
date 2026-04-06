type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
	[key: string]: unknown;
}

interface LogEntry {
	level: LogLevel;
	message: string;
	timestamp: string;
	[key: string]: unknown;
}

const LOG_LEVEL_ORDER: Record<LogLevel, number> = {
	debug: 0,
	info: 1,
	warn: 2,
	error: 3,
};

const resolveLogLevel = (): LogLevel => {
	const raw = process.env.LOG_LEVEL?.toLowerCase();
	if (raw && raw in LOG_LEVEL_ORDER) {
		return raw as LogLevel;
	}
	return "info";
};

const isEnabled = (level: LogLevel): boolean => {
	const minLevel = resolveLogLevel();
	return LOG_LEVEL_ORDER[level] >= LOG_LEVEL_ORDER[minLevel];
};

const isProd = process.env.NODE_ENV === "production";

// ANSI color codes for dev pretty-printing
const COLORS: Record<LogLevel, string> = {
	debug: "\x1b[34m", // blue
	info: "\x1b[32m", // green
	warn: "\x1b[33m", // yellow
	error: "\x1b[31m", // red
};
const RESET = "\x1b[0m";

const formatEntry = (entry: LogEntry): string => {
	if (isProd) {
		return JSON.stringify(entry);
	}

	const color = COLORS[entry.level];
	const { level, message, timestamp, ...rest } = entry;
	const contextStr = Object.keys(rest).length > 0 ? ` ${JSON.stringify(rest)}` : "";
	return `${color}[${timestamp}] ${level.toUpperCase()} ${message}${RESET}${contextStr}`;
};

const buildEntry = (level: LogLevel, message: string, context?: LogContext): LogEntry => ({
	level,
	message,
	timestamp: new Date().toISOString(),
	...context,
});

const writeLog = (entry: LogEntry): void => {
	const line = formatEntry(entry);
	if (entry.level === "error" || entry.level === "warn") {
		console.error(line);
	} else {
		console.log(line);
	}
};

const debug = (message: string, context?: LogContext): void => {
	if (!isEnabled("debug")) return;
	writeLog(buildEntry("debug", message, context));
};

const info = (message: string, context?: LogContext): void => {
	if (!isEnabled("info")) return;
	writeLog(buildEntry("info", message, context));
};

const warn = (message: string, context?: LogContext): void => {
	if (!isEnabled("warn")) return;
	writeLog(buildEntry("warn", message, context));
};

const error = (message: string, err?: unknown, context?: LogContext): string => {
	const errorId = crypto.randomUUID();

	const errorContext: LogContext = {
		...context,
		errorId,
	};

	if (err instanceof Error) {
		errorContext.errorMessage = err.message;
		errorContext.errorName = err.name;
		if (err.stack) {
			errorContext.stack = err.stack;
		}
	} else if (err !== undefined) {
		errorContext.errorRaw = String(err);
	}

	if (!isEnabled("error")) return errorId;
	writeLog(buildEntry("error", message, errorContext));

	return errorId;
};

export const logger = {
	debug,
	info,
	warn,
	error,
};
