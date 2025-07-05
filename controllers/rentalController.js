// controllers/rentalController.js
exports.bookRental = async (req, res) => {
  try {
    const { user_id, property_id, rooms = 1 } = req.body;

    const property = await Property.findByPk(property_id);
    if (!property || !property.isRental || !property.annual_rent) {
      return res.status(400).json({ message: "Invalid rental property" });
    }

    // Calculate already booked rooms
    const totalBooked = await RentalBooking.sum('rooms_booked', {
      where: { property_id }
    });

    const available = property.number_of_rooms - (totalBooked || 0);
    if (rooms > available) {
      return res.status(400).json({ message: "Not enough rooms available" });
    }

    const totalAmount = property.annual_rent * rooms;
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setFullYear(startDate.getFullYear() + 1);

    await RentalBooking.create({
      user_id,
      property_id,
      rooms_booked: rooms,
      amount_paid: totalAmount,
      start_date: startDate,
      end_date
    });

    res.status(200).json({ message: "Rental booked successfully", amount_paid: totalAmount });
  } catch (error) {
    console.error("Rental Booking Error:", error);
    res.status(500).json({ message: "Failed to book rental", error });
  }
};
