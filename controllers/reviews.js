const Campground = require('../models/campground');
const Review = require('../models/review');

module.exports.createReview = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Created a new review!');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteReview = async (req, res) => {
    const { id, revid } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: revid } });
    await Review.findByIdAndDelete(revid);
    req.flash('success', 'Successfully Deleted review')
    res.redirect(`/campgrounds/${id}`);
}