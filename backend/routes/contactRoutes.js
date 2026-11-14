
const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
    createContact,
    getContacts,
    getContactById,
    updateContact,
    deleteContact
} = require("../controllers/contactController");

// All contact routes require authentication
router.use(protect);

router.route("/")
    .post(createContact)
    .get(getContacts);

router.route("/:id")
    .get(getContactById)
    .put(updateContact)
    .delete(deleteContact);

module.exports = router;

