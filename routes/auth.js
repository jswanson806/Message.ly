const express= require("express");
const db = require("../db");
const app = require("../app");
const router = new express.Router();
const ExpressError = require("../expressError");
const User = require("../models/user");
const { SECRET_KEY } = require("../config");
const jwt = require("jsonwebtoken");

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/
router.post('/login', async (req, res, next) => {
    try{
        // deconstruct username and password from req.body
        const { username, password } = req.body;
        // handle empty fields
        if(!username || !password) {
            throw new ExpressError(`Username and Password required`, 400);
        }
        // save token from authentication
        if(await User.authenticate(username, password)) {
            let token = jwt.sign({username}, SECRET_KEY);
            // update user login timestamp
            User.updateLoginTimestamp(username);
            // return message with token
            return res.json({token});
        }
        throw new ExpressError("Invalid username/password", 400);
    } catch(e) {
        return next(e);
    }
})

/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */
router.post('/register', async (req, res, next) => {
    try {
        let { username } = await User.register(req.body);
        let token = jwt.sign({username}, SECRET_KEY);
        User.updateLoginTimestamp(username);
        return res.json({token});
    } catch(e) {
        return next(e);
}
});

module.exports = router;