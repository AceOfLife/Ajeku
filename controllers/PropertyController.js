// PropertyImage Table Update

const { Property, User, PropertyImage } = require('../models');
const path = require('path');
const fs = require('fs');
const cloudinary = require('../config/cloudinaryConfig');
// const { upload, uploadImagesToCloudinary } = require('../config/multerConfig');
const { upload, uploadImagesToCloudinary, uploadDocuments, uploadDocumentsToCloudinary } = require('../config/multerConfig'); 


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


// Document upload 30/12/2024

const uploadDocumentToCloudinary = async (fileBuffer, fileName) => {
    try {
        const result = await cloudinary.uploader.upload_stream(
            { 
                resource_type: 'raw',  // For raw document types (non-image files)
                folder: 'property_documents',  // Set a folder for the documents
                public_id: fileName.replace(/\.[^/.]+$/, "")  // Generate a unique ID for each document
            },
            (error, result) => {
                if (error) {
                    throw new Error('Error uploading document to Cloudinary');
                }
                return result.secure_url;  // Return the URL after the upload is successful
            }
        );
        
        const stream = cloudinary.uploader.upload_stream(
            { folder: 'property_documents' },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result.secure_url); // Resolve with the secure URL
                }
            }
        );
        
        stream.end(fileBuffer); // Upload the document buffer
    } catch (error) {
        console.error('Error uploading document:', error);
        throw new Error('Document upload failed');
    }
};

// Image upload

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
//                 address,
//                 description,
//                 payment_plan,
//                 year_built,
//                 amount_per_sqft,
//                 special_features,
//                 appliances,
//                 features,
//                 interior_area,
//                 parking,
//                 material,
//                 annual_tax_amount,
//                 date_on_market,
//                 ownership,
//                 kitchen,
//                 heating,
//                 cooling,
//                 type_and_style,
//                 lot,
//                 percentage,
//                 duration
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

//             // Handle date_on_market - if it's empty or invalid, set to current date or null
//             const validDateOnMarket = date_on_market && date_on_market.trim() !== "" ? date_on_market : new Date().toISOString();

//             // Prepare the property data with the required fields, set empty values if missing
//             const newPropertyData = {
//                 name,
//                 size,
//                 price,
//                 agent_id, // Associate property with the agent
//                 type,
//                 location: location || "", // Empty string for missing location
//                 area: area || "", // Empty string for missing area
//                 address: address || "", // Empty string for missing address
//                 number_of_baths: number_of_baths || "0", // Default to 0 if missing
//                 number_of_rooms: number_of_rooms || "0", // Default to 0 if missing
//                 listed_by: req.admin ? req.admin.username : "Admin",
//                 description: description || "",  // Empty string for missing description
//                 payment_plan: payment_plan || "", // Empty string for missing payment_plan
//                 year_built: year_built || 0, // Default to 0 for missing year_built
//                 amount_per_sqft: amount_per_sqft || "0", // Default to 0 for missing amount_per_sqft
//                 special_features: special_features || [], // Empty array for missing special_features
//                 appliances: appliances || [], // Empty array for missing appliances
//                 features: features || [], // Empty array for missing features
//                 interior_area: interior_area || 0, // Default to 0 for missing interior_area
//                 material: material || "", // Empty string for missing material
//                 annual_tax_amount: annual_tax_amount || 0, // Default to 0 for missing annual_tax_amount
//                 date_on_market: validDateOnMarket, // Ensure valid date
//                 ownership: ownership || "", // Empty string for missing ownership
//                 percentage: percentage || "", // Empty string for missing ownership
//                 duration: duration || "", // Empty string for missing ownership
//             };

//             // Conditionally handle optional fields (convert string input to array if provided)
//             if (kitchen) newPropertyData.kitchen = splitToArray(kitchen);
//             if (heating) newPropertyData.heating = splitToArray(heating);
//             if (cooling) newPropertyData.cooling = splitToArray(cooling);
//             if (type_and_style) newPropertyData.type_and_style = splitToArray(type_and_style);
//             if (lot) newPropertyData.lot = splitToArray(lot);
//             if (special_features) newPropertyData.special_features = splitToArray(special_features);
//             if (parking) newPropertyData.parking = splitToArray(parking);
//             if (appliances) newPropertyData.appliances = splitToArray(appliances);
//             if (features) newPropertyData.features = splitToArray(features);

//             // Create the property record
//             const newProperty = await Property.create(newPropertyData);

