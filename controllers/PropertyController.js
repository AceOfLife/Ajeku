// PropertyImage Table Update

// const { Property, User, PropertyImage } = require('../models');
const { Property, User, PropertyImage, FractionalOwnership, InstallmentOwnership } = require('../models');
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


// May 23 2025 Update - Using till May 31 2025
// exports.createProperty = async (req, res) => {
//     upload(req, res, async (err) => {
//       if (err) {
//         console.error("Multer error:", err);
//         return res.status(400).json({ message: "Error uploading images", error: err });
//       }
  
//       console.log("=== Raw req.body ===");
//       console.dir(req.body, { depth: null });
//       console.log("Raw isInstallment:", req.body.isInstallment, typeof req.body.isInstallment);
//       console.log("Raw duration:", req.body.duration, typeof req.body.duration);
  
//       try {
//         const {
//           name, size, price, agent_id, type, location, area,
//           number_of_baths, number_of_rooms, address, description,
//           payment_plan, year_built, special_features, appliances, features,
//           interior_area, parking, material, date_on_market,
//           ownership, kitchen, heating, cooling, type_and_style, lot,
//           percentage, duration, is_fractional, fractional_slots, isRental,
//           isInstallment
//         } = req.body;
  
//         // Typecasting
//         const parsedFractional = ["true", "1", true].includes(is_fractional);
//         const parsedFractionalSlots = parsedFractional ? parseInt(fractional_slots, 10) || 0 : null;
//         const parsedPrice = parseFloat(price) || 0;
//         const parsedIsInstallment = ["true", "1", true].includes(isInstallment);
//         const parsedDuration = duration != null ? parseInt(duration, 10) : null;
  
//         // Validation
//         if (isInstallment === undefined) {
//           return res.status(400).json({ message: "isInstallment is required" });
//         }
//         if (parsedIsInstallment && (parsedDuration == null || isNaN(parsedDuration) || parsedDuration <= 0)) {
//           return res.status(400).json({ message: "Duration must be a positive integer when isInstallment is true" });
//         }
  
//         console.log("Parsed isInstallment:", parsedIsInstallment);
//         console.log("Parsed duration:", parsedDuration);
  
//         const newPropertyData = {
//           name,
//           size: parseInt(size, 10) || 0,
//           price: parsedPrice,
//           agent_id: parseInt(agent_id, 10) || null,
//           type,
//           location: location || "",
//           area: area || "",
//           address: address || "",
//           number_of_baths: parseInt(number_of_baths, 10) || 0,
//           number_of_rooms: parseInt(number_of_rooms, 10) || 0,
//           listed_by: "Admin",
//           description: description || "",
//           payment_plan: payment_plan || "",
//           year_built: parseInt(year_built, 10) || 0,
//           special_features: splitToArray(special_features),
//           appliances: splitToArray(appliances),
//           features: splitToArray(features),
//           interior_area: interior_area ? interior_area.toString() : null,
//           material: splitToArray(material),
//           date_on_market: date_on_market ? new Date(date_on_market).toISOString() : new Date().toISOString(),
//           ownership: ownership || "",
//           percentage: percentage || "",
//           duration: parsedDuration,
//           isInstallment: parsedIsInstallment,
//           is_fractional: parsedFractional,
//           fractional_slots: parsedFractionalSlots,
//           price_per_slot: parsedFractional ? (parsedPrice / (parsedFractionalSlots || 1)) : null,
//           available_slots: parsedFractional ? parsedFractionalSlots : null,
//           isRental: ["true", "1", true].includes(isRental),
//           kitchen: splitToArray(kitchen),
//           heating: splitToArray(heating),
//           cooling: splitToArray(cooling),
//           type_and_style: splitToArray(type_and_style),
//           lot: splitToArray(lot),
//           parking: splitToArray(parking)
//         };
  
//         // Debug array fields
//         [
//           "material",
//           "parking",
//           "lot",
//           "type_and_style",
//           "special_features",
//           "interior_area"
//         ].forEach((field) => {
//           console.log(`${field}:`, newPropertyData[field], "Type:", typeof newPropertyData[field]);
//         });
  
