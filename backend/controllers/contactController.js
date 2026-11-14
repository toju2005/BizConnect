
const Contact = require("../models/contact.js");

// CREATE CONTACT
const createContact = async (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            company,
            jobTitle,
            category,
            status,
            address,
            notes,
            followUpDate
        } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                message: "Contact name is required."
            });
        }

        const contact = await Contact.create({
            owner: req.user._id,
            name,
            email,
            phone,
            company,
            jobTitle,
            category,
            status,
            address,
            notes,
            followUpDate: followUpDate || null
        });

        res.status(201).json({
            message: "Contact created successfully.",
            contact
        });

    } catch (error) {
        res.status(400).json({
            message: "Unable to create contact.",
            error: error.message
        });
    }
};

// GET ALL CONTACTS + SEARCH + FILTER + PAGINATION
const getContacts = async (req, res) => {
    try {
        const {
            search,
            category,
            status,
            page = 1,
            limit = 10
        } = req.query;

        const currentPage = Math.max(1, Number(page) || 1);
        const pageSize = Math.min(100, Math.max(1, Number(limit) || 10));

        const filter = {
            owner: req.user._id
        };

        if (category) {
            filter.category = category;
        }

        if (status) {
            filter.status = status;
        }

        if (search) {
            const safeSearch = search.replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&"
            );

            filter.$or = [
                { name: { $regex: safeSearch, $options: "i" } },
                { email: { $regex: safeSearch, $options: "i" } },
                { company: { $regex: safeSearch, $options: "i" } }
            ];
        }

        const total = await Contact.countDocuments(filter);

        const contacts = await Contact.find(filter)
            .sort({ createdAt: -1 })
            .skip((currentPage - 1) * pageSize)
            .limit(pageSize);

        res.status(200).json({
            contacts,
            pagination: {
                total,
                page: currentPage,
                limit: pageSize,
                totalPages: Math.ceil(total / pageSize)
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Unable to fetch contacts.",
            error: error.message
        });
    }
};

// GET SINGLE CONTACT
const getContactById = async (req, res) => {
    try {
        const contact = await Contact.findOne({
            _id: req.params.id,
            owner: req.user._id
        });

        if (!contact) {
            return res.status(404).json({
                message: "Contact not found."
            });
        }

        res.status(200).json({ contact });

    } catch (error) {
        res.status(400).json({
            message: "Invalid contact ID."
        });
    }
};

// UPDATE CONTACT
const updateContact = async (req, res) => {
    try {
        const allowedFields = [
            "name",
            "email",
            "phone",
            "company",
            "jobTitle",
            "category",
            "status",
            "address",
            "notes",
            "followUpDate"
        ];

        const updates = {};

        allowedFields.forEach((field) => {
            if (Object.prototype.hasOwnProperty.call(req.body, field)) {
                updates[field] = req.body[field];
            }
        });

        if (updates.name !== undefined && !updates.name.trim()) {
            return res.status(400).json({
                message: "Contact name cannot be empty."
            });
        }

        const contact = await Contact.findOneAndUpdate(
            {
                _id: req.params.id,
                owner: req.user._id
            },
            updates,
            {
                new: true,
                runValidators: true
            }
        );

        if (!contact) {
            return res.status(404).json({
                message: "Contact not found."
            });
        }

        res.status(200).json({
            message: "Contact updated successfully.",
            contact
        });

    } catch (error) {
        res.status(400).json({
            message: "Unable to update contact.",
            error: error.message
        });
    }
};

// DELETE CONTACT
const deleteContact = async (req, res) => {
    try {
        const contact = await Contact.findOneAndDelete({
            _id: req.params.id,
            owner: req.user._id
        });

        if (!contact) {
            return res.status(404).json({
                message: "Contact not found."
            });
        }

        res.status(200).json({
            message: "Contact deleted successfully."
        });

    } catch (error) {
        res.status(400).json({
            message: "Invalid contact ID."
        });
    }
};

module.exports = {
    createContact,
    getContacts,
    getContactById,
    updateContact,
    deleteContact
};
