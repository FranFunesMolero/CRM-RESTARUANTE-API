const express = require('express');
const router = express.Router();
const { 
    // getReviews, 
    getReviewById, 
    updateReview, 
    deleteReview 
} = require('../../../controllers/api/admin/admin.review.controllers');
const { 
    hasOptionalBodyKeys, 
    removeSpacesOfBody,
    idIsNumber
} = require('../../../middlewares/auth');

// Get all reviews
// router.get(
//     '/', 
//     getReviews
// );

// Get a review by ID
router.get(
    '/:id', 
    idIsNumber,
    getReviewById
);

// Update a review
router.put(
    '/:id', 
    idIsNumber,
    hasOptionalBodyKeys(['rating', 'comment']), 
    removeSpacesOfBody(['comment']),
    updateReview
);

// Delete a review
router.delete(
    '/:id', 
    idIsNumber,
    deleteReview
);

module.exports = router;