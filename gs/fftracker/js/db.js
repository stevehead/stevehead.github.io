const DB_NAME = 'GSFulfillmentTracker';

var db = new Dexie(DB_NAME);
db.version(1).stores({
    jobs: "++id,lmiId,tangId,description,utilization,pulledFrom,startTime,endTime",
    services: "++id,jobId,name,utilization,status,startTime,endTime",
    tasks: "++id,description,type",
    shifts: "++id,clockOn,startMeal,endMeal,clockOff"
});
db.open();
