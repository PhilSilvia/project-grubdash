const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass
function list(req, res, next){
    res.json({ data: dishes });
}

function bodyDataHas(propertyName){
    return function(req, res, next){
        const { data = {} } = req.body;
        if (data[propertyName] && data[propertyName] !== ""){
            return next();
        }
        next({
            status: 400,
            message: `Dish must include a ${propertyName}`
        });
    };
}

function priceIsValid(req, res, next){
    const { data: { price } = {} } = req.body;
    if (price && Number.isInteger(price) && price > 0){
        return next();
    }
    next({ 
        status: 400,
        message: `Dish must have a price that is an integer greater than 0`
    });
}

function create(req, res, next){
    const { data: { name, description, price, image_url } = {} } = req.body;
    const newDish = {
        id: nextId(),
        name,
        description,
        price, 
        image_url,
    };
    dishes.push(newDish);
    res.status(201).json({ data: newDish });
}

function dishExists(req, res, next){

}

function read(req, res, next){

}

function update(req, res, next){

}

module.exports = {
    list,
    create: [ 
        bodyDataHas("name"), 
        bodyDataHas("description"), 
        bodyDataHas("price"),
        bodyDataHas("image_url"),
        priceIsValid,
        create 
    ],
    read: [ dishExists, read ],
    update: [ 
        dishExists, 
        bodyDataHas("name"), 
        bodyDataHas("description"), 
        bodyDataHas("price"),
        bodyDataHas("image_url"),
        priceIsValid,
        update ],
};