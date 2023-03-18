const express= require("express");
const db = require("../db");
const app = require("../app");
const router = new express.Router();
const ExpressError = require("../expressError");
const User = require("../models/user")

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
        let token = await User.authenticate(username, password);
        // update user login timestamp
        await User.updateLoginTimestamp(username);
        // return message with token
        return res.json({msg: `Logged in!`, token});
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
        const { username, password, first_name, last_name, phone } = req.body;
        if(!username || !password || !first_name || !last_name || !phone) {
            throw new ExpressError(`All fields required!`, 400);
        }
        let user = await User.register({username, password, first_name, last_name, phone});
        return res.json(user);
    } catch(e) {
        return next(e);
}
})

module.exports = router;