import winston from "winston";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logsDir = path.join(__dirname, "../logs");
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || "info",
    format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.errors({ stack: true }),
        winston.format.printf(({ timestamp, level, message, stack }) => {
            return `${timestamp} [${level.toUpperCase()}]: ${stack || message}`;
        }),
    ),
    defaultMeta: { service: "campushub-api" },
    transports: [
        new winston.transports.File({
            filename: path.join(logsDir, "error.log"),
            level: "error",
            maxsize: 10485760, // 10MB
            maxFiles: 5,
        }),
        new winston.transports.File({
            filename: path.join(logsDir, "combined.log"),
            maxsize: 10485760, // 10MB
            maxFiles: 5,
        }),
    ],
    exceptionHandlers: [
        new winston.transports.File({
            filename: path.join(logsDir, "exceptions.log"),
        }),
    ],
    rejectionHandlers: [
        new winston.transports.File({
            filename: path.join(logsDir, "rejections.log"),
        }),
    ],
});

if (process.env.NODE_ENV !== "production") {
    logger.add(
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple(),
            ),
        }),
    );
}

export default logger;
