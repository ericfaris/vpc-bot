require('dotenv').config()
const Logger = require('./loggingHelper');

class ArgHelper {

    constructor(){};

    getArg(argList, type, name) {
        switch(type) {

            case 'bool':
                return (argList.filter(x => x.name === name)[0]?.value)?.toLowerCase() === 'true' ? true : false; 
                
            case 'int':
                return parseInt(argList.filter(x => x.name === name)[0]?.value);    

            case 'string':
            default:
               return argList.filter(x => x.name === name)[0]?.value;
        }
    }

}

module.exports.ArgHelper = ArgHelper;