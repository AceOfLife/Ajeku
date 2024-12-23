// PropertyImage Table Update

const { Property, User, PropertyImage } = require('../models');
const path = require('path');
const fs = require('fs');
const cloudinary = require('../config/cloudinaryConfig');
const { upload, uploadImagesToCloudinary } = require('../config/multerConfig');


//Create a new property 20/12

// Helper function to safely parse arrays from string
const parseJsonArray = (field) => {
    try {
        if (typeof field === 'string' && field.trim().startsWith("[") && field.trim().endsWith("]")) {
            return JSON.parse(field);
        } else if (Array.isArray(field)) {
            return field;
        }
        return [];
    } catch (error) {
        console.error('Error parsing JSON array', error);
        return []; // Return empty array on error
    }
};

const splitToArray = (field) => {
    // Only split if the field is a string
    if (typeof field === 'string') {
        return field.split(",").map(item => item.trim());
    }
    return []; // Return empty array if not a string
};

// Image upload

exports.createProperty = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            console.error("Multer error:", err); // Log the detailed error
            return res.status(400).json({ message: 'Error uploading images', error: err });
        }

        try {
            const { 
                name, 
                size, 
                price, 
                agent_id, 
                type, 
                location, 
                area, 
                number_of_baths, 
                number_of_rooms,
                address,
                description,
                payment_plan,
                year_built,
                amount_per_sqft,
                special_features,
                appliances,
                features,
                interior_area,
                parking,
                material,
                annual_tax_amount,
                date_on_market,
                ownership,
                kitchen,
                heating,
                cooling,
                type_and_style,
                lot,
                percentage,
                duration
            } = req.body;

            // Check if the admin is authenticated and has the correct role
            const admin = req.user; // Assuming req.user is populated with the logged-in admin's data
            if (admin.role !== 'admin') {
                return res.status(403).json({ message: 'You are not authorized to create a property' });
            }

            // Check if the agent exists (the agent_id should refer to a user with role 'agent')
            const agent = await User.findByPk(agent_id, { where: { role: 'agent' } });
            if (!agent) {
                return res.status(404).json({ message: 'Agent not found' });
            }

            // Handle date_on_market - if it's empty or invalid, set to current date or null
            const validDateOnMarket = date_on_market && date_on_market.trim() !== "" ? date_on_market : new Date().toISOString();

            // Prepare the property data with the required fields, set empty values if missing
            const newPropertyData = {
                name,
                size,
                price,
                agent_id, // Associate property with the agent
                type,
                location: location || "", // Empty string for missing location
                area: area || "", // Empty string for missing area
                address: address || "", // Empty string for missing address
                number_of_baths: number_of_baths || "0", // Default to 0 if missing
                number_of_rooms: number_of_rooms || "0", // Default to 0 if missing
                listed_by: req.admin ? req.admin.username : "Admin",
                description: description || "",  // Empty string for missing description
                payment_plan: payment_plan || "", // Empty string for missing payment_plan
                year_built: year_built || 0, // Default to 0 for missing year_built
                amount_per_sqft: amount_per_sqft || "0", // Default to 0 for missing amount_per_sqft
                special_features: special_features || [], // Empty array for missing special_features
                appliances: appliances || [], // Empty array for missing appliances
                features: features || [], // Empty array for missing features
                interior_area: interior_area || 0, // Default to 0 for missing interior_area
                material: material || "", // Empty string for missing material
                annual_tax_amount: annual_tax_amount || 0, // Default to 0 for missing annual_tax_amount
                date_on_market: validDateOnMarket, // Ensure valid date
                ownership: ownership || "", // Empty string for missing ownership
                percentage: percentage || "", // Empty string for missing ownership
                duration: duration || "", // Empty string for missing ownership
            };

            // Conditionally handle optional fields (convert string input to array if provided)
            if (kitchen) newPropertyData.kitchen = splitToArray(kitchen);
            if (heating) newPropertyData.heating = splitToArray(heating);
            if (cooling) newPropertyData.cooling = splitToArray(cooling);
            if (type_and_style) newPropertyData.type_and_style = splitToArray(type_and_style);
            if (lot) newPropertyData.lot = splitToArray(lot);
            if (special_features) newPropertyData.special_features = splitToArray(special_features);
            if (parking) newPropertyData.parking = splitToArray(parking);
            if (appliances) newPropertyData.appliances = splitToArray(appliances);
            if (features) newPropertyData.features = splitToArray(features);

            // Create the property record
            const newProperty = await Property.create(newPropertyData);

            // Handle image uploads to Cloudinary
            let imageUrls = [];
            if (req.files && req.files.length > 0) {
                imageUrls = await uploadImagesToCloudinary(req.files);

                const imageRecords = imageUrls.map(url => ({
                    property_id: newProperty.id,
                    image_url: [url],
                }));

                await PropertyImage.bulkCreate(imageRecords);
            }

            // Filter out fields with empty or null values
            const filteredProperty = {};

            Object.keys(newPropertyData).forEach(key => {
                if (newPropertyData[key] && newPropertyData[key] !== "" && newPropertyData[key] !== 0 && newPropertyData[key].length !== 0) {
                    filteredProperty[key] = newPropertyData[key];
                }
            });

            // Return the filtered property in the response
            res.status(201).json({
                property: filteredProperty,
                images: imageUrls || []
            });
        } catch (error) {
            console.error(error);
            res.status(400).json({ message: 'Error creating property', error });
        }
    });
};


