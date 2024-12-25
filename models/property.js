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
      type: DataTypes.STRING,
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
      validate: {
        isIn: {
          args: [['rooms', 'workspace', 'residential', 'commercial']], // Lowercase values for validation
          msg: 'Invalid type. Must be one of: Rooms, Workspace, Residential, or Commercial.'
        },
      },
      set(value) {
        this.setDataValue('type', value ? value.toLowerCase() : value); // Store value in lowercase
      },
      get() {
        const value = this.getDataValue('type');
        return value ? value.toUpperCase() : value; // Normalize value to uppercase when retrieving
      },
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
      type: DataTypes.STRING,
      allowNull: false,
    },
    number_of_rooms: { // Number of rooms
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: { // Property Description
      type: DataTypes.TEXT,
      allowNull: true,
    },
    address: { // Property Address
      type: DataTypes.STRING,
      allowNull: false,
    },
    sqft: { // Square footage
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 0,
    },
    payment_plan: { // Payment Plan
      type: DataTypes.STRING,
      allowNull: true,
    },
    year_built: { // Year the property was built
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    amount_per_sqft: { // Price per square foot
      type: DataTypes.STRING,
      allowNull: true,
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
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
    heating: { // Heating details
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
    cooling: { // Cooling details
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
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
    },
    parking: { // Parking details (e.g., garage, carport)
      type: DataTypes.JSONB,
      allowNull: true,
    },
    lot: { // Lot size (e.g., 5000 sqft)
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
    type_and_style: { // Type & Style of the property (e.g., Modern, Colonial, etc.)
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
    material: { // Building Material (e.g., brick, wood)
      type: DataTypes.STRING,
      allowNull: true,
    },
    annual_tax_amount: { // Annual property tax
      type: DataTypes.STRING,
      allowNull: true,
    },
    date_on_market: { // Date the property was listed on the market
      type: DataTypes.STRING,
      allowNull: true,
    },
    ownership: { // Ownership type (e.g., Freehold, Leasehold)
      type: DataTypes.STRING,
      allowNull: true,
    },
    percentage: { // Percentage for part payment
      type: DataTypes.STRING,
      allowNull: true,
    },
    duration: { // Duration for part payment
      type: DataTypes.STRING,
      allowNull: true,
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
