
const dbService = require('../../services/db.service')
const ObjectId = require('mongodb').ObjectId

module.exports = {
    query,
    getById,
    remove,
    update,
    add,
    getLabelsMap
}

async function query(filterBy = {}) {
    const critirea = _buildCriteria(filterBy);  
    const collection = await dbService.getCollection('station');
    try {
        const stations = await collection.find(critirea.query).sort(critirea.sortBy).toArray();
        return stations;
    } catch (err) {
        console.log('ERROR: cannot find Stations')
        throw err;
    }
}

async function getById(stationId) {
    const collection = await dbService.getCollection('station')
    try {
        const station = await collection.findOne({ "_id": ObjectId(stationId) })
        return station;
    } catch (err) {
        console.log(`ERROR: while finding station ${stationId}`)
        throw err;
    }
}


async function remove(stationId) {
    const collection = await dbService.getCollection('station')
    try {
        await collection.deleteOne({ "_id": ObjectId(stationId) })
    } catch (err) {
        console.log(`ERROR: cannot remove station ${stationId}`)
        throw err;
    }
}

async function update(station) {
    const collection = await dbService.getCollection('station')
    station._id = ObjectId(station._id);

    try {
        const savedStation = await collection.replaceOne({ "_id": station._id }, { $set: station })
        return savedStation
    } catch (err) {
        console.log(`ERROR: cannot update station ${station._id}`)
        throw err;
    }
}

async function add(station) {
    const collection = await dbService.getCollection('station')
    try {
        const savedStation = await collection.insertOne(station);
        console.log('saved station inside service is: ', savedStation)
        return savedStation;
    } catch (err) {
        console.log(`ERROR: cannot insert station`)
        throw err;
    }
}



async function getLabelsMap(){
    const collection = await dbService.getCollection('station')
    try {
        const stations = await collection.find().toArray();
        var labelsMap = stations.reduce((acc, station) =>{
            station.labels.forEach(label =>{
               if (!acc[label]) acc[label] = 0;
               acc[label]++;
            })
            return acc
        },{})
        labelsMap = _orderMap(labelsMap)
        return labelsMap
    } catch (err) {
        console.log('ERROR: cannot find Stations')
        throw err;
    }
}



function _buildCriteria(filterBy) {
    const critirea = {
        query: {},
        sortBy: {}
    };
    if (filterBy.txt) {
        if (filterBy.searchIn === 'genres') critirea.query.labels = { $in: [filterBy.txt] };
        else critirea.query.title = { $regex: filterBy.txt, $options: 'i' };
    } 
   
    if (filterBy.sortBy === 'date') critirea.sortBy.createdAt = -1; 
    else critirea.sortBy.title = 1;
    
    return critirea;
}

function _orderMap(map){
    var orderedMap = {};
    let orderedKeys = Object.keys(map)
     .sort((a, b) => (map[a] < map[b] ? 1 : -1))
     .forEach(key => (orderedMap[key] = map[key]));
     return orderedMap
}