//         // Create the property record
//         const newProperty = await Property.create(newPropertyData);
  
//         // Immediately reload the property from DB to get all updated fields
//         const property = await Property.findByPk(newProperty.id);
  
//         // Upload Images to Cloudinary
//         let imageUrls = [];
//         if (req.files && req.files.length > 0) {
//           imageUrls = await uploadImagesToCloudinary(req.files);
  
//           if (!Array.isArray(imageUrls)) {
//             imageUrls = [imageUrls];
//           }
  
//           await PropertyImage.create({
//             property,
//             property_id: newProperty.id,
//             image_url: imageUrls
//           });
//         }
  
//         const savedImageRecord = await PropertyImage.findOne({
//           where: { property_id: newProperty.id },
//           attributes: ["image_url"]
//         });
  
//         res.status(201).json({
//           property: newProperty,
//           images: savedImageRecord?.image_url || [],
//           documentUrl: null
//         });
//       } catch (error) {
//         console.error("Error creating property:", error);
//         res.status(500).json({ message: "Error creating property", error });
//       }
//     });
//   };

// NTest for isFractionalInstallment

// exports.createProperty = async (req, res) => {
//   upload(req, res, async (err) => {
//     if (err) {
//       console.error("Multer error:", err);
//       return res.status(400).json({ message: "Error uploading images", error: err });
//     }

//     console.log("=== Raw req.body ===");
//     console.dir(req.body, { depth: null });

//     try {
//       const {
//         name, size, price, agent_id, type, location, area,
//         number_of_baths, number_of_rooms, address, description,
//         payment_plan, year_built, special_features, appliances, features,
//         interior_area, parking, material, date_on_market,
//         ownership, kitchen, heating, cooling, type_and_style, lot,
//         percentage, duration, is_fractional, fractional_slots,
//         isRental, isInstallment, isFractionalInstallment
//       } = req.body;

//       // === Typecasting and validation ===
//       const parsedFractional = ["true", "1", true].includes(is_fractional);
//       const parsedFractionalSlots = parsedFractional ? parseInt(fractional_slots, 10) || 0 : null;
//       const parsedPrice = parseFloat(price) || 0;
//       const parsedIsInstallment = ["true", "1", true].includes(isInstallment);
//       const parsedDuration = duration != null ? parseInt(duration, 10) : null;
//       const parsedIsFractionalInstallment = parsedFractional
//         ? ["true", "1", true].includes(isFractionalInstallment)
//         : false; // only meaningful if property is fractional

//       // === Validation ===
//       if (!parsedFractional && isInstallment === undefined) {
//         return res.status(400).json({ message: "isInstallment is required for non-fractional properties" });
//       }
//       if (!parsedFractional && parsedIsInstallment && (parsedDuration == null || isNaN(parsedDuration) || parsedDuration <= 0)) {
//         return res.status(400).json({ message: "Duration must be a positive integer when isInstallment is true" });
//       }

//       const newPropertyData = {
//         name,
//         size: parseInt(size, 10) || 0,
//         price: parsedPrice,
//         agent_id: parseInt(agent_id, 10) || null,
//         type,
//         location: location || "",
//         area: area || "",
//         address: address || "",
//         number_of_baths: parseInt(number_of_baths, 10) || 0,
//         number_of_rooms: parseInt(number_of_rooms, 10) || 0,
//         listed_by: "Admin",
//         description: description || "",
//         payment_plan: payment_plan || "",
//         year_built: parseInt(year_built, 10) || 0,
//         special_features: splitToArray(special_features),
//         appliances: splitToArray(appliances),
//         features: splitToArray(features),
//         interior_area: interior_area ? interior_area.toString() : null,
//         material: splitToArray(material),
//         date_on_market: date_on_market ? new Date(date_on_market).toISOString() : new Date().toISOString(),
//         ownership: ownership || "",
//         percentage: percentage || "",
//         duration: parsedFractional ? null : parsedDuration, // duration only relevant for non-fractional
//         isInstallment: parsedFractional ? false : parsedIsInstallment,
//         is_fractional: parsedFractional,
//         fractional_slots: parsedFractionalSlots,
//         price_per_slot: parsedFractional ? (parsedPrice / (parsedFractionalSlots || 1)) : null,
//         available_slots: parsedFractional ? parsedFractionalSlots : null,
//         isRental: ["true", "1", true].includes(isRental),
//         isFractionalInstallment: parsedIsFractionalInstallment,
//         kitchen: splitToArray(kitchen),
//         heating: splitToArray(heating),
//         cooling: splitToArray(cooling),
//         type_and_style: splitToArray(type_and_style),
//         lot: splitToArray(lot),
//         parking: splitToArray(parking)
//       };

