const mongoose = require('mongoose');


//Image Schema
const ImageSchema = mongoose.Schema({
    name: {
        type: String
    },
    filename: {
        type: String
    },
    uploadDate: {
        type: Date
    }
});

const Image = module.exports = mongoose.model('Image', ImageSchema);
