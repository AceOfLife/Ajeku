// // PropertyImage Table Update

// const { Property, User, PropertyImage } = require('../models');
// const path = require('path');
// const fs = require('fs');
// const multer = require('multer');

// // Multer configuration for handling image uploads
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         // Use Vercel's /tmp directory for storing uploaded files temporarily
//         const uploadDir = '/tmp'; // Vercel's /tmp directory
//         cb(null, uploadDir); // Save images to /tmp directory
//     },
//     filename: (req, file, cb) => {
//         cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to filenames to avoid conflicts
//     },
// });

// const upload = multer({
//     storage,
//     limits: {
//         fileSize: 5 * 1024 * 1024, // 5MB file size limit (adjust as needed)
//     },
// }).array('images'); // This will allow multiple image uploads

// // Create a new property
// exports.createProperty = async (req, res) => {
//     upload(req, res, async (err) => {
//         if (err) {
//             console.error("Multer error:", err); // Log the detailed error
//             return res.status(400).json({ message: 'Error uploading images', error: err });
//         }

//         try {
//             const { 
//                 name, 
//                 size, 
//                 price, 
//                 agent_id, 
//                 type, 
//                 location, 
//                 area, 
//                 number_of_baths, 
//                 number_of_rooms,
//                 address
//             } = req.body;

//             // Check if the admin is authenticated and has the correct role
//             const admin = req.user; // Assuming req.user is populated with the logged-in admin's data
//             if (admin.role !== 'admin') {
//                 return res.status(403).json({ message: 'You are not authorized to create a property' });
//             }

//             // Check if the agent exists (the agent_id should refer to a user with role 'agent')
//             const agent = await User.findByPk(agent_id, { where: { role: 'agent' } });
//             if (!agent) {
//                 return res.status(404).json({ message: 'Agent not found' });
//             }

//             // Create the property with the agent_id and other details
//             const newProperty = await Property.create({
//                 name,
//                 size,
//                 price,
//                 agent_id, // Associate property with the agent
//                 type,
//                 location,
//                 area,
//                 address,
//                 number_of_baths, // New field for number of baths
//                 number_of_rooms, // New field for number of rooms
//                 listed_by: admin.username, // Set listed_by to the admin's username
//             });

//             // Handle image uploads
//             if (req.files && req.files.length > 0) {
//                 const imageUrls = req.files.map(file => ({
//                     property_id: newProperty.id,
//                     image_url: '/tmp/' + file.filename, // Save the image path temporarily in /tmp folder
//                 }));

//                 // Create records for the images
//                 await PropertyImage.bulkCreate(imageUrls);
//             }

//             res.status(201).json(newProperty);
//         } catch (error) {
//             console.error(error);
//             res.status(400).json({ message: 'Error creating property', error });
//         }
//     });
// };

// // Update an existing property
// exports.updateProperty = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const propertyData = req.body;

//         // Ensure listing_updated field is updated on every update
//         propertyData.listing_updated = new Date(); // Set current date for listing_updated

//         // Update the property in the database
//         const [updated] = await Property.update(propertyData, {
//             where: { id }
//         });

//         if (updated) {
//             const updatedProperty = await Property.findOne({ where: { id } });
//             return res.status(200).json(updatedProperty);
//         }

//         throw new Error('Property not found');
//     } catch (error) {
//         res.status(400).json({ message: 'Error updating property', error });
//     }
// };

// // Delete a property
// exports.deleteProperty = async (req, res) => {
//     try {
//         const { id } = req.params;

//         // Delete associated images if any
//         const images = await PropertyImage.findAll({ where: { property_id: id } });
//         images.forEach(image => {
//             const imagePath = path.join(__dirname, '..', image.image_url);
//             if (fs.existsSync(imagePath)) {
//                 fs.unlinkSync(imagePath); // Delete the image file from the server
//             }
//         });

//         // Delete the property from the database
//         const deleted = await Property.destroy({
//             where: { id }
//         });

//         if (deleted) {
//             return res.status(204).send();
//         }

//         throw new Error('Property not found');
//     } catch (error) {
//         res.status(400).json({ message: 'Error deleting property', error });
//     }
// };

// // Get all properties
// exports.getAllProperties = async (req, res) => {
//     try {
//         const properties = await Property.findAll();
//         res.status(200).json(properties);
//     } catch (error) {
//         res.status(500).json({ message: 'Error retrieving properties', error });
//     }
// };

// // Get a property by ID
// exports.getPropertyById = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const property = await Property.findOne({
//             where: { id },
//             include: [{ model: PropertyImage, as: 'images' }] // Include images for the property
//         });

//         if (property) {
//             // Update the 'last_checked' field to current timestamp when the property is viewed
//             await property.update({
//                 last_checked: new Date(),
//             });
            
