const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// List function for /orders, responds with the current list of dishes
function list(req, res, next){
    res.json({ data: dishes });
}

// Validator that returns a function that checks for the existence of a given property and ensures it is
// not an empty string
function bodyDataHas(propertyName){
    // Return the validation function
    return function(req, res, next){
        // Retrieves the data from the request body
        const { data = {} } = req.body;
        // Checks to see if the given property exists and is not an empty string
        if (data[propertyName] && data[propertyName] !== ""){
            // If it's valid, move on to the next middleware function
            return next();
        }
        // If its invalid, stop and send an error to the user
        next({
            status: 400,
            message: `Dish must include a ${propertyName}`
        });
    };
}

// Validation function for the price, which has some extra stipulations.
// Ensures the price is a non-zero, non-negative integer
function priceIsValid(req, res, next){
    // Retrieve the price given in the request body
    const { data: { price } = {} } = req.body;
    // If the price exists, is an integer, and is greater than 0, we move onto the next middleware function
    if (price && Number.isInteger(price) && price > 0){
        return next();
    }
    // If the price is invalid, we respond with an error message for the user
    next({ 
        status: 400,
        message: `Dish must have a price that is an integer greater than 0`
    });
}

// Validation function for the id, ensuring that the id for the given dish
// matches the one given in the route
function idIsValid(req, res, next){
    // Retrieve the id from the route parameters
    const { dishId } = req.params;
    // Retrieve the id from the request body
    const { data: { id } = {} } = req.body;
    // If the two id's match, we move onto the next middleware function
    if (!id || dishId === id){
        return next();
    }
    // Otherwise, we return an error to the user
    next({
        status: 400,
        message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`
    });
}

// Creates a new dish with the given properties. Called after all validation has been passed. 
function create(req, res, next){
    // Retrieve the properties from the request body
    const { data: { name, description, price, image_url } = {} } = req.body;
    // Create a new dish with the properties from the request and a new id
    const newDish = {
        id: nextId(),
        name,
        description,
        price, 
        image_url,
    };
    // Adds the dish to our list of dishes
    dishes.push(newDish);
    // Responds with the new dish after successfully creating the new dish
    res.status(201).json({ data: newDish });
}

// Validation function to ensure that a dish exists for a given id
function dishExists(req, res, next){
    // Retrieve the dish id from the route parameters
    const { dishId } = req.params;
    // Locate the dish from our list given the id
    const foundDish = dishes.find((dish) => dish.id === dishId);
    // If we successfully matched the id and found a dish...
    if (foundDish){
        // Set the local paramter to the found dish so we don't have to search again
        res.locals.dish = foundDish;
        // Move onto the next middleware function
        return next();
    }
    // Otherwise, we return an error message, since we couldn't find a matching dish
    next({
        status: 404,
        message: `Dish does not exist: ${dishId}`
    })
}

// Returns the data for a specified dish based on its id. Called after validating that the dish exists.
function read(req, res, next){
    // Retrieves the found dish from the locals
    const dish = res.locals.dish;
    // Responds with the dish's information
    res.json({ data: dish });
}

// Updates a given dish with new properties. Called after validating the given properties and 
// that the dish exists. 
function update(req, res, next){
    // Retrieves the found dish from the locals
    const dish = res.locals.dish;
    // Retrieves the updated properties from the request body
    const { data: { name, description, price, image_url } = {} } = req.body;

    // Updates the dish with the new properties
    dish.name = name;
    dish.description = description;
    dish.price = price;
    dish.image_url = image_url;
    // Responds with the updated dish's information
    res.json({ data: dish });
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
        idIsValid,
        update 
    ],
};