//             // Handle image uploads to Cloudinary
//             let imageUrls = [];
//             if (req.files && req.files.length > 0) {
//                 imageUrls = await uploadImagesToCloudinary(req.files);

//                 const imageRecords = imageUrls.map(url => ({
//                     property_id: newProperty.id,
//                     image_url: [url],
//                 }));

//                 await PropertyImage.bulkCreate(imageRecords);
//             }

//               // Handle document upload to Cloudinary
//               let documentUrl = null;
//               if (req.file) {
//                   documentUrl = await uploadDocumentToCloudinary(req.file.buffer, req.file.originalname);
//               }

//             // Filter out fields with empty or null values
//             const filteredProperty = {};

//             Object.keys(newPropertyData).forEach(key => {
//                 if (newPropertyData[key] && newPropertyData[key] !== "" && newPropertyData[key] !== 0 && newPropertyData[key].length !== 0) {
//                     filteredProperty[key] = newPropertyData[key];
//                 }
//             });

//             // Return the filtered property in the response
//             res.status(201).json({
//                 property: filteredProperty,
//                 images: imageUrls || [],
//                 documentUrl: documentUrl || null,
//             });
//         } catch (error) {
//             console.error(error);
//             res.status(400).json({ message: 'Error creating property', error });
//         }
//     });
// };


// 30/12/24

