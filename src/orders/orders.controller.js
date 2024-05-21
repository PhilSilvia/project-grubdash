const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");
const { del } = require("express/lib/application");

// TODO: Implement the /orders handlers needed to make the tests pass
function list(req, res, next){
    res.json({ data: orders });
}

function bodyDataHas(propertyName){
    return function(req, res, next){
        const { data = {} } = req.body;
        if (data[propertyName] && data[propertyName] !== ""){
            return next();
        }
        next({
            status: 400,
            message: `Order must include a ${propertyName}`
        });
    };
}

function dishesIsValid(req, res, next){
    const { data: { dishes } = {} } = req.body;
    if (dishes && Array.isArray(dishes) && dishes.length > 0){
        dishes.forEach((dish, index) => {
            if (!dish.quantity || !Number.isInteger(dish.quantity) || dish.quantity <= 0){
                return next({
                    status: 400,
                    message: `Dish ${index} must have a quantity that is an integer greater than 0`
                });
            }
        });
        return next();
    }
    next({
        status: 400,
        message: `Order must include at least one dish`
    });
}

function create(req, res, next){
    const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
    const newOrder = {
        id: nextId(),
        deliverTo,
        mobileNumber,
        status,
        dishes
    };
    orders.push(newOrder);
    res.status(201).json({ data: newOrder });
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
    create: [
        bodyDataHas("deliverTo"), 
        bodyDataHas("mobileNumber"),
        bodyDataHas("dishes"),
        dishesIsValid,
        create 
    ],
    read: [ orderExists, read ],
    update: [ orderExists, update ],
    delete: [ orderExists, destroy ],
};