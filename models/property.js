// models/Property.js
module.exports = (sequelize, DataTypes) => {
  const Property = sequelize.define('Property', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    size: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    agent_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Agent', // Make sure this matches your actual Agent model
        key: 'id',
      },
    },
    type: { // New field for Property Type
      type: DataTypes.ENUM('Rooms', 'Workspace'),
      allowNull: false,
    },
    amenities: { // New field for Property Amenities
      type: DataTypes.ENUM('Furnished', 'Unfurnished'),
      allowNull: false,
    },
    location: { // New field for Location
      type: DataTypes.STRING,
      allowNull: false,
    },
    area: { // New field for Areas
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  return Property;
};