//             res.status(200).json(property);
//         } else {
//             res.status(404).json({ message: 'Property not found' });
//         }
//     } catch (error) {
//         res.status(500).json({ message: 'Error retrieving property', error });
//     }
// };

// // Filter properties based on query parameters
// exports.getFilteredProperties = async (req, res) => {
//     const { type, location, area, number_of_baths, number_of_rooms } = req.query;

//     // Prepare the filter based on the query parameters
//     const filter = {};
//     if (type) filter.type = type;
//     if (location) filter.location = location;
//     if (area) filter.area = area;
//     if (number_of_baths) filter.number_of_baths = number_of_baths;
//     if (number_of_rooms) filter.number_of_rooms = number_of_rooms;

//     try {
//         // Find properties that match the filter
//         const properties = await Property.findAll({ where: filter });
//         res.status(200).json(properties);
//     } catch (error) {
//         res.status(500).json({ message: 'Error retrieving properties', error });
//     }
// };


// Default Value for all optional fields

// PropertyImage Table Update

const { Property, User, PropertyImage } = require('../models');
const path = require('path');
const fs = require('fs');
const multer = require('multer');


// Multer configuration for handling image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Use Vercel's /tmp directory for storing uploaded files temporarily
        const uploadDir = '/tmp'; // Vercel's /tmp directory
        cb(null, uploadDir); // Save images to /tmp directory
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to filenames to avoid conflicts
    },
});

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB file size limit (adjust as needed)
    },
}).array('images'); // This will allow multiple image uploads

// Create a new property
// exports.createProperty = async (req, res) => {
//     upload(req, res, async (err) => {
//         if (err) {
//             console.error("Multer error:", err); // Log the detailed error
//             return res.status(400).json({ message: 'Error uploading images', error: err });
//         }

//         try {
//             const { 
//                 name, 
//                 size, 
//                 price, 
//                 agent_id, 
//                 type, 
//                 location, 
//                 area, 
//                 number_of_baths, 
//                 number_of_rooms,
//                 address
//             } = req.body;

//             // Check if the admin is authenticated and has the correct role
//             const admin = req.user; // Assuming req.user is populated with the logged-in admin's data
//             if (admin.role !== 'admin') {
//                 return res.status(403).json({ message: 'You are not authorized to create a property' });
//             }

//             // Check if the agent exists (the agent_id should refer to a user with role 'agent')
//             const agent = await User.findByPk(agent_id, { where: { role: 'agent' } });
//             if (!agent) {
//                 return res.status(404).json({ message: 'Agent not found' });
//             }

//             // Create the property data with the required fields, set empty values if missing
//             const newPropertyData = {
//                 name,
//                 size,
//                 price,
//                 agent_id, // Associate property with the agent
//                 type,
//                 location: location || "", // Empty string for missing location
//                 area: area || "", // Empty string for missing area
//                 address: address || "", // Empty string for missing address
//                 number_of_baths: number_of_baths || 0, // Default to 0 if missing
//                 number_of_rooms: number_of_rooms || 0, // Default to 0 if missing
//                 listed_by: req.admin ? req.admin.username : "Unknown",
//                 description: req.body.description || "",  // Empty string for missing description
//                 payment_plan: req.body.payment_plan || "", // Empty string for missing payment_plan
//                 year_built: req.body.year_built || 0, // Default to 0 for missing year_built
//                 amount_per_sqft: req.body.amount_per_sqft || 0, // Default to 0 for missing amount_per_sqft
//                 special_features: req.body.special_features || [], // Empty array for missing special_features
//                 kitchen: req.body.kitchen || "", // Empty string for missing kitchen
//                 heating: req.body.heating || "", // Empty string for missing heating
//                 cooling: req.body.cooling || "", // Empty string for missing cooling
//                 appliances: req.body.appliances || [], // Empty array for missing appliances
//                 features: req.body.features || [], // Empty array for missing features
//                 interior_area: req.body.interior_area || 0, // Default to 0 for missing interior_area
//                 parking: Array.isArray(req.body.parking) ? req.body.parking.join(", ") : req.body.parking || "", // Join array elements into a string
//                 lot: req.body.lot || "", // Empty string for missing lot
//                 type_and_style: req.body.type_and_style || "", // Empty string for missing type_and_style
//                 material: req.body.material || "", // Empty string for missing material
//                 annual_tax_amount: req.body.annual_tax_amount || 0, // Default to 0 for missing annual_tax_amount
//                 // date_on_market: req.body.date_on_market || "", // Empty string for missing date_on_market
//                 ownership: Array.isArray(req.body.ownership) ? req.body.ownership.join(", ") : req.body.ownership || "",
//             };

