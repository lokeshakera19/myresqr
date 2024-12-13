const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const multer = require('multer');
const mongoose = require('mongoose');
const fs = require('fs');
const QRCode = require('qrcode');
const bcrypt = require('bcrypt'); // For password hashing
const twilio = require('twilio');

const app = express();//jyfydyu
const PORT = 3000;//jyfjyfu

// Twilio credentials
const accountSid = 'AC055f7e77554d9e2e0b20345b59422c64'; // Replace with your Account SID
const authToken = 'f4f629c374370072a6245c85ec9d5f04'; // Replace with your Auth Token
const client = twilio(accountSid, authToken);

// Middleware to parse incoming requests
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Static folder to serve HTML, CSS, JS, etc.
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/qrcodes', express.static(path.join(__dirname, 'public/qrcodes')));

// Set EJS as the templating engine
app.set('view engine', 'ejs');


mongoose.connect('mongodb+srv://LokeshAkera:fy1lRW8OzlCIJxdV@cluster1.c46ua.mongodb.net/', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then(() => {
    console.log('Connected to MongoDB Atlas');
  }).catch((err) => {
    console.error('Failed to connect to MongoDB Atlas', err);
  });
  
// Multer storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Mongoose schema for form data
const formSchema = new mongoose.Schema({
    username: String,
    passkey: String,
    fullName: String,
    photo: String,
    aadharUpload: String,
    licenseUpload: String,
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
    emergencyName: String,
    emergencyPhone: String,
    emergencyRelation: String,
    userPageURL: String,
    qrCodePath: String,
    createdAt: { type: Date, default: Date.now }
});
const FormData = mongoose.model('FormData', formSchema);

// Schema for user registration
const userSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    password: String
});
const User = mongoose.model('User', userSchema);

// Ensure the QR code directory exists
const qrCodeDir = path.join(__dirname, 'public', 'qrcodes');
if (!fs.existsSync(qrCodeDir)) {
    fs.mkdirSync(qrCodeDir, { recursive: true });
}

// Registration route
app.post('/register', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = new User({
            username: req.body.username,
            password: hashedPassword
        });
        await user.save();
        res.send("Registration successful! You can now log in.");
    } catch (err) {
        console.error('Error registering user:', err);
        res.status(500).send("Registration failed. Username may already be taken.");
    }
});

// Login route
app.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username });
        if (user && await bcrypt.compare(req.body.password, user.password)) {
            res.redirect('/Home.html'); // Redirect to Home.html on successful login
        } else {
            res.status(400).send("Invalid username or password");
        }
    } catch (err) {
        console.error('Error logging in user:', err);
        res.status(500).send("Error logging in");
    }
});

// Serve Home page after login
app.get('/Home.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Home.html'));
});

// Serve the registration page at the root path "/"
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'resqr.html')); // Serve the registration page
});

// POST request to handle form submission and file uploads
app.post('/submitForm', upload.fields([
    { name: 'photoUpload', maxCount: 1 },
    { name: 'aadharUpload', maxCount: 1 },
    { name: 'licenseUpload', maxCount: 1 },
    { name: 'healthReportUpload', maxCount: 1 }
]), (req, res) => {
    const uniqueURL = `https://rescueqr.life/user/${req.body.username}-${Date.now()}`;
    const qrCodeFilename = `${req.body.username}-${Date.now()}.png`;

   const formData = {
        username: req.body.username,
        passkey: req.body.passkey,
        fullName: req.body.fullName,
        photo: req.files['photoUpload'] ? req.files['photoUpload'][0].path : '',
        aadharUpload: req.files['aadharUpload'] ? req.files['aadharUpload'][0].path : '',
        licenseUpload: req.files['licenseUpload'] ? req.files['licenseUpload'][0].path : '',
        vehicleType: req.body.vehicleType,
        fatherName: req.body.fatherName,
        motherName: req.body.motherName,
        permanentAddress: req.body.permanentAddress,
        temporaryAddress: req.body.temporaryAddress,
        officeAddress: req.body.officeAddress,
        phoneNumber: req.body.phoneNumber,
        bloodGroup: req.body.bloodGroup,
        gender: req.body.gender,
        hasCancer: req.body.hasCancer === 'on',
        isHandicapped: req.body.isHandicapped === 'on',
        isDiabetic: req.body.isDiabetic === 'on',
        healthReport: req.files['healthReportUpload'] ? req.files['healthReportUpload'][0].path : '',
        emergencyName: req.body.emergencyName,
        emergencyPhone: req.body.emergencyPhone,
        emergencyRelation: req.body.emergencyRelation,
        userPageURL: uniqueURL, // Full URL saved
        qrCodePath: `qrcodes/${qrCodeFilename}`
};


    const newFormData = new FormData(formData);
    newFormData.save()
        .then(() => {
            QRCode.toFile(path.join(qrCodeDir, qrCodeFilename), uniqueURL)
                .then(() => {
                    res.redirect(uniqueURL);
                })
                .catch((err) => {
                    console.error('Error generating QR code:', err);
                    res.status(500).send('Error generating QR code');
                });
        })
        .catch((err) => {
            console.error('Error saving form data:', err);
            res.status(500).send('Error saving form data');
        });
});

