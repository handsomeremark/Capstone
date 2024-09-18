const { MongoClient } = require("mongodb");
require("dotenv").config({ path: "./config.env" });

async function main() {
    const Db = process.env.ATLAS_URI;
    const client = new MongoClient(Db);

    try {
        await client.connect();
        const db = client.db("GreenCartPH");
        const collections = await db.listCollections().toArray();
        collections.forEach((collection) => console.log(collection.name));
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

main();
