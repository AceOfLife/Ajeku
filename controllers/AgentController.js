// controllers/AgentController.js
const { Agent } = require('../models');

exports.getAllAgents = async (req, res) => {
  try {
    const agents = await Agent.findAll();
    res.status(200).json(agents);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving agents', error });
  }
};

exports.createAgent = async (req, res) => {
  try {
    const newAgent = await Agent.create(req.body);
    res.status(201).json(newAgent);
  } catch (error) {
    res.status(400).json({ message: 'Error creating agent', error });
  }
};

exports.updateAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await Agent.update(req.body, { where: { id } });

    if (updated) {
      const updatedAgent = await Agent.findOne({ where: { id } });
      res.status(200).json(updatedAgent);
    } else {
      res.status(404).json({ message: 'Agent not found' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Error updating agent', error });
  }
};

exports.deleteAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Agent.destroy({ where: { id } });

    if (deleted) {
      res.status(204).json({ message: 'Agent deleted' });
    } else {
      res.status(404).json({ message: 'Agent not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting agent', error });
  }
};