// Update an existing property
exports.updateProperty = async (req, res) => {
    try {
        const { id } = req.params;
        const propertyData = req.body;

        // Ensure listing_updated field is updated on every update
        propertyData.listing_updated = new Date(); // Set current date for listing_updated

        // Update the property in the database
        const [updated] = await Property.update(propertyData, {
            where: { id }
        });

        if (updated) {
            const updatedProperty = await Property.findOne({ where: { id } });
            return res.status(200).json(updatedProperty);
        }

        throw new Error('Property not found');
    } catch (error) {
        res.status(400).json({ message: 'Error updating property', error });
    }
};

// Delete a property
exports.deleteProperty = async (req, res) => {
    try {
        const { id } = req.params;

        // Delete associated images if any
        const images = await PropertyImage.findAll({ where: { property_id: id } });
        images.forEach(image => {
            const imagePath = path.join(__dirname, '..', image.image_url);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath); // Delete the image file from the server
            }
        });

        // Delete the property from the database
        const deleted = await Property.destroy({
            where: { id }
        });

        if (deleted) {
            // return res.status(204).send();
            // Send a success message
            return res.status(200).json({
                message: `Property with ID ${id} has been successfully deleted.`
            });
        }

        throw new Error('Property not found');
    } catch (error) {
        res.status(400).json({ message: 'Error deleting property', error });
    }
};

// Get all properties
exports.getAllProperties = async (req, res) => {
    try {
        const properties = await Property.findAll({
            include: [
                {
                    model: PropertyImage, // Include the PropertyImage model
                    as: 'images',         // Alias for the association
                    attributes: ['image_url'] // Specify the image URL field to include
                }
            ]
        });
        res.status(200).json(properties);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving properties', error });
    }
};

// Get a property by ID
exports.getPropertyById = async (req, res) => {
    try {
        const { id } = req.params;
        const property = await Property.findOne({
            where: { id },
            include: [{ model: PropertyImage, as: 'images' }] // Include images for the property
        });

        if (property) {
            // Update the 'last_checked' field to current timestamp when the property is viewed
            await property.update({
                last_checked: new Date(),
            });
            
            res.status(200).json(property);
        } else {
            res.status(404).json({ message: 'Property not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving property', error });
    }
};


const { Op } = require('sequelize');

exports.getFilteredProperties = async (req, res) => {
    const { name } = req.query;

    // Log query parameters
    console.log("Query received:", req.query);

    // Validate the name parameter
    if (!name || name.trim() === "") {
        console.log("Name parameter is missing or invalid.");
        return res.status(400).json({ message: "The name query parameter is required" });
    }

    try {
        // Prepare the filter for the WHERE clause
        const filter = {
            name: {
                [Op.iLike]: `%${name.trim()}%`, // Case-insensitive partial match
            },
        };

        // Log the filter being applied
        console.log("Filter being applied:", JSON.stringify(filter, null, 2));

        // Log relevant models for debugging
        console.log("Property Model:", Property);
        console.log("PropertyImage Model:", PropertyImage);
        console.log("Associations for Property:", Property.associations);
        console.log("Associations for PropertyImage:", PropertyImage.associations);

        // Log the SQL query before execution
        try {
            const sqlQuery = await Property.sequelize.queryInterface.queryGenerator.selectQuery('Property', {
                where: filter,
                include: [{ model: PropertyImage, as: 'images' }] // Re-added 'as' alias
            });
            console.log("SQL Query being executed:", sqlQuery.sql);
        } catch (queryGenerationError) {
            console.error("Error generating SQL query:", queryGenerationError);
        }

        // Execute the query with the WHERE clause, using the 'as' alias in include
        const properties = await Property.findAll({
            where: filter, 
            include: [{ model: PropertyImage, as: 'images' }], // Include associated images with alias
        });

        // Log the result of the query
        console.log("Query result:", properties);

        // Return a 404 if no properties are found
        if (properties.length === 0) {
            return res.status(404).json({ message: 'No properties found matching the name criteria' });
        }

        // Return the filtered properties
        res.status(200).json(properties);
    } catch (error) {
        console.error("Error retrieving properties:", error);
        res.status(500).json({
            message: 'Error retrieving properties',
            error: error.message,
        });
    }
};