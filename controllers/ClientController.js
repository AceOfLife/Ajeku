// controllers/ClientController.js
const { Client } = require('../models');

exports.getAllClients = async (req, res) => {
  try {
    const clients = await Client.findAll();
    res.status(200).json(clients);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving clients', error });
  }
};

exports.createClient = async (req, res) => {
  try {
    const newClient = await Client.create(req.body);
    res.status(201).json(newClient);
  } catch (error) {
    res.status(400).json({ message: 'Error creating client', error });
  }
};

exports.updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await Client.update(req.body, { where: { id } });
    
    if (updated) {
      const updatedClient = await Client.findOne({ where: { id } });
      res.status(200).json(updatedClient);
    } else {
      res.status(404).json({ message: 'Client not found' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Error updating client', error });
  }
};

exports.deleteClient = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Client.destroy({ where: { id } });
    
    if (deleted) {
      res.status(204).json({ message: 'Client deleted' });
    } else {
      res.status(404).json({ message: 'Client not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting client', error });
  }
};
