const User = require('../models/User');
const generateToken = require('../utils/generateToken');

const authResponse = (user) => ({
    token: generateToken(user._id),
    user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role
    }
});

const register = async (req, res, next) => {
    try {
        const name = req.body.name?.trim();
        const email = req.body.email?.trim().toLowerCase();
        const password = req.body.password;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email and password are required' });
        }
        if (password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters' });
        }
        if (await User.exists({ email })) {
            return res.status(409).json({ message: 'An account with this email already exists' });
        }

        const user = await User.create({ name, email, password });
        res.status(201).json(authResponse(user));
    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const email = req.body.email?.trim().toLowerCase();
        const password = req.body.password;
        const user = await User.findOne({ email }).select('+password');

        if (!user || !user.password || !(await user.matchesPassword(password || ''))) {
            return res.status(401).json({ message: 'Incorrect email or password' });
        }
        res.json(authResponse(user));
    } catch (error) {
        next(error);
    }
};

const googleLogin = async (req, res, next) => {
    try {
        const { credential } = req.body;
        const clientId = process.env.GOOGLE_CLIENT_ID;
        if (!clientId) return res.status(503).json({ message: 'Google Sign-In is not configured' });
        if (!credential) return res.status(400).json({ message: 'Google credential is required' });

        const response = await fetch(
            `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
        );
        if (!response.ok) {
            return res.status(401).json({ message: 'Google sign-in token is invalid or expired' });
        }
        const payload = await response.json();
        if (payload.aud !== clientId || !payload.email || payload.email_verified !== 'true') {
            return res.status(401).json({ message: 'Google account email could not be verified' });
        }

        let user = await User.findOne({
            $or: [{ googleId: payload.sub }, { email: payload.email.toLowerCase() }]
        });
        if (!user) {
            user = await User.create({
                name: payload.name || payload.email.split('@')[0],
                email: payload.email,
                avatar: payload.picture || '',
                googleId: payload.sub
            });
        } else {
            user.googleId = user.googleId || payload.sub;
            user.avatar = payload.picture || user.avatar;
            await user.save();
        }
        res.json(authResponse(user));
    } catch (error) {
        next(error);
    }
};

const getMe = (req, res) => res.json(authResponse(req.user));

module.exports = { register, login, googleLogin, getMe };
