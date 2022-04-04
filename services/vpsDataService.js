require('dotenv').config()
const fetch = require("node-fetch");

class VPSDataService {
    
    baseApiUrl;
    options;

    constructor(){
        this.baseApiUrl = process.env.VPS_DATA_SERVICE_API_URI;
        this.options = { 
            headers : {
                'Authorization': 'Bearer ODYwMzEwODgxNTc3NDY3OTA0.YN5Y8Q.0P5EwvlXHG6YOtNfkWKt_xOFTtc',
                'Content-Type': 'application/json'
            }
        };
    };ffs

    async getVpsGame(vpsId) {
        return (await fetch(`${this.baseApiUrl}/games/tables/${vpsId}`, this.options)).json();
    }
}

module.exports.VPSDataService = VPSDataService;