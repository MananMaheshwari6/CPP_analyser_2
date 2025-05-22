// Try to load mongoose, but provide a mock if not available
let mongoose;
let User;

try {
    mongoose = require('mongoose');

    const userSchema = new mongoose.Schema({
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            minlength: 3,
            maxlength: 20
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
        },
        password: {
            type: String,
            required: true,
            minlength: 6
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        lastLogin: {
            type: Date
        }
    });

    // Only create the model if mongoose is connected
    User = mongoose.models.User || mongoose.model('User', userSchema);

} catch (error) {
    console.log('Mongoose not available, using mock model for User');

    // Create a simple mock if mongoose is not available
    // In-memory storage for users when no DB is available
    const users = [];

    User = {
        findOne: (query) => {
            if (query.username) {
                return Promise.resolve(users.find(user => user.username === query.username));
            }
            if (query.email) {
                return Promise.resolve(users.find(user => user.email === query.email));
            }
            return Promise.resolve(null);
        },
        create: (userData) => {
            const newUser = { ...userData, _id: Math.random().toString(36).substr(2, 9) };
            users.push(newUser);
            return Promise.resolve(newUser);
        },
        findById: (id) => {
            return Promise.resolve(users.find(user => user._id === id));
        }
    };
}

module.exports = User;
