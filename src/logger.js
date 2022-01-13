import winston from "winston"


export const logger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      level: "debug",
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    new winston.transports.File({
      filename: "log/combined.log",
      level: "info",
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