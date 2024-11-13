const { Property } = require('../models');

// Create a new property
exports.createProperty = async (req, res) => {
    try {
        const propertyData = req.body;
        const newProperty = await Property.create(propertyData);
        res.status(201).json(newProperty);
    } catch (error) {
        res.status(400).json({ message: 'Error creating property', error });
    }
};

// Update an existing property
exports.updateProperty = async (req, res) => {
    try {
        const { id } = req.params;
        const propertyData = req.body;

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
    const { type, amenities, location, area } = req.query;

    const filter = {};
    if (type) filter.type = type;
    if (amenities) filter.amenities = amenities;
    if (location) filter.location = location;
    if (area) filter.area = area;

    try {
        const properties = await Property.findAll({ where: filter });
        res.status(200).json(properties);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving properties', error });
    }
};
