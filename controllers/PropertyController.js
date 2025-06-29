// PropertyImage Table Update

// const { Property, User, PropertyImage } = require('../models');
const { Property, User, PropertyImage, FractionalOwnership, InstallmentOwnership, Transaction } = require('../models');
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


// New CreateProperty for isFractionalDuration: 29th june, 2025

// exports.createProperty = async (req, res) => {
//   upload(req, res, async (err) => {
//     if (err) {
//       console.error("Multer error:", err);
//       return res.status(400).json({ message: "Error uploading images", error: err });
//     }

//     try {
//       const {
//         name, size, price, agent_id, type, location, area,
//         number_of_baths, number_of_rooms, address, description,
//         payment_plan, year_built, special_features, appliances, features,
//         interior_area, parking, material, date_on_market,
//         ownership, kitchen, heating, cooling, type_and_style, lot,
//         percentage, duration, is_fractional, fractional_slots,
//         isRental, isInstallment, isFractionalInstallment, isFractionalDuration, annual_rent,
//       } = req.body;

//       // === Typecasting and validation ===
//       const parsedFractional = ["true", "1", true].includes(is_fractional);
//       const parsedFractionalSlots = parsedFractional ? parseInt(fractional_slots, 10) || 0 : null;
//       const parsedPrice = parseFloat(price) || 0;
//       const parsedIsInstallment = ["true", "1", true].includes(isInstallment);
//       const parsedDuration = duration != null ? parseInt(duration, 10) : null;
//       const parsedIsFractionalInstallment = parsedFractional
//         ? ["true", "1", true].includes(isFractionalInstallment)
//         : false;
//       const parsedIsFractionalDuration = parsedIsFractionalInstallment
//         ? parseInt(isFractionalDuration, 10)
//         : null;

//       // === Validation ===
//       if (!parsedFractional && isInstallment === undefined) {
//         return res.status(400).json({ message: "isInstallment is required for non-fractional properties" });
//       }

//       if (!parsedFractional && parsedIsInstallment && (parsedDuration == null || isNaN(parsedDuration) || parsedDuration <= 0)) {
//         return res.status(400).json({ message: "Duration must be a positive integer when isInstallment is true" });
//       }

//       if (parsedFractional && parsedIsFractionalInstallment) {
//         if (!parsedIsFractionalDuration || isNaN(parsedIsFractionalDuration) || parsedIsFractionalDuration <= 0) {
//           return res.status(400).json({ message: "isFractionalDuration must be a positive integer when isFractionalInstallment is true" });
//         }
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
//         duration: parsedFractional ? null : parsedDuration,
//         isInstallment: parsedFractional ? false : parsedIsInstallment,
//         is_fractional: parsedFractional,
//         fractional_slots: parsedFractionalSlots,
//         price_per_slot: parsedFractional ? (parsedPrice / (parsedFractionalSlots || 1)) : null,
//         available_slots: parsedFractional ? parsedFractionalSlots : null,
//         isRental: ["true", "1", true].includes(isRental),
//         isFractionalInstallment: parsedIsFractionalInstallment,
//         isFractionalDuration: parsedFractional && parsedIsFractionalInstallment ? parsedIsFractionalDuration : null,
//         kitchen: splitToArray(kitchen),
//         heating: splitToArray(heating),
//         cooling: splitToArray(cooling),
//         type_and_style: splitToArray(type_and_style),
//         lot: splitToArray(lot),
//         parking: splitToArray(parking),
//         annual_rent,
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
        isRental, isInstallment, isFractionalInstallment, isFractionalDuration, annual_rent,
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
      const parsedIsRental = ["true", "1", true].includes(isRental);
      const parsedAnnualRent = annual_rent ? parseFloat(annual_rent) : null;

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

      // NEW: Add annual_rent validation only when isRental is true
      if (parsedIsRental && (!annual_rent || isNaN(parsedAnnualRent) || parsedAnnualRent <= 0)) {
        return res.status(400).json({ message: "Annual rent must be a positive number when isRental is true" });
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
        isRental: parsedIsRental,
        annual_rent: parsedAnnualRent, // Include the parsed value
        isFractionalInstallment: parsedIsFractionalInstallment,
        isFractionalDuration: parsedFractional && parsedIsFractionalInstallment ? parsedIsFractionalDuration : null,
        kitchen: splitToArray(kitchen),
        heating: splitToArray(heating),
        cooling: splitToArray(cooling),
        type_and_style: splitToArray(type_and_style),
        lot: splitToArray(lot),
        parking: splitToArray(parking),
      };

      // Rest of your existing code remains exactly the same...
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

