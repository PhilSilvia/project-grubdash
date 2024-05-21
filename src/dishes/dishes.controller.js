const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass
function list(req, res, next){

}

function create(req, res, next){

}

function dishExists(req, res, next){
    
}

function read(req, res, next){

}

function update(req, res, next){

}

module.exports = {
    list,
    create: [ create ],
    read: [ dishExists, read ],
    update: [ dishExists, update ],
};