//             // Create the property record
//             const newProperty = await Property.create(newPropertyData);

//             // Handle image uploads
//             if (req.files && req.files.length > 0) {
//                 const imageUrls = req.files.map(file => ({
//                     property_id: newProperty.id,
//                     image_url: '/tmp/' + file.filename, // Save the image path temporarily in /tmp folder
//                 }));

//                 // Create records for the images
//                 await PropertyImage.bulkCreate(imageUrls);
//             }

//             res.status(201).json(newProperty);
//         } catch (error) {
//             console.error(error);
//             res.status(400).json({ message: 'Error creating property', error });
//         }
//     });
// };

//Create a new property 20/12

// Create a new property
// Create a new property
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
                lot
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
                listed_by: req.admin ? req.admin.username : "Unknown",
                description: description || "",  // Empty string for missing description
                payment_plan: payment_plan || "", // Empty string for missing payment_plan
                year_built: year_built || 0, // Default to 0 for missing year_built
                amount_per_sqft: amount_per_sqft || 0, // Default to 0 for missing amount_per_sqft
                appliances: appliances || [], // Empty array for missing appliances
                features: features || [], // Empty array for missing features
                interior_area: interior_area || 0, // Default to 0 for missing interior_area
                parking: parking || "", // Empty string for missing parking
                material: material || "", // Empty string for missing material
                annual_tax_amount: annual_tax_amount || 0, // Default to 0 for missing annual_tax_amount
                date_on_market: validDateOnMarket, // Ensure valid date
                ownership: ownership || "", // Empty string for missing ownership
            };

            // Conditionally handle optional fields (convert string input to array if provided)
            const splitToArray = (field) => {
                // Only split if the field is a string
                if (typeof field === 'string') {
                    return field.split(",").map(item => item.trim());
                }
                // Return an empty array if not a string
                return [];
            };

            if (kitchen) {
                newPropertyData.kitchen = splitToArray(kitchen);
            }
            if (heating) {
                newPropertyData.heating = splitToArray(heating);
            }
            if (cooling) {
                newPropertyData.cooling = splitToArray(cooling);
            }
            if (type_and_style) {
                newPropertyData.type_and_style = splitToArray(type_and_style);
            }
            if (lot) {
                newPropertyData.lot = splitToArray(lot);
            }
            if (special_features) {
                newProperty.special_features = splitToArray(special_features);
            }

            // Create the property record
            const newProperty = await Property.create(newPropertyData);

            // Handle image uploads
            if (req.files && req.files.length > 0) {
                const imageUrls = req.files.map(file => ({
                    property_id: newProperty.id,
                    image_url: '/tmp/' + file.filename, // Save the image path temporarily in /tmp folder
                }));

                // Create records for the images
                await PropertyImage.bulkCreate(imageUrls);
            }

            // Filter out fields with empty or null values
            const filteredProperty = {};

            Object.keys(newPropertyData).forEach(key => {
                if (newPropertyData[key] && newPropertyData[key] !== "" && newPropertyData[key] !== 0 && newPropertyData[key].length !== 0) {
                    filteredProperty[key] = newPropertyData[key];
                }
            });

            // Return the filtered property in the response
            res.status(201).json(filteredProperty);
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

// Filter properties based on query parameters
// exports.getFilteredProperties = async (req, res) => {
//     const { type, location, area, number_of_baths, number_of_rooms } = req.query;

//     // Prepare the filter based on the query parameters
//     const filter = {};
//     if (type) filter.type = type;
//     if (location) filter.location = location;
//     if (area) filter.area = area;
//     if (number_of_baths) filter.number_of_baths = number_of_baths;
//     if (number_of_rooms) filter.number_of_rooms = number_of_rooms;

//     try {
//         // Find properties that match the filter
//         const properties = await Property.findAll({ where: filter });
//         res.status(200).json(properties);
//     } catch (error) {
//         res.status(500).json({ message: 'Error retrieving properties', error });
//     }
// };


//Filter Correction

exports.getFilteredProperties = async (req, res) => {
    const { type, location, area, number_of_baths, number_of_rooms } = req.query;

    // Prepare the filter based on the query parameters
    const filter = {};

    if (type) filter.type = type;
    if (location) filter.location = location;
    if (area) filter.area = area;
    if (number_of_baths) filter.number_of_baths = number_of_baths;
    if (number_of_rooms) filter.number_of_rooms = number_of_rooms;

    try {
        // Find properties that match the filter
        const properties = await Property.findAll({ where: filter });

        // Send the response back with the filtered properties
        res.status(200).json(properties);
    } catch (error) {
        // Log and return the error message
        console.error(error);
        res.status(500).json({
            message: 'Error retrieving properties',
            error: error.message
        });
    }
};