// June 29, 2025

// exports.getAllProperties = async (req, res) => {
//   try {
//     const properties = await Property.findAll({
//       include: [
//         {
//           model: PropertyImage,
//           as: 'images',
//           attributes: ['image_url']
//         }
//       ]
//     });

//     // Get all installment ownerships once
//     const allOwnerships = await InstallmentOwnership.findAll();

//     // Group ownerships by property_id
//     const ownershipMap = {};
//     allOwnerships.forEach(ownership => {
//       if (!ownershipMap[ownership.property_id]) {
//         ownershipMap[ownership.property_id] = [];
//       }
//       ownershipMap[ownership.property_id].push(ownership);
//     });

//     // Attach installmentProgress to each property
//     for (const property of properties) {
//       if (property.isInstallment && !property.is_fractional) {
//         const ownerships = ownershipMap[property.id] || [];

//         const totalMonths = ownerships.reduce((sum, o) => sum + o.total_months, 0);
//         const paidMonths = ownerships.reduce((sum, o) => sum + o.months_paid, 0);
//         const remainingMonths = totalMonths - paidMonths;

//         property.dataValues.installmentProgress = {
//           totalOwnerships: ownerships.length,
//           totalMonths,
//           paidMonths,
//           remainingMonths
//         };
//       } else {
//         property.dataValues.installmentProgress = null;
//       }
//     }

