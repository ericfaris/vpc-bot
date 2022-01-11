require('dotenv').config()
const fetch = require("node-fetch");

class VPCDataService {
    
    baseApiUrl;
    options;

    constructor(){
        this.baseApiUrl = process.env.VPC_DATA_SERVICE_API_URI || "http://vpcbot.golandry.net:6080/api/v1";
        this.options = { 
            headers : {
                'Authorization': 'Bearer ODYwMzEwODgxNTc3NDY3OTA0.YN5Y8Q.0P5EwvlXHG6YOtNfkWKt_xOFTtc',
                'Content-Type': 'application/json'
            }
        };
    };

    async getTables() {
        return (await fetch(`${this.baseApiUrl}/tables`, this.options)).json();
    }

    async getScoresByTable(tableName) {
        return (await fetch(`${this.baseApiUrl}/scoresByTable?tableName=${tableName}`, this.options)).json();
    }

    async getScoresByTableAndAuthorUsingFuzzyTableSearch(tableSearchTerm) {
        return (await fetch(`${this.baseApiUrl}/scoresByTableAndAuthorUsingFuzzyTableSearch?tableSearchTerm=${tableSearchTerm}`
            , this.options)).json();
    }

    async getScoresByTableAndAuthor(tableName, authorName) {
        return (await fetch(`${this.baseApiUrl}/scoresByTableAndAuthor?tableName=${tableName}&authorName=${authorName}`
            , this.options)).json();
    }

    async getScoresByTableAndAuthorAndVersion(tableName, authorName, version) {
        return (await fetch(`${this.baseApiUrl}/scoresByTableAndAuthor?tableName=${tableName}&authorName=${authorName}&versionNumber=${version}`
            , this.options)).json();
    }

    async getWeeks() {
        return (await fetch(`${this.baseApiUrl}/weeks`, this.options)).json();
    }
}

module.exports.VPCDataService = VPCDataService;