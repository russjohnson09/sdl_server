const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
// const uuidv1 = require('uuid/v1');


class MongoDBHelper {



    static async getDB(opts) {
        opts = opts || {};
        let url = opts.url || this.mongoDbUrl;
        let dbName = opts.dbName || this.defaultDBName;
        const client = new MongoClient(url);
        this.client = client;
        let self = this;

        return new Promise((resolve,reject) => {
            client.connect(function (err) {
                if (err)
                {
                    console.log(err);
                    return reject(err);
                }
                console.log("Connected successfully to server");
                const db = client.db(dbName);
                console.log(`${self.constructor.name} fetching database ${dbName}`);
                return resolve(db);
                // client.close();
            });
        })
    }

    static closeClient()
    {
        this.client.close();
    }


    static getObjectID(id)
    {
        return new ObjectID(id);
    }

    //
    // public static getId()
    // {
    //     return uuidv1(); // ⇨ '45745c60-7b1a-11e8-9c9c-2d42b21b1a3e'
    // }




}


MongoDBHelper.mongoDbUrl = `mongodb://localhost:27017`;
MongoDBHelper.efaultDBName = `sdl_server`;

MongoDBHelper.client = null;


module.exports = MongoDBHelper;
