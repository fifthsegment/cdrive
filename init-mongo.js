const adminDB = db.getSiblingDB('admin');
adminDB.auth("mongodb", "mongodb");

const targetDB = adminDB.getSiblingDB('mongodb');

targetDB.createUser({
    user: "user",
    pwd: "password",
    roles: [
        {
            role: "readWrite",
            db: "mongodb"
        }
    ]
});

targetDB.createCollection('files');
targetDB.createCollection('folders');

// test