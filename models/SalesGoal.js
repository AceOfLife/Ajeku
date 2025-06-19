module.exports = (sequelize, DataTypes) => {
  const SalesGoal = sequelize.define('SalesGoal', {
    month: DataTypes.STRING,
    year: DataTypes.INTEGER,
    goal_land: DataTypes.FLOAT,
    goal_building: DataTypes.FLOAT,
    goal_rent: DataTypes.FLOAT
  }, {});
  return SalesGoal;
};
