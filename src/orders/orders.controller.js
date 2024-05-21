const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass
function list(req, res, next){

}

function create(req, res, next){

}

function orderExists(req, res, next){
    
}

function read(req, res, next){

}

function update(req, res, next){

}

function destroy(req, res, next){

}

module.exports = {
    list,
    create: [ create ],
    read: [ orderExists, read ],
    update: [ orderExists, update ],
    delete: [ orderExists, destroy ],
};