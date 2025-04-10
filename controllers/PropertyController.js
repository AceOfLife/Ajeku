// PropertyImage Table Update

const { Property, User, PropertyImage } = require('../models');
const path = require('path');
const fs = require('fs');
const cloudinary = require('../config/cloudinaryConfig');
const { upload, uploadImagesToCloudinary, uploadDocumentsToCloudinary } = require('../config/multerConfig');


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

// const splitToArray = (field) => {
//     if (Array.isArray(field)) {
//         return field;
//     }
//     if (typeof field === 'string') {
//         return field.split(',').map(item => item.trim()).filter(Boolean);
//     }
//     return []; // fallback for null, undefined, numbers, etc.
// };

const splitToArray = (field) => {
    try {
        if (Array.isArray(field)) {
            return field.map(item => item.toString().trim());
        }

        if (typeof field === 'string') {
            // Check if it's a stringified array like '["Concrete","Wood"]'
            try {
                const parsed = JSON.parse(field);
                if (Array.isArray(parsed)) {
                    return parsed.map(item => item.toString().trim());
                }
            } catch (e) {
                // Not JSON, fallback to comma split
            }

            return field
                .split(',')
                .map(item => item.trim())
                .filter(Boolean);
        }

        if (typeof field === 'object' && field !== null) {
            return Object.values(field).map(item => item.toString().trim());
        }
    } catch (error) {
        console.error('Error parsing array field:', field, error);
    }
    return [];
};





// PayStack Payment Gateway

const axios = require("axios");

// February 24th 2025

// exports.createProperty = async (req, res) => {
//     upload(req, res, async (err) => {
//         if (err) {
//             console.error("Multer error:", err);
//             return res.status(400).json({ message: 'Error uploading images', error: err });
//         }

//         console.log("=== Raw req.body ===");
//         console.dir(req.body, { depth: null });

//         try {
//             const { 
//                 name, size, price, agent_id, type, location, area, 
//                 number_of_baths, number_of_rooms, address, description, 
//                 payment_plan, year_built, special_features, appliances, features, 
//                 interior_area, parking, material, annual_tax_amount, date_on_market, 
//                 ownership, kitchen, heating, cooling, type_and_style, lot, 
//                 percentage, duration, is_fractional, fractional_slots, isRental 
//             } = req.body;


//             // Ensure correct data parsing
//             const newPropertyData = {
//                 name,
//                 size: parseInt(size, 10) || 0,
//                 price: parseFloat(price) || 0,
//                 agent_id: parseInt(agent_id, 10) || null,
//                 type,
//                 location: location || "",
//                 area: area || "",
//                 address: address || "",
//                 number_of_baths: parseInt(number_of_baths, 10) || 0,
//                 number_of_rooms: parseInt(number_of_rooms, 10) || 0,
//                 listed_by: "Admin",
//                 description: description || "",
//                 payment_plan: payment_plan || "",
//                 year_built: parseInt(year_built, 10) || 0,
//                 special_features: splitToArray(special_features), // FIXED: Use `splitToArray`
//                 appliances: splitToArray(appliances), // FIXED: Use `splitToArray`
//                 features: splitToArray(features), // FIXED: Use `splitToArray`
//                 interior_area: interior_area ? interior_area.toString() : null,
//                 // material: material || "",
//                 material: splitToArray(material), // Convert string to array
//                 date_on_market: date_on_market ? new Date(date_on_market).toISOString() : new Date().toISOString(),
//                 ownership: ownership || "",
//                 percentage: percentage || "",
//                 duration: duration || "",
//                 is_fractional: is_fractional === "true",
//                 fractional_slots: is_fractional ? parseInt(fractional_slots, 10) || 0 : null,
//                 price_per_slot: is_fractional ? (price / (parseInt(fractional_slots, 10) || 1)) : null,
//                 isRental: isRental === "true",
//                 kitchen: splitToArray(kitchen),
//                 heating: splitToArray(heating),
//                 cooling: splitToArray(cooling),
//                 type_and_style: splitToArray(type_and_style),
//                 lot: splitToArray(lot),
//                 parking: splitToArray(parking) // FIXED: Use `splitToArray`
//             };


//             [
                
//                 'material', 'parking', 'lot', 'type_and_style', 'special_features', 'interior_area'
//               ].forEach(field => {
//                 console.log(`${field}:`, newPropertyData[field], 'Type:', typeof newPropertyData[field]);
//               });

//             // Create the property record
//             const newProperty = await Property.create(newPropertyData);

