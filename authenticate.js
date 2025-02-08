require("dotenv").config();
const express = require('express');
const User = require('./models/user');
const bcrypt = require('bcrypt');
var crypto=require('crypto');
var algorithm = 'aes256';
var key=process.env.secretkey;


function extractToken(req) {
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
        return req.headers.authorization.split(' ')[1];
    } else if (req.query && req.query.token) {
        return req.query.token;
    }
    return null;
}

exports.verifyUser = async (req, res, next) => {
    try {
        const token = extractToken(req);
        if (!token) {
            return res.status(401).json({
                error: "Authentication failed",
                msg: "Authentication token missing"
            });
        }

        const user = await User.findOne({ 'tokens.token': token });
        if (!user) {
            return res.status(401).json({
                error: "Authentication failed",
                msg: "Invalid or expired token"
            });
        }

        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(401).json({
            error: "Authentication failed",
            msg: "Invalid token",
            details: error.message
        });
    }
}

exports.verifyAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            error: "Authentication failed",
            msg: "User not authenticated"
        });
    }

    if (!req.user.admin) {
        return res.status(403).json({
            error: "Authorization failed",
            msg: "Admin access required"
        });
    }

    next();
}

exports.isVerifiedUser = async (req, res, next) => {
    try {
        if (!req.body.email) {
            return res.status(400).json({
                error: "Validation failed",
                msg: "Email is required"
            });
        }

        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).json({
                error: "Authentication failed",
                msg: "User not found"
            });
        }

        if (!user.isVerified) {
            return res.status(403).json({
                error: "Authentication failed",
                msg: "Account not verified"
            });
        }

        next();
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({
            error: "Verification failed",
            msg: "Internal server error",
            details: error.message
        });
    }
}