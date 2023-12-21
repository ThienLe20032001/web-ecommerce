const jwt = require('jsonwebtoken');
const { Response } = require("../commons");
const { RESPONSE_CODE, USER_ROLE } = require("../constants");
const { authService } = require("../services");
const { RegisterValidate, LoginValidate } = require("../utils");
const passport = require('passport');

const AuthController = {
    login(req, res, next) {
        try {
            return res.render("login", Response({ res, data: { layout: false } }))
        } catch (error) {
            next(error);
        }
    },
    async doLogin(req, res, next) {
        try {
            const user = await LoginValidate.user.validateAsync(req.body);
            const data = await authService.doLogin(user);
            if (data.error.code == RESPONSE_CODE.SUCCESS) {
                const userObject = data.user.toObject();
                const auth = jwt.sign(userObject, process.env.SECRET_KEY, { expiresIn: 60 * 60 });
                res.cookie("auth", auth);
                if (userObject.type == USER_ROLE.ADMIN) {
                    return res.redirect("/admin");
                } else {
                    return res.redirect("/");
                }
            }
            return res.render("login", Response({ res, data: { layout: false, ...data } }))
        } catch (e) {
            console.error(e);
            return res.render("login", Response({ res, data: { layout: false, error: e.details } }))
        }
    },
    register(req, res, next) {
        try {
            return res.render("register", Response({ res, data: { layout: false } }))
        } catch (error) {
            next(error);
        }
    },
    async doRegister(req, res, next) {
        try {
            const user = await RegisterValidate.user.validateAsync(req.body);
            const data = await authService.doRegister(user);
            if (data.error.code == RESPONSE_CODE.SUCCESS) {
                const userObject = data.user.toObject();
                const auth = jwt.sign(userObject, process.env.SECRET_KEY, { expiresIn: 60 * 60 });
                res.cookie("auth", auth);
                if (userObject.type == USER_ROLE.ADMIN) {
                    return res.redirect("/admin");
                } else {
                    return res.redirect("/");
                }
            }
            return res.render("register", Response({ res, data: { layout: false, ...data } }))
        } catch (e) {
            console.error(e);
            return res.render("register", Response({ res, data: { layout: false, error: e.details } }))
        }
    },
    async doLogout(req, res, next) {
        try {
            res.cookie("auth", null);
            res.redirect('/auth/login');
        } catch (error) {
            next(error);
        }
    },
    loginWithFb: passport.authenticate('facebook'),
    doLoginWithFb: passport.authenticate('facebook', { successRedirect: '/', failureRedirect: '/auth/login' }),
    loginWithGg: passport.authenticate('google', {
        scope: [
            'profile',
            'email'
        ],
    }),
    doLoginWithGg: passport.authenticate('google', { successRedirect: '/', failureRedirect: '/auth/login' }),
}

module.exports = AuthController;