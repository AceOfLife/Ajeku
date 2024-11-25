// // models/Property.js
// module.exports = (sequelize, DataTypes) => {
//   const Property = sequelize.define('Property', {
//     name: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     size: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     price: {
//       type: DataTypes.FLOAT,
//       allowNull: false,
//     },
//     agent_id: {
//       type: DataTypes.INTEGER,
//       references: {
//         model: 'Agent', // Make sure this matches your actual Agent model
//         key: 'id',
//       },
//     },
//     type: { // New field for Property Type
//       type: DataTypes.ENUM('Rooms', 'Workspace'),
//       allowNull: false,
//     },
//     amenities: { // New field for Property Amenities
//       type: DataTypes.ENUM('Furnished', 'Unfurnished'),
//       allowNull: false,
//     },
//     location: { // New field for Location
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     area: { // New field for Areas
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//   });

//   return Property;
// };


// models/Property.js
// module.exports = (sequelize, DataTypes) => {
//   const Property = sequelize.define('Property', {
//     name: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     size: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     price: {
//       type: DataTypes.FLOAT,
//       allowNull: false,
//     },
//     agent_id: {
//       type: DataTypes.INTEGER,
//       references: {
//         model: 'Users', // Reference to the User model (agents are Users)
//         key: 'id',
//       },
//       allowNull: false,
//     },
//     type: { // New field for Property Type
//       type: DataTypes.ENUM('Rooms', 'Workspace'),
//       allowNull: false,
//     },
//     amenities: { // New field for Property Amenities
//       type: DataTypes.ENUM('Furnished', 'Unfurnished'),
//       allowNull: false,
//     },
//     location: { // New field for Location
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     area: { // New field for Areas
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//   });

//   Property.associate = function(models) {
//     // Each property belongs to a user (agent)
//     Property.belongsTo(models.User, { foreignKey: 'agent_id', as: 'agent' });
//   };

//   return Property;
// };


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
        model: 'Users', // Reference to the User model (agents are Users)
        key: 'id',
      },
      allowNull: false,
    },
    type: { // Property Type (e.g., Rooms, Workspace)
      type: DataTypes.ENUM('Rooms', 'Workspace'),
      allowNull: false,
    },
    amenities: { // Property Amenities (e.g., Furnished, Unfurnished)
      type: DataTypes.ENUM('Furnished', 'Unfurnished'),
      allowNull: false,
    },
    location: { // Location of the property
      type: DataTypes.STRING,
      allowNull: false,
    },
    area: { // Area of the property
      type: DataTypes.STRING,
      allowNull: false,
    },
    number_of_baths: { // New field for number of bathrooms
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    number_of_rooms: { // New field for number of rooms
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });

  Property.associate = function(models) {
    // Each property belongs to a user (agent)
    Property.belongsTo(models.User, { foreignKey: 'agent_id', as: 'agent' });
  };

  return Property;
};
