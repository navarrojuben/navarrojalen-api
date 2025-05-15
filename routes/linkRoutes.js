const express = require('express')
const {
  createLink,
  getLinks,
  getLink,
  deleteLink,
  updateLink
} = require('../controllers/linkController')

const router = express.Router()



// GET all links
router.get('/', getLinks)

//GET a single link
router.get('/:id', getLink)

// POST a new link
router.post('/', createLink)

// DELETE a link
router.delete('/:id', deleteLink)

// UPDATE a link
router.patch('/:id', updateLink)


module.exports = router