//     res.status(200).json(properties);
//   } catch (error) {
//     console.error("Error in getAllProperties:", error);
//     res.status(500).json({ message: 'Error retrieving properties', error });
//   }
// };

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

    // Get all ownership data in parallel
    const [allInstallmentOwnerships, allFractionalOwnerships] = await Promise.all([
      InstallmentOwnership.findAll(),
      FractionalOwnership.findAll()
    ]);

    // Create lookup maps
    const installmentOwnershipMap = {};
    const fractionalOwnershipMap = {};

    allInstallmentOwnerships.forEach(ownership => {
      if (!installmentOwnershipMap[ownership.property_id]) {
        installmentOwnershipMap[ownership.property_id] = [];
      }
      installmentOwnershipMap[ownership.property_id].push(ownership);
    });

    allFractionalOwnerships.forEach(ownership => {
      if (!fractionalOwnershipMap[ownership.property_id]) {
        fractionalOwnershipMap[ownership.property_id] = [];
      }
      fractionalOwnershipMap[ownership.property_id].push(ownership);
    });

    // Process each property
    for (const property of properties) {
      // Keep existing installment progress logic
      if (property.isInstallment && !property.is_fractional) {
        const ownerships = installmentOwnershipMap[property.id] || [];
        const totalMonths = ownerships.reduce((sum, o) => sum + o.total_months, 0);
        const paidMonths = ownerships.reduce((sum, o) => sum + o.months_paid, 0);
        
        property.dataValues.installmentProgress = {
          totalOwnerships: ownerships.length,
          totalMonths,
          paidMonths,
          remainingMonths: totalMonths - paidMonths
        };
      } else {
        property.dataValues.installmentProgress = null;
      }

      // NEW: Add available_slots calculation for fractional properties
      if (property.is_fractional) {
        const fractionalOwnerships = fractionalOwnershipMap[property.id] || [];
        const totalPurchased = fractionalOwnerships.reduce((sum, o) => sum + o.slots_purchased, 0);
        property.dataValues.available_slots = property.fractional_slots - totalPurchased;
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

//     // ✅ Increment views
//     await property.increment('views');

//     // Update last checked
//     await property.update({ last_checked: new Date() });

//     let installmentProgress = null;
//     const parsedUserId = parseInt(userId);
//     const parsedPropertyId = parseInt(id);

//     // 🧠 User-specific (Option 2)
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
//           remainingMonths: totalMonths - paidMonths,
//         };
//       }
//     }

//     // ✅ Dynamically compute available_slots if fractional
//     let availableSlots = null;
//     if (property.is_fractional) {
//       const ownerships = await FractionalOwnership.findAll({
//         where: { property_id: property.id }
//       });

//       const totalPurchased = ownerships.reduce((sum, o) => sum + o.slots_purchased, 0);
//       availableSlots = property.fractional_slots - totalPurchased;
//     }

//     const propertyData = {
//       ...property.toJSON(),
//       available_slots: property.is_fractional ? availableSlots : undefined
//     };

//     return res.status(200).json({ property: propertyData, installmentProgress });
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

    await property.increment('views');
    await property.update({ last_checked: new Date() });

    const parsedUserId = parseInt(userId);
    const parsedPropertyId = parseInt(id);
    let installmentProgress = null;
    let userSlotsOwned = 0; // Initialize variable for user's owned slots

    // === ✅ User-specific progress (fractionalInstallment or standard installment)
    if (parsedUserId) {
      // Check for standard installment ownership
      const installmentOwnership = await InstallmentOwnership.findOne({
        where: { user_id: parsedUserId, property_id: parsedPropertyId }
      });

      if (installmentOwnership) {
        installmentProgress = {
          totalMonths: installmentOwnership.total_months,
          paidMonths: installmentOwnership.months_paid,
          remainingMonths: installmentOwnership.total_months - installmentOwnership.months_paid,
          status: installmentOwnership.status
        };
      }

      // Check for fractional ownership slots
      if (property.is_fractional) {
        const fractionalOwnership = await FractionalOwnership.findOne({
          where: { user_id: parsedUserId, property_id: parsedPropertyId }
        });

        if (fractionalOwnership) {
          userSlotsOwned = fractionalOwnership.slots_purchased;
        }
      }
    }

    // === ✅ Admin aggregate (only for standard installment properties)
    if (!parsedUserId && property.isInstallment && !property.is_fractional) {
      const ownerships = await InstallmentOwnership.findAll({
        where: { property_id: parsedPropertyId }
      });

      const totalOwnerships = ownerships.length;
      const totalMonths = ownerships.reduce((sum, o) => sum + o.total_months, 0);
      const paidMonths = ownerships.reduce((sum, o) => sum + o.months_paid, 0);

      installmentProgress = {
        totalOwnerships,
        totalMonths,
        paidMonths,
        remainingMonths: totalMonths - paidMonths
      };
    }

    // === ✅ Compute available_slots if fractional
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
      available_slots: property.is_fractional ? availableSlots : undefined,
      user_slots_owned: property.is_fractional && parsedUserId ? userSlotsOwned : undefined
    };

    return res.status(200).json({ 
      property: propertyData, 
      installmentProgress 
    });
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

  exports.getRecentProperties = async (req, res) => {
  try {
    const properties = await Property.findAll({
      order: [['createdAt', 'DESC']],
      limit: 6,
      include: [{ model: PropertyImage, as: 'images' }]
    });

    res.status(200).json({ properties });
  } catch (error) {
    console.error("Error fetching recent properties:", error);
    res.status(500).json({ message: "Failed to fetch recent properties", error });
  }
};

exports.getMostViewedProperties = async (req, res) => {
  try {
    const properties = await Property.findAll({
      order: [['views', 'DESC']],
      limit: 6,
      include: [{ model: PropertyImage, as: 'images' }]
    });

    res.status(200).json({ properties });
  } catch (error) {
    console.error('Error fetching most viewed properties:', error);
    res.status(500).json({ message: 'Failed to fetch most viewed properties', error });
  }
};

exports.getUserProperties = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Outright properties (via Transactions)
    const outright = await Property.findAll({
      include: [
        { model: Transaction, where: { user_id: userId, status: 'success' }, required: true },
        { model: PropertyImage, as: 'images' }
      ]
    });

    // 2. Fractional ownerships
    const fractionalIds = await FractionalOwnership.findAll({
      where: { user_id: userId },
      attributes: ['property_id'],
      raw: true
    });

    const fractional = await Property.findAll({
      where: {
        id: fractionalIds.map(f => f.property_id)
      },
      include: [{ model: PropertyImage, as: 'images' }]
    });

    // 3. Installment ownerships
    const installmentIds = await InstallmentOwnership.findAll({
      where: { user_id: userId },
      attributes: ['property_id'],
      raw: true
    });

    const installments = await Property.findAll({
      where: {
        id: installmentIds.map(i => i.property_id)
      },
      include: [{ model: PropertyImage, as: 'images' }]
    });

    // Combine and remove duplicates
    const allPropertiesMap = new Map();

    [...outright, ...fractional, ...installments].forEach((prop) => {
      allPropertiesMap.set(prop.id, prop); // overwrite duplicates
    });

    const uniqueProperties = Array.from(allPropertiesMap.values());

    return res.status(200).json({
      message: 'User properties fetched successfully',
      properties: uniqueProperties
    });

  } catch (error) {
    console.error('Error fetching user properties:', error);
    return res.status(500).json({ message: 'Failed to fetch user properties', error });
  }
};

