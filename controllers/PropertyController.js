// const { Property } = require('../models');

// // Create a new property
// exports.createProperty = async (req, res) => {
//     try {
//         const propertyData = req.body;
//         const newProperty = await Property.create(propertyData);
//         res.status(201).json(newProperty);
//     } catch (error) {
//         res.status(400).json({ message: 'Error creating property', error });
//     }
// };

// // Update an existing property
// exports.updateProperty = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const propertyData = req.body;

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
//         const property = await Property.findOne({ where: { id } });

//         if (property) {
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
//     const { type, amenities, location, area } = req.query;

//     const filter = {};
//     if (type) filter.type = type;
//     if (amenities) filter.amenities = amenities;
//     if (location) filter.location = location;
//     if (area) filter.area = area;

//     try {
//         const properties = await Property.findAll({ where: filter });
//         res.status(200).json(properties);
//     } catch (error) {
//         res.status(500).json({ message: 'Error retrieving properties', error });
//     }
// };


// New

// const { Property, User } = require('../models');

// // Create a new property
// exports.createProperty = async (req, res) => {
//     try {
//         const { name, size, price, agent_id, type, amenities, location, area } = req.body;

//         // Check if the admin is authenticated and has the correct role
//         const admin = req.user; // Assuming req.user is populated with the logged-in admin's data
//         if (admin.role !== 'admin') {
//             return res.status(403).json({ message: 'You are not authorized to create a property' });
//         }

//         // Check if the agent exists
//         const agent = await User.findByPk(agent_id, { where: { role: 'agent' } });
//         if (!agent) {
//             return res.status(404).json({ message: 'Agent not found' });
//         }

//         // Create the property with the agent_id
//         const newProperty = await Property.create({
//             name,
//             size,
//             price,
//             agent_id, // Associate property with the agent
//             type,
//             amenities,
//             location,
//             area,
//         });

//         res.status(201).json(newProperty);
//     } catch (error) {
//         console.error(error);
//         res.status(400).json({ message: 'Error creating property', error });
//     }
// };

// // Update an existing property
// exports.updateProperty = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const propertyData = req.body;

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
//         const property = await Property.findOne({ where: { id } });

//         if (property) {
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
//     const { type, amenities, location, area } = req.query;

//     const filter = {};
//     if (type) filter.type = type;
//     if (amenities) filter.amenities = amenities;
//     if (location) filter.location = location;
//     if (area) filter.area = area;

//     try {
//         const properties = await Property.findAll({ where: filter });
//         res.status(200).json(properties);
//     } catch (error) {
//         res.status(500).json({ message: 'Error retrieving properties', error });
//     }
// };




// New


// const { Property, User } = require('../models');

// // Create a new property
// exports.createProperty = async (req, res) => {
//     try {
//         const { 
//             name, 
//             size, 
//             price, 
//             agent_id, 
//             type, 
//             amenities, 
//             location, 
//             area, 
//             number_of_baths, 
//             number_of_rooms 
//         } = req.body;

//         // Check if the admin is authenticated and has the correct role
//         const admin = req.user; // Assuming req.user is populated with the logged-in admin's data
//         if (admin.role !== 'admin') {
//             return res.status(403).json({ message: 'You are not authorized to create a property' });
//         }

//         // Check if the agent exists (the agent_id should refer to a user with role 'agent')
//         const agent = await User.findByPk(agent_id, { where: { role: 'agent' } });
//         if (!agent) {
//             return res.status(404).json({ message: 'Agent not found' });
//         }

//         // Create the property with the agent_id and other details
//         const newProperty = await Property.create({
//             name,
//             size,
//             price,
//             agent_id, // Associate property with the agent
//             type,
//             amenities,
//             location,
//             area,
//             number_of_baths, // New field for number of baths
//             number_of_rooms, // New field for number of rooms
//         });

//         res.status(201).json(newProperty);
//     } catch (error) {
//         console.error(error);
//         res.status(400).json({ message: 'Error creating property', error });
//     }
// };

// // Update an existing property
// exports.updateProperty = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const propertyData = req.body;

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
//         const property = await Property.findOne({ where: { id } });

//         if (property) {
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
//     const { type, amenities, location, area, number_of_baths, number_of_rooms } = req.query;

//     // Prepare the filter based on the query parameters
//     const filter = {};
//     if (type) filter.type = type;
//     if (amenities) filter.amenities = amenities;
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


// New - Handling images:

// const { Property, User, PropertyImage } = require('../models');
// const path = require('path');
// const fs = require('fs');
// const multer = require('multer');