app.post('/submitForm', upload.fields([{ name: 'photoUpload' }, { name: 'aadharUpload' }, { name: 'licenseUpload' }, { name: 'healthReportUpload' }]), async (req, res) => {
    try {
        // Extract form data and construct user URL
        const userPageURL = `https://rescueqr.life/user/${req.body.username}`;
        const qrCodePath = path.join('/qrcodes', `${req.body.username}-qr.png`);

        // Generate QR Code
        await QRCode.toFile(path.join(__dirname, 'public', qrCodePath), userPageURL);
      

        // Save data to MongoDB
        const formData = new FormData({
            ...req.body,
            userPageURL,
            qrCodePath
        });
        await formData.save();

        // Return QR code path for frontend display
        res.json({ success: true, qrCodePath });
    } catch (error) {
        console.error('Error submitting form:', error);
        res.status(500).send("Form submission failed.");
    }
});



// Route to send SMS with user location
app.post('/send-location', (req, res) => {
    const { username, latitude, longitude } = req.body; // Get data from the request body

    // Validate that latitude and longitude are provided
    if (!latitude || !longitude) {
        return res.status(400).json({ error: 'Latitude and Longitude are required.' });
    }

    const locationLink = `https://www.google.com/maps?q=${latitude},${longitude}`; // Create Google Maps link
    const messageBody = `${username} has met with an accident at Location: ${locationLink}. Please inform to the nearest hospitals`; // Message format 

    // Send SMS via Twilio
    client.messages
        .create({
            body: messageBody,
            from: '+13612735212', // Replace with your Twilio number
            to: '+916301437823' // Replace with your personal number
        })
        .then(message => {
            console.log(`Message sent: ${message.sid}`); // Log message SID
            res.status(200).send('Location sent successfully'); // Respond with success
        })
        .catch(error => {
            console.error('Error sending message:', error); // Log any error
            res.status(500).send('Failed to send location'); // Respond with error
        });
});

app.post('/send-locationtofamily', (req, res) => {
    const { username, latitude, longitude } = req.body; // Get data from the request body

    // Validate that latitude and longitude are provided
    if (!latitude || !longitude) {
        return res.status(400).json({ error: 'Latitude and Longitude are required.' });
    }

    const locationLink = `https://www.google.com/maps?q=${latitude},${longitude}`; // Create Google Maps link
    const messageBody = `${username} has met with an accident at Location: ${locationLink}. Please inform their family members.`; // Message format 

    // Send SMS via Twilio
    client.messages
        .create({
            body: messageBody,
            from: '+13612735212', // Replace with your Twilio number
            to: '+916301437823' // Replace with your personal number
        })
        .then(message => {
            console.log(`Message sent: ${message.sid}`); // Log message SID
            res.status(200).send('Location sent successfully'); // Respond with success
        })
        .catch(error => {
            console.error('Error sending message:', error); // Log any error
            res.status(500).send('Failed to send location'); // Respond with error
        });
});



// Route to display user details based on the unique URL
app.get('/user/:username', (req, res) => {
    const username = req.params.username;
    const fullURL = `https://rescueqr.life/user/${username}`;  // Construct the full URL

    FormData.findOne({ userPageURL: fullURL })
        .then((userData) => {
            if (!userData) {
                return res.status(404).send('User not found');
            }
            res.render('userProfile', { userData });
        })
        .catch((err) => {
            console.error('Error retrieving user data:', err);
            res.status(500).send('Error retrieving user data');
        });
});

app.get('/generate-qr/:username', async (req, res) => {
    const username = req.params.username;
    const userPageURL = `https://rescueqr.life/user/${username}`;
    const qrCodeFilename = `${username}-profile-qr.png`;
    const qrCodePath = path.join(qrCodeDir, qrCodeFilename);

    try {
        // Generate high-quality QR code with options
        await QRCode.toFile(qrCodePath, userPageURL, {
            errorCorrectionLevel: 'H', // High error correction
            type: 'png',
            quality: 1, // Highest quality
            margin: 1, // Minimal margin
            scale: 10, // Higher resolution
        });

        // Send the file as a downloadable attachment
        res.download(qrCodePath, qrCodeFilename, (err) => {
            if (err) {
                console.error('Error sending file:', err);
                res.status(500).send('Error generating QR code for download');
            }
        });
    } catch (error) {
        console.error('Error generating QR code:', error);
        res.status(500).send('Error generating QR code');
    }
});


// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
