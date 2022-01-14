import winston from "winston"
const logLevel = process.env.NODE_ENV === "production" ? "info" : "debug"

export const logger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      level: logLevel,
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    new winston.transports.File({
      filename: "log/combined.log",
      level: logLevel,
    }),
    new winston.transports.File({
      filename: "log/errors.log",
      level: "error",
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({ filename: "log/exceptions.log" }),
  ],
})
winston.exceptions.handle(
  new winston.transports.File({ filename: "log/exceptions.log" })
)
