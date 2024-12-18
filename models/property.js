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
//         model: 'Users', // Reference to the User model (agents are Users)
//         key: 'id',
//       },
//       allowNull: false,
//     },
//     type: { // Property Type (e.g., Rooms, Workspace)
//       type: DataTypes.ENUM('Rooms', 'Workspace'),
//       allowNull: false,
//     },
//     amenities: { // Property Amenities (e.g., Furnished, Unfurnished)
//       type: DataTypes.ENUM('Furnished', 'Unfurnished'),
//       allowNull: false,
//     },
//     location: { // Location of the property
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     area: { // Area of the property
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     number_of_baths: { // New field for number of bathrooms
//       type: DataTypes.INTEGER,
//       allowNull: false,
//     },
//     number_of_rooms: { // New field for number of rooms
//       type: DataTypes.INTEGER,
//       allowNull: false,
//     },
//   });

//   Property.associate = function(models) {
//     // Each property belongs to a user (agent)
//     Property.belongsTo(models.User, { foreignKey: 'agent_id', as: 'agent' });
//   };

//   return Property;
// };


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
      type: DataTypes.ENUM('Rooms', 'Workspace','Residential', 'Commercial'),
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
    number_of_baths: { // Number of bathrooms
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    number_of_rooms: { // Number of rooms
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    description: { // Property Description
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "",
    },
    address: { // Property Address
      type: DataTypes.STRING,
      allowNull: false,
    },
    sqft: { // Square footage
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    payment_plan: { // Payment Plan
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "",
    },
    year_built: { // Year the property was built
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "",
    },
    amount_per_sqft: { // Price per square foot
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0.0,
    },
    special_features: { // Special Features (multiple possible values)
      type: DataTypes.JSONB, // JSONB is used to store multiple items (array of strings)
      allowNull: true,
    },
    last_checked: { // Last checked date
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW, // Automatically set to current timestamp
    },
    listing_updated: { // Date the listing was last updated
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW, // Automatically set to current timestamp on create
    },
    listed_by: { // The agent or entity who listed the property
      type: DataTypes.STRING,
      allowNull: true,
    },
    kitchen: { // Kitchen details
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "",
    },
    heating: { // Heating details
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "",
    },
    cooling: { // Cooling details
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "",
    },
    appliances: { // Appliances details
      type: DataTypes.JSONB, // Can store multiple appliance types (e.g., fridge, oven, etc.)
      allowNull: true,
    },
    features: { // Features of the property (e.g., pool, garden, etc.)
      type: DataTypes.JSONB, // List of features as JSON
      allowNull: true,
    },
    interior_area: { // Interior Area in square feet or meters
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    parking: { // Parking details (e.g., garage, carport)
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "",
    },
    lot: { // Lot size (e.g., 5000 sqft)
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "",
    },
    type_and_style: { // Type & Style of the property (e.g., Modern, Colonial, etc.)
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "",
    },
    material: { // Building Material (e.g., brick, wood)
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "",
    },
    annual_tax_amount: { // Annual property tax
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "",
    },
    date_on_market: { // Date the property was listed on the market
      type: DataTypes.DATE,
      allowNull: true,
    },
    ownership: { // Ownership type (e.g., Freehold, Leasehold)
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "",
    },
  });

  Property.associate = function(models) {
    // Each property belongs to a user (agent)
    Property.belongsTo(models.User, { foreignKey: 'agent_id', as: 'agent' });

    // Each property can have many images
    Property.hasMany(models.PropertyImage, {
      foreignKey: 'property_id',
      as: 'images',
    });
  };

  return Property;
};
