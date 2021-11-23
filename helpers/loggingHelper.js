const { createLogger, format, transports } = require('winston');

class Logger {
    constructor(user) {
        this.user = user;
        this.logger = createLogger({
            transports: [
                new transports.File({
                    filename: 'data/server.log',
                    format: format.combine(
                        format.timestamp({ format: 'MMM-DD-YYYY HH:mm:ss' }),
                        format.align(),
                        format.printf(info => `${info.level}: ${[info.timestamp]}: ${user?.username ?? 'SERVER'}: ${info.message}`),
                    )
                }),
                new transports.Console({
                    level: 'info',
                    format: format.combine(
                        format.timestamp({ format: 'MMM-DD-YYYY HH:mm:ss' }),
                        format.colorize(),
                        format.printf(info => `${info.level}: ${[info.timestamp]}: ${user?.username ?? 'SERVER'}: ${info.message}`),
                    )
                })
            ]
        });
    }
}

module.exports = Logger;