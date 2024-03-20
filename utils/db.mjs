import { MongoClient } from 'mongodb';
const uri ="mongodb://127.0.0.1:27017";
const client = new MongoClient(uri);
var db;

/**
 * A function to stablish a connection with a MongoDB instance.
 */
export async function connectToDB() {
    try {
        // Connect the client to the server
        await client.connect();
        db = client.db('boop-dev-project-db');        
    } catch (err) {
        throw err; 
    } 
}
/**
 * This method just returns the database instance
 * @returns A Database instance
 */
export async function getDb() {
    return db;
}

export async function closeDBConnection(){
    await client.close();
    return 'Connection closed';
};



export default {connectToDB, getDb, closeDBConnection}