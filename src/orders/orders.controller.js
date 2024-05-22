const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");
const { del } = require("express/lib/application");

// Responds with the current list of orders
function list(req, res, next){
    res.json({ data: orders });
}

// Validator that returns a function that checks for the existence of a given property and ensures it is
// not an empty string
function bodyDataHas(propertyName){
    // Returns a validator function
    return function(req, res, next){
        // Retrieves the data from the request body
        const { data = {} } = req.body;
        // Checks to see if the property exists and is not an empty string
        if (data[propertyName] && data[propertyName] !== ""){
            // If its valid, move onto the next middleware function
            return next();
        }
        // If its invalid, respond with an error message for the user
        next({
            status: 400,
            message: `Order must include a ${propertyName}`
        });
    };
}

// Validation function for the dishes property, since it needs to be an array of dishes and each dish
// needs to have a quantity greater than 0
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

// Creates a new order with the given properties after passing our validation checks
function create(req, res, next){
    // Retrieve the properties from the request body
    const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
    // Create a new order with the given properties
    const newOrder = {
        id: nextId(),
        deliverTo,
        mobileNumber,
        status,
        dishes
    };
    // Add the new order to our list of orders
    orders.push(newOrder);
    // Respond with the new order details
    res.status(201).json({ data: newOrder });
}

// Validation function that ensures an order exists for a given id
function orderExists(req, res, next){
    // Retrieve the order id that is desired
    const { orderId } = req.params;
    // Find the order that matches the id
    const foundOrder = orders.find((order) => order.id === orderId);
    // If we successfully found a matching order
    if (foundOrder){
        // Store the found order in the locals
        res.locals.order = foundOrder;
        // Move onto the next middleware function
        return next();
    }
    // Otherwise, return an error message to the user
    next({
        status: 404,
        message: `Order does not exists: ${orderId}`
    });
}

// Responds with the details for a given order id. Called after validating that
// an order exists with the given id
function read(req, res, next){
    // Retrieve the found order from the locals
    const { order } = res.locals;
    // Respond with the order's information
    res.json({ data: order });
}

// Updates the order of a given id with new properties. Called after validating the given properties
// and that an order exists at the given id
function update(req, res, next){
    // Retrieve the found order from the locals
    const { order } = res.locals;
    // Retrieve the update details from the request body
    const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
    // Update the order with the new properties
    order.deliverTo = deliverTo;
    order.mobileNumber = mobileNumber;
    order.status = status;
    order.dishes = dishes;
    // Respond with the new order's information
    res.json({ data: order });
}

// Deletes the entry for an order at a given id. Called after validating that an order exists at the
// given id
function destroy(req, res, next){
    // Retrieve the desired id from the route parameters
    const { orderId } = req.params;
    // Remove the order from our list of orders
    const index = orders.findIndex((order) => order.id === orderId);
    orders.splice(index, 1);
    // Respond with our success
    res.sendStatus(204);
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