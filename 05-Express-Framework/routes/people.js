const express = require('express');
const router = express.Router();
const peopleController = require('../controllers/peopleController');

// Define routes and map them to controller functions
router.get('/', peopleController.getAllPeople);
router.get('/:name', peopleController.getPersonByName);
router.post('/', peopleController.createPerson);

module.exports = router;
