const { createLogger, format, transports } = require('winston');

class Logger {
    constructor(user) {
        this.user = user;
        this.logger = createLogger({
            transports: [
                new transports.File({
                    filename: 'data/server.log',
                    level: 'info',
                    format: format.combine(
                        format.errors({stack: true}),
                        format.timestamp({ format: 'MMM-DD-YYYY HH:mm:ss' }),
                        format.align(),
                        format.printf(({timestamp, level, message, stack}) => {
                            const text = `${timestamp} ${level.toUpperCase()} ${user?.username ?? 'SERVER'} ${message}`;
                            return stack ? text + '\n' + stack : text;
                        }),
                    )
                }),
                new transports.Console({
                    level: 'info',
                    format: format.combine(
                        format.errors({stack: true}),
                        format.timestamp({ format: 'MMM-DD-YYYY HH:mm:ss' }),
                        format.colorize(),
                        format.printf(({timestamp, level, message, stack}) => {
                            const text = `${timestamp} ${level.toUpperCase()} ${user?.username ?? 'SERVER'} ${message}`;
                            return stack ? text + '\n' + stack : text;
                        }),
                    )
                })
            ]
        });
    }
}

module.exports = Logger;