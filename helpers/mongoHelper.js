const {MongoClient} = require('mongodb');

module.exports = {

    connect: async (dbName) => {
        const uri = `mongodb+srv://vpchat:***REMOVED***@cluster0.blwxx.mongodb.net/${dbName}?retryWrites=true&w=majority`;
        const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        return await client.connect();
    },
    
    getAll: async (collectionName) => {
        let findResult;

        const client = await module.exports.connect();
        const collection = client.db("vpc").collection(collectionName);      
        findResult = await collection.find({}).toArray();
        client.close();

        return findResult;
    },

    insertMany: async (records, collectionName) => {
        let findResult;

        const client = await module.exports.connect();
        const collection = client.db("vpc").collection(collectionName);      
        await collection.insertMany(records);
        client.close();
    },


    deleteAll: async (collectionName) => {
        let findResult;

        const client = await module.exports.connect();
        const collection = client.db("vpc").collection(collectionName);      
        await collection.deleteMany({});
        client.close();
    },

}