//       const newProperty = await Property.create(newPropertyData);

//       const property = await Property.findByPk(newProperty.id);

//       let imageUrls = [];
//       if (req.files && req.files.length > 0) {
//         imageUrls = await uploadImagesToCloudinary(req.files);

//         if (!Array.isArray(imageUrls)) {
//           imageUrls = [imageUrls];
//         }

//         await PropertyImage.create({
//           property,
//           property_id: newProperty.id,
//           image_url: imageUrls
//         });
//       }

//       const savedImageRecord = await PropertyImage.findOne({
//         where: { property_id: newProperty.id },
//         attributes: ["image_url"]
//       });

//       res.status(201).json({
//         property: newProperty,
//         images: savedImageRecord?.image_url || [],
//         documentUrl: null
//       });
//     } catch (error) {
//       console.error("Error creating property:", error);
//       res.status(500).json({ message: "Error creating property", error });
//     }
//   });
// };

// New CreateProperty for isFractionalDuration:

exports.createProperty = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error("Multer error:", err);
      return res.status(400).json({ message: "Error uploading images", error: err });
    }

    try {
      const {
        name, size, price, agent_id, type, location, area,
        number_of_baths, number_of_rooms, address, description,
        payment_plan, year_built, special_features, appliances, features,
        interior_area, parking, material, date_on_market,
        ownership, kitchen, heating, cooling, type_and_style, lot,
        percentage, duration, is_fractional, fractional_slots,
        isRental, isInstallment, isFractionalInstallment, isFractionalDuration
      } = req.body;

      // === Typecasting and validation ===
      const parsedFractional = ["true", "1", true].includes(is_fractional);
      const parsedFractionalSlots = parsedFractional ? parseInt(fractional_slots, 10) || 0 : null;
      const parsedPrice = parseFloat(price) || 0;
      const parsedIsInstallment = ["true", "1", true].includes(isInstallment);
      const parsedDuration = duration != null ? parseInt(duration, 10) : null;
      const parsedIsFractionalInstallment = parsedFractional
        ? ["true", "1", true].includes(isFractionalInstallment)
        : false;
      const parsedIsFractionalDuration = parsedIsFractionalInstallment
        ? parseInt(isFractionalDuration, 10)
        : null;

      // === Validation ===
      if (!parsedFractional && isInstallment === undefined) {
        return res.status(400).json({ message: "isInstallment is required for non-fractional properties" });
      }

      if (!parsedFractional && parsedIsInstallment && (parsedDuration == null || isNaN(parsedDuration) || parsedDuration <= 0)) {
        return res.status(400).json({ message: "Duration must be a positive integer when isInstallment is true" });
      }

      if (parsedFractional && parsedIsFractionalInstallment) {
        if (!parsedIsFractionalDuration || isNaN(parsedIsFractionalDuration) || parsedIsFractionalDuration <= 0) {
          return res.status(400).json({ message: "isFractionalDuration must be a positive integer when isFractionalInstallment is true" });
        }
      }

      const newPropertyData = {
        name,
        size: parseInt(size, 10) || 0,
        price: parsedPrice,
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
        duration: parsedFractional ? null : parsedDuration,
        isInstallment: parsedFractional ? false : parsedIsInstallment,
        is_fractional: parsedFractional,
        fractional_slots: parsedFractionalSlots,
        price_per_slot: parsedFractional ? (parsedPrice / (parsedFractionalSlots || 1)) : null,
        available_slots: parsedFractional ? parsedFractionalSlots : null,
        isRental: ["true", "1", true].includes(isRental),
        isFractionalInstallment: parsedIsFractionalInstallment,
        isFractionalDuration: parsedFractional && parsedIsFractionalInstallment ? parsedIsFractionalDuration : null,
        kitchen: splitToArray(kitchen),
        heating: splitToArray(heating),
        cooling: splitToArray(cooling),
        type_and_style: splitToArray(type_and_style),
        lot: splitToArray(lot),
        parking: splitToArray(parking)
      };

      const newProperty = await Property.create(newPropertyData);

      const property = await Property.findByPk(newProperty.id);

      let imageUrls = [];
      if (req.files && req.files.length > 0) {
        imageUrls = await uploadImagesToCloudinary(req.files);

        if (!Array.isArray(imageUrls)) {
          imageUrls = [imageUrls];
        }

        await PropertyImage.create({
          property,
          property_id: newProperty.id,
          image_url: imageUrls
        });
      }

      const savedImageRecord = await PropertyImage.findOne({
        where: { property_id: newProperty.id },
        attributes: ["image_url"]
      });

      res.status(201).json({
        property: newProperty,
        images: savedImageRecord?.image_url || [],
        documentUrl: null
      });
    } catch (error) {
      console.error("Error creating property:", error);
      res.status(500).json({ message: "Error creating property", error });
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

exports.getAllProperties = async (req, res) => {
  try {
    const properties = await Property.findAll({
      include: [
        {
          model: PropertyImage,
          as: 'images',
          attributes: ['image_url']
        }
      ]
    });

    // Get all installment ownerships once
    const allOwnerships = await InstallmentOwnership.findAll();

    // Group ownerships by property_id
    const ownershipMap = {};
    allOwnerships.forEach(ownership => {
      if (!ownershipMap[ownership.property_id]) {
        ownershipMap[ownership.property_id] = [];
      }
      ownershipMap[ownership.property_id].push(ownership);
    });

    // Attach installmentProgress to each property
    for (const property of properties) {
      if (property.isInstallment && !property.is_fractional) {
        const ownerships = ownershipMap[property.id] || [];

        const totalMonths = ownerships.reduce((sum, o) => sum + o.total_months, 0);
        const paidMonths = ownerships.reduce((sum, o) => sum + o.months_paid, 0);
        const remainingMonths = totalMonths - paidMonths;

        property.dataValues.installmentProgress = {
          totalOwnerships: ownerships.length,
          totalMonths,
          paidMonths,
          remainingMonths
        };
      } else {
        property.dataValues.installmentProgress = null;
      }
    }

    res.status(200).json(properties);
  } catch (error) {
    console.error("Error in getAllProperties:", error);
    res.status(500).json({ message: 'Error retrieving properties', error });
  }
};

// June 20 2025
// exports.getPropertyById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { userId } = req.query;

//     const property = await Property.findOne({
//       where: { id },
//       include: [{ model: PropertyImage, as: 'images' }]
//     });

//     if (!property) {
//       return res.status(404).json({ message: 'Property not found' });
//     }

//     await property.update({ last_checked: new Date() });

//     let installmentProgress = null;

//     // ✅ Ensure userId and id are integers
//     const parsedUserId = parseInt(userId);
//     const parsedPropertyId = parseInt(id);

//     if (parsedUserId && property.isInstallment && !property.is_fractional) {
//       const ownership = await InstallmentOwnership.findOne({
//         where: {
//           user_id: parsedUserId,
//           property_id: parsedPropertyId
//         }
//       });

//       if (ownership) {
//         installmentProgress = {
//           totalMonths: ownership.total_months,
//           paidMonths: ownership.months_paid,
//           remainingMonths: ownership.total_months - ownership.months_paid,
//           status: ownership.status
//         };
//       }
//     }

//     res.status(200).json({ property, installmentProgress });
//   } catch (error) {
//     console.error("Error in getPropertyById:", error);
//     res.status(500).json({ message: 'Error retrieving property', error });
//   }
// };


// option 1:
// exports.getPropertyById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { userId } = req.query;

//     const property = await Property.findOne({
//       where: { id },
//       include: [{ model: PropertyImage, as: 'images' }]
//     });

//     if (!property) {
//       return res.status(404).json({ message: 'Property not found' });
//     }

//     await property.update({ last_checked: new Date() });

//     let installmentProgress = null;
//     const parsedUserId = parseInt(userId);
//     const parsedPropertyId = parseInt(id);

//     // 🧠 User-specific (Option 2 - already working)
//     if (parsedUserId && property.isInstallment && !property.is_fractional) {
//       const ownership = await InstallmentOwnership.findOne({
//         where: { user_id: parsedUserId, property_id: parsedPropertyId }
//       });

//       if (ownership) {
//         installmentProgress = {
//           totalMonths: ownership.total_months,
//           paidMonths: ownership.months_paid,
//           remainingMonths: ownership.total_months - ownership.months_paid,
//           status: ownership.status
//         };
//       }
//     }

//     // ✅ Option 1: Admin call with no userId — aggregate view
//     if (!parsedUserId && property.isInstallment && !property.is_fractional) {
//       const ownerships = await InstallmentOwnership.findAll({
//         where: { property_id: parsedPropertyId }
//       });

//       const totalUsers = ownerships.length;

//       if (totalUsers > 0) {
//         const totalMonths = ownerships.reduce((sum, o) => sum + o.total_months, 0);
//         const paidMonths = ownerships.reduce((sum, o) => sum + o.months_paid, 0);

//         installmentProgress = {
//           totalUsers,
//           totalMonths,
//           paidMonths,
//           // averagePaidMonths: (paidMonths / totalUsers).toFixed(2),
//           remainingMonths: totalMonths - paidMonths,
//         };
//       }
//     }

//     return res.status(200).json({ property, installmentProgress });
//   } catch (error) {
//     console.error("Error in getPropertyById:", error);
//     res.status(500).json({ message: 'Error retrieving property', error });
//   }
// };

exports.getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    const property = await Property.findOne({
      where: { id },
      include: [{ model: PropertyImage, as: 'images' }]
    });

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    await property.update({ last_checked: new Date() });

    let installmentProgress = null;
    const parsedUserId = parseInt(userId);
    const parsedPropertyId = parseInt(id);

    // 🧠 User-specific (Option 2 - already working)
    if (parsedUserId && property.isInstallment && !property.is_fractional) {
      const ownership = await InstallmentOwnership.findOne({
        where: { user_id: parsedUserId, property_id: parsedPropertyId }
      });

      if (ownership) {
        installmentProgress = {
          totalMonths: ownership.total_months,
          paidMonths: ownership.months_paid,
          remainingMonths: ownership.total_months - ownership.months_paid,
          status: ownership.status
        };
      }
    }

    // ✅ Option 1: Admin call with no userId — aggregate view
    if (!parsedUserId && property.isInstallment && !property.is_fractional) {
      const ownerships = await InstallmentOwnership.findAll({
        where: { property_id: parsedPropertyId }
      });

      const totalUsers = ownerships.length;

      if (totalUsers > 0) {
        const totalMonths = ownerships.reduce((sum, o) => sum + o.total_months, 0);
        const paidMonths = ownerships.reduce((sum, o) => sum + o.months_paid, 0);

        installmentProgress = {
          totalUsers,
          totalMonths,
          paidMonths,
          remainingMonths: totalMonths - paidMonths,
        };
      }
    }

    // ✅ Dynamically compute available_slots if fractional
    let availableSlots = null;
    if (property.is_fractional) {
      const ownerships = await FractionalOwnership.findAll({
        where: { property_id: property.id }
      });

      const totalPurchased = ownerships.reduce((sum, o) => sum + o.slots_purchased, 0);
      availableSlots = property.fractional_slots - totalPurchased;
    }

    const propertyData = {
      ...property.toJSON(),
      available_slots: property.is_fractional ? availableSlots : undefined
    };

    return res.status(200).json({ property: propertyData, installmentProgress });
  } catch (error) {
    console.error("Error in getPropertyById:", error);
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

// 11/04/2025 Works

// exports.getPropertySlots = async (req, res) => {
//     try {
//       const { property_id } = req.params;
//       const { user_id } = req.query;
  
//       const property = await Property.findByPk(property_id);
//       if (!property) {
//         return res.status(404).json({ message: 'Property not found' });
//       }
  
//       // Fetch all ownerships for the property
//       const allOwnerships = await FractionalOwnership.findAll({
//         where: { property_id }
//       });
  
//       // Calculate total purchased slots across all users
//       const totalPurchasedSlots = allOwnerships.reduce(
//         (sum, record) => sum + record.slots_purchased,
//         0
//       );
  
//       // Calculate total slots (available + purchased)
//       const totalSlots = property.fractional_slots + totalPurchasedSlots;
  
//       // If user_id is provided, get user's specific purchased slots
//       if (user_id) {
//         const userPurchasedSlots = allOwnerships
//           .filter(record => record.user_id.toString() === user_id.toString())
//           .reduce((sum, record) => sum + record.slots_purchased, 0);
  
//         return res.status(200).json({
//           property_id: property.id,
//           name: property.name,
//           available_slots: property.fractional_slots,
//           purchased_slots: userPurchasedSlots,
//           total_slots: totalSlots
//         });
//       }
  
//       // Return for admin (all users)
//       return res.status(200).json({
//         property_id: property.id,
//         name: property.name,
//         available_slots: property.fractional_slots,
//         total_purchased_slots: totalPurchasedSlots,
//         total_slots: totalSlots
//       });
  
//     } catch (error) {
//       console.error("Error fetching property slots:", error.message);
//       res.status(500).json({
//         message: 'Error fetching property slot information',
//         error: error.message
//       });
//     }
//   };
  
  
  
  
// 13/04/2025

exports.getPropertySlots = async (req, res) => {
    try {
      const { property_id } = req.params;
      const { user_id } = req.query;
  
      const property = await Property.findByPk(property_id);
      if (!property) {
        return res.status(404).json({ message: 'Property not found' });
      }
  
      // Fetch all ownerships for the property
      const allOwnerships = await FractionalOwnership.findAll({
        where: { property_id },
        include: [
          {
            model: User, // Assuming a relationship exists
            attributes: ['id', 'name', 'email']
          }
        ]
      });
  
      // Calculate total purchased slots across all users
      const totalPurchasedSlots = allOwnerships.reduce(
        (sum, record) => sum + record.slots_purchased,
        0
      );
  
      // Calculate total slots (available + purchased)
      const totalSlots = property.fractional_slots + totalPurchasedSlots;
  
      // If user_id is provided, get user's specific purchased slots
      if (user_id) {
        const userPurchasedSlots = allOwnerships
          .filter(record => record.user_id.toString() === user_id.toString())
          .reduce((sum, record) => sum + record.slots_purchased, 0);
  
        return res.status(200).json({
          property_id: property.id,
          name: property.name,
          available_slots: property.fractional_slots,
          purchased_slots: userPurchasedSlots,
          total_slots: totalSlots
        });
      }
  
      // Return for admin (all users)
      return res.status(200).json({
        property_id: property.id,
        name: property.name,
        available_slots: property.fractional_slots, // Available slots for admin
        total_purchased_slots: totalPurchasedSlots, // Total purchased slots across all users
        total_slots: totalSlots, // Total slots available (initial + purchased)
        purchases: allOwnerships.map(ownership => ({
          user_id: ownership.user_id,
          user_name: ownership.User.name,
          user_email: ownership.User.email,
          slots_purchased: ownership.slots_purchased,
          purchase_date: ownership.createdAt
        }))
      });
  
    } catch (error) {
      console.error("Error fetching property slots:", error.message);
      res.status(500).json({
        message: 'Error fetching property slot information',
        error: error.message
      });
    }
  };
  