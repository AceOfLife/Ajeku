// controllers/ReviewController.js
const { Review } = require('../models');

exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.findAll();
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving reviews', error });
  }
};

exports.createReview = async (req, res) => {
  try {
    const newReview = await Review.create(req.body);
    res.status(201).json(newReview);
  } catch (error) {
    res.status(400).json({ message: 'Error creating review', error });
  }
};

exports.updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await Review.update(req.body, { where: { id } });

    if (updated) {
      const updatedReview = await Review.findOne({ where: { id } });
      res.status(200).json(updatedReview);
    } else {
      res.status(404).json({ message: 'Review not found' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Error updating review', error });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Review.destroy({ where: { id } });

    if (deleted) {
      res.status(204).json({ message: 'Review deleted' });
    } else {
      res.status(404).json({ message: 'Review not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting review', error });
  }
};
