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


const { Property, User } = require('../models');

// Create a new property
exports.createProperty = async (req, res) => {
    try {
        const { 
            name, 
            size, 
            price, 
            agent_id, 
            type, 
            amenities, 
            location, 
            area, 
            number_of_baths, 
            number_of_rooms 
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
            amenities,
            location,
            area,
            number_of_baths, // New field for number of baths
            number_of_rooms, // New field for number of rooms
        });

        res.status(201).json(newProperty);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Error creating property', error });
    }
};

// Update an existing property
exports.updateProperty = async (req, res) => {
    try {
        const { id } = req.params;
        const propertyData = req.body;

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
        const property = await Property.findOne({ where: { id } });

        if (property) {
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
    const { type, amenities, location, area, number_of_baths, number_of_rooms } = req.query;

    // Prepare the filter based on the query parameters
    const filter = {};
    if (type) filter.type = type;
    if (amenities) filter.amenities = amenities;
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
