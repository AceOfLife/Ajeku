// 'use strict';
// module.exports = (sequelize, DataTypes) => {
//   const InstallmentOwnership = sequelize.define('InstallmentOwnership', {
//     id: {
//       type: DataTypes.INTEGER,
//       autoIncrement: true,
//       primaryKey: true
//     },
//     user_id: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//     },
//     property_id: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//     },
//     start_date: {
//       type: DataTypes.DATE,
//       allowNull: false,
//       defaultValue: DataTypes.NOW
//     }
//   }, {});

//   InstallmentOwnership.associate = function(models) {
//     InstallmentOwnership.belongsTo(models.User, { foreignKey: 'user_id' });
//     InstallmentOwnership.belongsTo(models.Property, { foreignKey: 'property_id', as: 'property' });
//   };

//   return InstallmentOwnership;
// };
'use strict';
module.exports = (sequelize, DataTypes) => {
  const InstallmentOwnership = sequelize.define('InstallmentOwnership', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    property_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    total_months: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    months_paid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    status: {
      type: DataTypes.ENUM("ongoing", "completed"),
      allowNull: false,
      defaultValue: "ongoing"
    }
  }, {});

  InstallmentOwnership.associate = function(models) {
    InstallmentOwnership.belongsTo(models.User, { foreignKey: 'user_id' });
    InstallmentOwnership.belongsTo(models.Property, { foreignKey: 'property_id', as: 'property' });
    InstallmentOwnership.hasMany(models.InstallmentPayment, { foreignKey: 'ownership_id' });
  };

  return InstallmentOwnership;
};
