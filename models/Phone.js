const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PhoneSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    brand: {
        type: String,
        required: true,
    },
    image: {
        type: String,
    },
    stock: {
        type: Number,
        required: true,
        default: 0,
    },
    seller: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    disabled: {
        type: String,
        default: '',
    },
    __v: {
        type: Number,
    },
    reviews: [
        {
            reviewer: {
                type: Schema.Types.ObjectId,
                ref: 'User',
                required: true,
            },
            rating: {
                type: Number,
                required: true,
            },
            comment: {
                type: String,
                default: '<User left no comment in review.>',
            },
        },
    ],
});

/*
 * Database function to retrieve all phones
 * Params: none
 * Returns: array of all phones in the database
 */
PhoneSchema.statics.getAllPhones = async () => {
    try {
        const res = await Phone.find({});
        return res;
    } catch (err) {
        console.error(err);
    }
};

/*
 * Database function to retrieve up to N phones
 * Params:
 *  @param: { number } limit    Limit of N phones to retrieve
 * Returns: array of at most :limit: phones in the database
 */
PhoneSchema.statics.getNPhones = async (limit) => {
    try {
        const res = await Phone.find({}).limit(limit);
        return res;
    } catch (err) {
        console.error(err);
    }
};

/*
 * Database function to retrieve up to N phones by brand
 * Params:
 *  @param: { string } brand    Brand to be searched (exact match)   
 *  @param: { number } limit    Limit of N phones to retrieve
 * Returns: array of at most :limit: phones in the database
 *          with brand exactly matching :brand:
 */
PhoneSchema.statics.getPhonesByBrand = async (brand, limit) => {
    try {
        const res = await Phone.find({ brand }).limit(limit);
        return res;
    } catch (err) {
        console.error(err);
    }
};

/*
 * Database function to retrieve up to N phones by stock level
 * Params:
 *  @param: { number }     stockMin    Minimum amount of stock to filter phones by   
 *  @param: { number }     limit       Limit of N phones to retrieve
 *  @param: { number = 1 } asc         Order of returned results by stock
 * Returns: array of at most :limit: phones in the database
 *          with stock level higher than or equal to :stockMin: and
 *          sorted in order based on stock (1 => ascending, -1 => descending)
 */
PhoneSchema.statics.getPhonesByStock = async (stockMin, limit, asc = 1) => {
    try {
        const res = await Phone.find({
            stock: { $gte: stockMin },
            disabled: '',
        })
            .sort([['stock', asc]])
            .limit(limit);
        return res;
    } catch (err) {
        console.error(err);
    }
};

/*
 * Database function to retrieve all phones by case-insensitive name search
 * Params:
 *  @param: { string }     name        Substring to search phone names   
 *  @param: { number = 1 } asc         Order of returned results by stock
 * Returns: array all phones in the database with case-insensitive substring
 *          matching :name: and sorted in order based on the name 
 *          (1 => ascending, -1 => descending)
 */
PhoneSchema.statics.getPhonesByName = async (name, asc = 1) => {
    try {
        const res = await Phone.find({
            title: { $regex: name, $options: 'i' },
            disabled: '',
        }).sort([['title', asc]]);
        return res;
    } catch (err) {
        console.error(err);
    }
};

/*
 * Database function to retrieve up to N phones by seller
 * Params:
 *  @param: { string }     seller      The seller ID of the phone   
 *  @param: { number }     limit       Limit of N phones to retrieve
 * Returns: array of at most :limit: phones in the database
 *          matching the unique seller id :seller:, also
 *          populates the reviews and seller details by their ID
 */
PhoneSchema.statics.getPhonesBySeller = async (seller, limit) => {
    try {
        const res = await Phone.find({
            seller: seller,
        })
            .populate('seller')
            .populate('reviews.reviewer')
            .limit(limit);
        return res;
    } catch (err) {
        console.error(err);
    }
};

