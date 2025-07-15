module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define('Notification', {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    type: {
      type: DataTypes.ENUM(
        'property', 
        'transaction', 
        'message', 
        'system',
        'payment',
        'admin_alert'
      ),
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    // New fields
    related_entity_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    // Track click action
    action_url: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    underscored: true, // to keep consistent with your current naming
    tableName: 'notifications' // explicit table name
  });

  Notification.associate = (models) => {
    Notification.belongsTo(models.User, { 
      foreignKey: 'user_id',
      as: 'user' // adds association alias
    });
  };

  return Notification;
};