exports.updateMonthlyExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { monthly_expense } = req.body;

    const property = await Property.findByPk(id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (typeof monthly_expense !== 'number' || monthly_expense < 0) {
      return res.status(400).json({ message: 'monthly_expense must be a valid number' });
    }

    property.monthly_expense = monthly_expense;
    await property.save();

    return res.status(200).json({
      message: 'Monthly expense updated successfully',
      property
    });
  } catch (error) {
    console.error('Error updating monthly expense:', error);
    return res.status(500).json({ message: 'Error updating monthly expense', error });
  }
};

exports.updateEstimatedValue = async (req, res) => {
  try {
    const { id } = req.params;
    const { estimated_value } = req.body;

    const property = await Property.findByPk(id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (typeof estimated_value !== 'number' || estimated_value <= 0) {
      return res.status(400).json({ message: 'Estimated value must be a valid number' });
    }

    property.estimated_value = estimated_value;
    await property.save();

    return res.status(200).json({
      message: 'Estimated value updated successfully',
      property
    });
  } catch (error) {
    console.error('Error updating estimated value:', error);
    return res.status(500).json({ message: 'Error updating estimated value', error });
  }
};

exports.getPropertyAnalytics = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { userId } = req.query;

    const property = await Property.findByPk(propertyId);
    if (!property || !property.isRental) {
      return res.status(404).json({ message: 'Rental property not found' });
    }

    const annual_rent = parseFloat(property.annual_rent || 0);
    const monthly_rent = annual_rent / 12;

    const monthly_expense = parseFloat(property.monthly_expense || 0);
    const annual_expense = monthly_expense * 12;

    const estimated_value = parseFloat(property.estimated_value || property.price || 0);

    const annual_income = await Transaction.sum('price', {
      where: {
        property_id: property.id,
        payment_type: 'rent'
      }
    }) || 0;

    let outstanding_balance = 0;
    if (userId) {
      const ownership = await InstallmentOwnership.findOne({
        where: { user_id: userId, property_id: property.id }
      });

      if (ownership) {
        const total_months = ownership.total_months || 0;
        const months_paid = ownership.months_paid || 0;
        const monthly_installment = property.price / total_months;
        outstanding_balance = monthly_installment * (total_months - months_paid);
      }
    }

    const potential_equity = estimated_value - outstanding_balance;

    const gross_yield = estimated_value ? (annual_income / estimated_value) * 100 : 0;
    const net_yield = estimated_value ? ((annual_income - annual_expense) / estimated_value) * 100 : 0;

    const analytics = {
      monthly_rent,
      annual_expense,
      annual_income,
      outstanding_balance,
      estimated_value,
      potential_equity,
      gross_yield: parseFloat(gross_yield.toFixed(2)),
      net_yield: parseFloat(net_yield.toFixed(2))
    };

    return res.status(200).json({
      message: 'Property analytics retrieved',
      analytics
    });
  } catch (error) {
    console.error("Error fetching property analytics:", error);
    return res.status(500).json({ message: "Error retrieving analytics", error });
  }
};


  