exports.createProperty = async (req, res) => {
    // First, handle image upload using multer (using 'upload' for images)
    upload(req, res, async (err) => {
        if (err) {
            console.error("Multer error (images):", err); // Log detailed error for debugging
            return res.status(400).json({ message: 'Error uploading images', error: err });
        }

        // Now, handle the document upload using multer (using 'uploadDocuments' for documents)
        uploadDocuments(req, res, async (err) => {
            if (err) {
                console.error("Multer error (documents):", err); // Log detailed error for debugging
                return res.status(400).json({ message: 'Error uploading documents', error: err });
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

                // Ensure the admin is authenticated
                const admin = req.user; // Assuming req.user contains logged-in admin data
                if (admin.role !== 'admin') {
                    return res.status(403).json({ message: 'You are not authorized to create a property' });
                }

                // Ensure the agent exists and is valid
                const agent = await User.findByPk(agent_id, { where: { role: 'agent' } });
                if (!agent) {
                    return res.status(404).json({ message: 'Agent not found' });
                }

                // Handle date on market (set to current date if empty or invalid)
                const validDateOnMarket = date_on_market && date_on_market.trim() !== "" ? date_on_market : new Date().toISOString();

                // Prepare the property data
                const newPropertyData = {
                    name,
                    size,
                    price,
                    agent_id, // Associate property with the agent
                    type,
                    location: location || "",
                    area: area || "",
                    address: address || "",
                    number_of_baths: number_of_baths || "0",
                    number_of_rooms: number_of_rooms || "0",
                    listed_by: req.admin ? req.admin.username : "Admin",
                    description: description || "",
                    payment_plan: payment_plan || "",
                    year_built: year_built || 0,
                    amount_per_sqft: amount_per_sqft || "0",
                    special_features: special_features || [],
                    appliances: appliances || [],
                    features: features || [],
                    interior_area: interior_area || 0,
                    material: material || "",
                    annual_tax_amount: annual_tax_amount || 0,
                    date_on_market: validDateOnMarket,
                    ownership: ownership || "",
                    percentage: percentage || "",
                    duration: duration || "",
                };

                // Handle optional fields (convert string input to array if provided)
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

                // Handle image uploads to Cloudinary (if any)
                let imageUrls = [];
                if (req.files && req.files.length > 0) {
                    imageUrls = await uploadImagesToCloudinary(req.files); // Upload images to Cloudinary

                    const imageRecords = imageUrls.map(url => ({
                        property_id: newProperty.id,
                        image_url: [url],
                    }));

                    await PropertyImage.bulkCreate(imageRecords); // Store image records in database
                }

                // Handle document uploads to Cloudinary (if any)
                let documentUrls = [];
                if (req.files && req.files.length > 0) {
                    documentUrls = await uploadDocumentsToCloudinary(req.files); // Upload documents to Cloudinary
                }

                // Filter out fields with empty or null values
                const filteredProperty = {};
                Object.keys(newPropertyData).forEach(key => {
                    if (newPropertyData[key] && newPropertyData[key] !== "" && newPropertyData[key] !== 0 && newPropertyData[key].length !== 0) {
                        filteredProperty[key] = newPropertyData[key];
                    }
                });

                // Return the newly created property and related URLs in the response
                res.status(201).json({
                    property: filteredProperty,
                    images: imageUrls || [],
                    documents: documentUrls || [], // Include document URLs if available
                });
            } catch (error) {
                console.error(error);
                res.status(400).json({ message: 'Error creating property', error });
            }
        });
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
//             // return res.status(204).send();
//             // Send a success message
//             return res.status(200).json({
//                 message: `Property with ID ${id} has been successfully deleted.`
//             });
//         }

//         throw new Error('Property not found');
//     } catch (error) {
//         res.status(400).json({ message: 'Error deleting property', error });
//     }
// };

exports.deleteProperty = async (req, res) => {
    try {
        let id = req.params.id;

        // Validate that id is present and is a number
        if (!id || isNaN(id)) {
            return res.status(400).json({ message: 'Invalid property ID' });
        }

        id = parseInt(id, 10); // Ensure id is an integer

        // Delete associated images if any
        const images = await PropertyImage.findAll({ where: { property_id: id } });
        images.forEach(image => {
            if (image.image_url) {
                // Check if image_url is an array for multiple images per record
                const image_urls = Array.isArray(image.image_url) ? image.image_url : [image.image_url];

                image_urls.forEach(image_url => {
                    if (typeof image_url === 'string') { // Ensure it's a string
                        const imagePath = path.resolve(__dirname, '..', image_url);
                        if (fs.existsSync(imagePath)) {
                            fs.unlinkSync(imagePath); // Delete the image file from the server
                        }
                    } else {
                        console.warn(`Unexpected image_url type for PropertyImage ID ${image.id}:`, typeof image_url);
                    }
                });
            }
        });

        // Delete the property from the database
        const deleted = await Property.destroy({
            where: { id }
        });

        if (deleted) {
            return res.status(200).json({
                message: `Property with ID ${id} has been successfully deleted.`
            });
        }

        throw new Error('Property not found');
    } catch (error) {
        console.error('Detailed Error:', error); // Log the full error for debugging
        res.status(400).json({ message: 'Error deleting property', error: error.message });
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
    const { name, number_of_baths, number_of_rooms, type } = req.query;

    // Log query parameters
    console.log("Query received:", req.query);

    // Validate the name parameter
    if (!name && !number_of_baths && !number_of_rooms && !type) {
        console.log("At least one filter parameter is required.");
        return res.status(400).json({ message: "At least one filter parameter is required" });
    }

    try {
        // Prepare the filter for the WHERE clause
        const filter = {};

        if (name && name.trim() !== "") {
            filter.name = {
                [Op.iLike]: `%${name.trim()}%`, // Case-insensitive partial match
            };
        }

        if (number_of_baths) {
            // Assuming number_of_baths is a string like "2,3,4" for 2 or 3 or 4 bathrooms
            const bathsArray = number_of_baths.split(',').map(num => parseInt(num.trim(), 10));
            filter.number_of_baths = {
                [Op.in]: bathsArray
            };
        }

        if (number_of_rooms) {
            // Similar handling for number_of_rooms
            const roomsArray = number_of_rooms.split(',').map(num => parseInt(num.trim(), 10));
            filter.number_of_rooms = {
                [Op.in]: roomsArray
            };
        }

        if (type) {
            // Assuming type is a string like "Residential,Commercial" for Residential or Commercial
            // const typesArray = type.split(',').map(str => str.trim());
            // filter.type = {
            //     [Op.in]: typesArray
            // };
            const typesArray = type.split(',').map(str => {
                const trimmed = str.trim();
                return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
            });

            filter.type = {
                [Op.in]: typesArray
            };
        }

        // Log the SQL query before execution
        try {
            const sqlQuery = await Property.sequelize.queryInterface.queryGenerator.selectQuery('Property', {
                where: filter,
                include: [{ model: PropertyImage, as: 'images' }]
            });
            console.log("SQL Query being executed:", sqlQuery.sql);
        } catch (queryGenerationError) {
            console.error("Error generating SQL query:", queryGenerationError);
        }

        // Execute the query with the WHERE clause
        const properties = await Property.findAll({
            where: filter, 
            include: [{ model: PropertyImage, as: 'images' }], // Include associated images with alias
        });

        // Log the result of the query
        console.log("Query result:", properties);

        // Return a 404 if no properties are found
        if (properties.length === 0) {
            return res.status(404).json({ message: 'No properties found' });
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