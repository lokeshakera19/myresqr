const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: String,
    passkey: String,
    fullName: String,
    profileImage: String,
    aadharImage: String,
    licenseImage: String,
    vehicleType: String,
    fatherName: String,
    motherName: String,
    permanentAddress: String,
    temporaryAddress: String,
    officeAddress: String,
    phoneNumber: String,
    bloodGroup: String,
    gender: String,
    hasCancer: Boolean,
    isHandicapped: Boolean,
    isDiabetic: Boolean,
    healthReport: String,
    emergencyContacts: [{
        name: String,
        phone: String,
        relation: String
    }]
});

module.exports = mongoose.model('User', userSchema);