//             // Upload Images to Cloudinary
//             let imageUrls = [];
//             if (req.files && req.files.length > 0) {
//                 imageUrls = await uploadImagesToCloudinary(req.files);

//                  // Ensure imageUrls is an array
//                 if (!Array.isArray(imageUrls)) {
//                     imageUrls = [imageUrls];
//                 }

//                 const imageRecords = imageUrls.map(url => ({
//                     property_id: newProperty.id,
//                     image_url: url,
//                 }));

//                 await PropertyImage.bulkCreate(imageRecords);
//             }

//             // Retrieve uploaded images from the database
//             const savedImages = await PropertyImage.findAll({
//                 where: { property_id: newProperty.id },
//                 attributes: ['image_url'],
//             });

//             const imageUrlsFromDb = savedImages.map(img => img.image_url);

//             // Send response
//             res.status(201).json({
//                 property: newProperty,
//                 images: imageUrlsFromDb || [],
//                 documentUrl: null
//             });

//         } catch (error) {
//             console.error("Error creating property:", error);
//             res.status(500).json({ message: 'Error creating property', error });
//         }
//     });
// };



// 10/04/2025

exports.createProperty = async (req, res) => {
    upload(req, res, async (err) => {
      if (err) {
        console.error("Multer error:", err);
        return res.status(400).json({ message: 'Error uploading images', error: err });
      }
  
      console.log("=== Raw req.body ===");
      console.dir(req.body, { depth: null });
  
      try {
        const {
          name, size, price, agent_id, type, location, area,
          number_of_baths, number_of_rooms, address, description,
          payment_plan, year_built, special_features, appliances, features,
          interior_area, parking, material, annual_tax_amount, date_on_market,
          ownership, kitchen, heating, cooling, type_and_style, lot,
          percentage, duration, is_fractional, fractional_slots, isRental
        } = req.body;
  
        // Ensure correct data parsing
        const newPropertyData = {
          name,
          size: parseInt(size, 10) || 0,
          price: parseFloat(price) || 0,
          agent_id: parseInt(agent_id, 10) || null,
          type,
          location: location || "",
          area: area || "",
          address: address || "",
          number_of_baths: parseInt(number_of_baths, 10) || 0,
          number_of_rooms: parseInt(number_of_rooms, 10) || 0,
          listed_by: "Admin",
          description: description || "",
          payment_plan: payment_plan || "",
          year_built: parseInt(year_built, 10) || 0,
          special_features: splitToArray(special_features),
          appliances: splitToArray(appliances),
          features: splitToArray(features),
          interior_area: interior_area ? interior_area.toString() : null,
          material: splitToArray(material),
          date_on_market: date_on_market ? new Date(date_on_market).toISOString() : new Date().toISOString(),
          ownership: ownership || "",
          percentage: percentage || "",
          duration: duration || "",
          is_fractional: is_fractional === "true",
          fractional_slots: is_fractional ? parseInt(fractional_slots, 10) || 0 : null,
          price_per_slot: is_fractional ? (price / (parseInt(fractional_slots, 10) || 1)) : null,
          isRental: isRental === "true",
          kitchen: splitToArray(kitchen),
          heating: splitToArray(heating),
          cooling: splitToArray(cooling),
          type_and_style: splitToArray(type_and_style),
          lot: splitToArray(lot),
          parking: splitToArray(parking)
        };
  
        // Debug array fields
        [
          'material', 'parking', 'lot', 'type_and_style', 'special_features', 'interior_area'
        ].forEach(field => {
          console.log(`${field}:`, newPropertyData[field], 'Type:', typeof newPropertyData[field]);
        });
  
        // Create the property record
        const newProperty = await Property.create(newPropertyData);
  
        // Upload Images to Cloudinary
        let imageUrls = [];
        if (req.files && req.files.length > 0) {
          imageUrls = await uploadImagesToCloudinary(req.files);
  
          // Ensure imageUrls is an array
          if (!Array.isArray(imageUrls)) {
            imageUrls = [imageUrls];
          }
  
          // Save all image URLs as one array in a single row
          await PropertyImage.create({
            property_id: newProperty.id,
            image_url: imageUrls
          });
        }
  
        // Retrieve saved image record (if needed)
        const savedImageRecord = await PropertyImage.findOne({
          where: { property_id: newProperty.id },
          attributes: ['image_url']
        });
  
        // Send response
        res.status(201).json({
          property: newProperty,
          images: savedImageRecord?.image_url || [],
          documentUrl: null
        });
  
      } catch (error) {
        console.error("Error creating property:", error);
        res.status(500).json({ message: 'Error creating property', error });
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