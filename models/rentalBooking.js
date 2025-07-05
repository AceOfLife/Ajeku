// models/RentalBooking.js
module.exports = (sequelize, DataTypes) => {
  const RentalBooking = sequelize.define("RentalBooking", {
    user_id: DataTypes.INTEGER,
    property_id: DataTypes.INTEGER,
    rooms_booked: DataTypes.INTEGER,
    amount_paid: DataTypes.FLOAT,
    start_date: DataTypes.DATE,
    end_date: DataTypes.DATE
  });

  return RentalBooking;
};