// // Multer configuration for handling image uploads
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'uploads/'); // Specify the folder to save images
//     },
//     filename: (req, file, cb) => {
//         cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to filenames to avoid conflicts
//     },
// });

// const upload = multer({ storage }).array('images'); // This will allow multiple image uploads

// // Create a new property
// exports.createProperty = async (req, res) => {
//     upload(req, res, async (err) => {
//         if (err) {
//             return res.status(400).json({ message: 'Error uploading images', error: err });
//         }

//         try {
//             const { 
//                 name, 
//                 size, 
//                 price, 
//                 agent_id, 
//                 type, 
//                 amenities, 
//                 location, 
//                 area, 
//                 number_of_baths, 
//                 number_of_rooms 
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
//                 amenities,
//                 location,
//                 area,
//                 number_of_baths, // New field for number of baths
//                 number_of_rooms, // New field for number of rooms
//             });

//             // Handle image uploads
//             if (req.files && req.files.length > 0) {
//                 const imageUrls = req.files.map(file => ({
//                     property_id: newProperty.id,
//                     image_url: file.path, // Save the image path in the PropertyImage table
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
//     const { type, amenities, location, area, number_of_baths, number_of_rooms } = req.query;

//     // Prepare the filter based on the query parameters
//     const filter = {};
//     if (type) filter.type = type;
//     if (amenities) filter.amenities = amenities;
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


// New last_checked, listing_updated and listing_by update

// const { Property, User, PropertyImage } = require('../models');
// const path = require('path');
// const fs = require('fs');
// const multer = require('multer');

// // Multer configuration for handling image uploads
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'uploads/'); // Specify the folder to save images
//     },
//     filename: (req, file, cb) => {
//         cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to filenames to avoid conflicts
//     },
// });

// const upload = multer({ storage }).array('images'); // This will allow multiple image uploads

// // Create a new property
// exports.createProperty = async (req, res) => {
//     upload(req, res, async (err) => {
//         if (err) {
//             return res.status(400).json({ message: 'Error uploading images', error: err });
//         }

//         try {
//             const { 
//                 name, 
//                 size, 
//                 price, 
//                 agent_id, 
//                 type, 
//                 amenities, 
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
//                 amenities,
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
//                     image_url: file.path, // Save the image path in the PropertyImage table
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
//     const { type, amenities, location, area, number_of_baths, number_of_rooms } = req.query;

//     // Prepare the filter based on the query parameters
//     const filter = {};
//     if (type) filter.type = type;
//     if (amenities) filter.amenities = amenities;
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



// Amenities removed

// const { Property, User, PropertyImage } = require('../models');
// const path = require('path');
// const fs = require('fs');
// const multer = require('multer');

// // Multer configuration for handling image uploads
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'uploads/'); // Specify the folder to save images
//     },
//     filename: (req, file, cb) => {
//         cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to filenames to avoid conflicts
//     },
// });

// const upload = multer({ storage }).array('images'); // This will allow multiple image uploads

// // Create a new property
// exports.createProperty = async (req, res) => {
//     upload(req, res, async (err) => {
//         if (err) {
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
//                     image_url: file.path, // Save the image path in the PropertyImage table
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


// Multer image upload

const { Property, User, PropertyImage } = require('../models');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Multer configuration for handling image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads'); // Absolute path for uploads folder
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true }); // Ensure uploads folder exists
        }
        cb(null, uploadDir); // Save images to uploads folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to filenames to avoid conflicts
    },
});

const upload = multer({
    storage, 
}).any('images'); // This will allow multiple image uploads

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
                address
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

            // Create the property with the agent_id and other details
            const newProperty = await Property.create({
                name,
                size,
                price,
                agent_id, // Associate property with the agent
                type,
                location,
                area,
                address,
                number_of_baths, // New field for number of baths
                number_of_rooms, // New field for number of rooms
                listed_by: admin.username, // Set listed_by to the admin's username
            });

            // Handle image uploads
            if (req.files && req.files.length > 0) {
                const imageUrls = req.files.map(file => ({
                    property_id: newProperty.id,
                    image_url: file.path, // Save the image path in the PropertyImage table
                }));

                // Create records for the images
                await PropertyImage.bulkCreate(imageUrls);
            }

            res.status(201).json(newProperty);
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
            return res.status(204).send();
        }

        throw new Error('Property not found');
    } catch (error) {
        res.status(400).json({ message: 'Error deleting property', error });
    }
};

// Get all properties
exports.getAllProperties = async (req, res) => {
    try {
        const properties = await Property.findAll();
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
        res.status(200).json(properties);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving properties', error });
    }
};
