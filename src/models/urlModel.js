const mongoose = require('mongoose')

const urlSchema = new mongoose.Schema({

	urlCode: {
		type: String,
		unique: true,
		lowercase: true,
		trim: true
	},
	longUrl: {
		type: String,
		required: true,
	}, // should be a valid url
	shortUrl: {
		type: String,
		required: true,
		unique: true
	}

}, { timestamps: true })

module.exports = mongoose.model('myURL', urlSchema)