/*
 * Database function to retrieve up to N phones by the average rating
 * Params:
 *  @param: { number }          limit   Limit of N phones to retrieve
 *  @param: { number = -1 }     asc     Order of returned results by average rating
 * Returns: array of at most :limit: phones in the database
 *          based on and sorted by their average rating, by default in
 *          descending order. Also populates the reviews and seller details
 *          by their ID. Includes the average rating and number of reviews.
 */
PhoneSchema.statics.getPhonesByRating = async (limit, asc = -1) => {
    try {
        const res = await Phone.aggregate([
            {
                $match: {
                    disabled: '',
                    'reviews.1': { $exists: true },
                },
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    brand: 1,
                    image: 1,
                    stock: 1,
                    seller: 1,
                    price: 1,
                    reviews: 1,
                    avgRating: { $avg: '$reviews.rating' },
                    numReviews: { $size: '$reviews.rating' },
                },
            },
        ])
            .sort({ avgRating: asc })
            .limit(limit);
        return res;
    } catch (err) {
        console.error(err);
    }
};

/*
 * Database function to retrieve a phone by the unique phone ID
 * Params:
 *  @param: { string }      id   The unique phone ID to search for
 * Returns: a single object representing the phone with unique ID :id: 
 *          with seller and reviewer information populated
 */
PhoneSchema.statics.getPhoneById = async (id) => {
    try {
        const res = await Phone.findById(id)
            .populate('seller')
            .populate('reviews.reviewer')
            .exec();
        return res;
    } catch (err) {
        console.error(err);
    }
};

/*
 * Database function to retrieve all unique phone brands in the database
 * Params:
 *  @param: none
 * Returns: an array of strings of unique brands of every phone in the 
 *          database, sorted in lexicographical order
 */
PhoneSchema.statics.getBrands = async () => {
    try {
        const res = await Phone.find().distinct('brand');
        res.sort();
        return res;
    } catch (err) {
        console.error(err);
    }
};

/*
 * Database setter function to submit a review entry to a phone instance
 * Params:
 *  @param: { number }      id              Phone ID to submit review to
 *  @param: { number }      userId          User ID to attribute review to
 *  @param: { number }      reviewRating    An integer rating of the phon
 *  @param: { string }      reviewBody      The text body of the review
 * Returns: the object represented the updated Phone instance with an id
 *          matching :id: which a review is submitted to. The review will
 *          be attributed to the user with id matching :userId: and will have
 *          a rating :reviewRating: and review content :reviewBody:
 */
PhoneSchema.statics.submitReview = async (
    id,
    userId,
    reviewRating,
    reviewBody
) => {
    try {
        const phone = await Phone.findById(id);

        // Manually define the review as we don't have Review schema for this
        // one-off function. Refactor this if we need to do multiple Review
        // operations in the future
        const reviewer = mongoose.Types.ObjectId(userId);
        const rating = Number(reviewRating);
        const comment = reviewBody;

        const newReview = { reviewer, rating, comment };

        phone.reviews.push(newReview);

        const res = await phone.save();

        return res;
    } catch (err) {
        console.error(err);
    }
};

/*
 * Database setter function to adjust stock quantity for a particular phone 
 * Params:
 *  @param: { number }      id              Phone ID to be adjusted
 *  @param: { number }      quantity        The stock level to be added 
 *                                          (can be negative)
 * Returns: the object represented the updated Phone instance with an id
 *          matching :id: where the stock level has been adjusted by an amount
 *          :quantity:. This amount :quantity: is always added to the existing
 *          stock level, so removing stock requires passing a negative value
 *          via :quantity:
 */
PhoneSchema.statics.adjustStock = async (id, quantity) => {
    try {
        const phone = await Phone.findById(id);
        phone.stock += quantity;
        let res = await phone.save();
        return res;
    } catch (err) {
        console.error(err);
    }
};

const Phone = mongoose.model('phone', PhoneSchema, 'phonelisting');

module.exports = Phone;
