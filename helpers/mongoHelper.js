const {MongoClient} = require('mongodb');

module.exports = {

    connect: async (dbName) => {
        const uri = `mongodb+srv://vpchat:aeMxNmszpIs8tvgH@cluster0.blwxx.mongodb.net/${dbName}?retryWrites=true&w=majority`;
        const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        return await client.connect();
    },
    
    getCollection: async (client, dbName, collectionName) => {
        const collections = await client.db(dbName).collections();
        if (!collections.some((collection) => collection.collectionName === collectionName)) {
            client.db(dbName).createCollection(collectionName);
        }
        
        return client.db(dbName).collection(collectionName);      
    },

    getAll: async (dbName, collectionName) => {
        let findResult;

        const client = await module.exports.connect();
        const collection = await module.exports.getCollection(client, dbName, collectionName)
        findResult = await collection.find({}).toArray();
        client.close();

        return findResult;
    },

    insertOne: async (doc, dbName, collectionName) => {
        const client = await module.exports.connect();
        const collection = await module.exports.getCollection(client, dbName, collectionName)
        await collection.insertOne(doc);
        client.close();
    },

    insertMany: async (docs, dbName, collectionName) => {
        const client = await module.exports.connect();
        const collection = await module.exports.getCollection(client, dbName, collectionName)
        await collection.insertMany(docs);
        client.close();
    },

    find: async (filter, dbName, collectionName) => {
        const client = await module.exports.connect();
        const collection = await module.exports.getCollection(client, dbName, collectionName)
        const docs = await collection.find(filter);
        client.close();

        return docs;
    },

    findOne: async (filter, dbName, collectionName) => {
        const client = await module.exports.connect();
        const collection = await module.exports.getCollection(client, dbName, collectionName)
        const doc = await collection.findOne(filter);
        client.close();

        return doc;
    },

    findOne: async (filter, dbName, collectionName) => {
        const client = await module.exports.connect();
        const collection = await module.exports.getCollection(client, dbName, collectionName)
        const doc = await collection.find(filter);
        client.close();

        return doc;
    },

    findOneAndUpdate: async (filter, update, options, dbName, collectionName) => {
        const client = await module.exports.connect();
        const collection = await module.exports.getCollection(client, dbName, collectionName)
        const doc = await collection.findOneAndUpdate(filter, update, options);
        client.close();

        return doc;
    },

    findCurrentWeek: async (dbName, collectionName) => {
        const client = await module.exports.connect();
        const collection = await module.exports.getCollection(client, dbName, collectionName)
        const docs = await collection.find({ isArchived: false});
        client.close();

        return docs;
    },

    updateOne: async (filter, update, dbName, collectionName) => {
        const client = await module.exports.connect();
        const collection = await module.exports.getCollection(client, dbName, collectionName)
        await collection.updateOne(filter, update);
        client.close();
    },

    deleteAll: async (dbName, collectionName) => {
        const client = await module.exports.connect();
        const collection = await module.exports.getCollection(client, dbName, collectionName)
        await collection.deleteMany({});
        client.close();
    },

}