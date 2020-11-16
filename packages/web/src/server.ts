import express from "express";
import session from "express-session";
import dotenv from "dotenv";
import passport from "passport";
import { Strategy } from "passport-auth0";
import { mongoClient } from "./server/db/Database";
import userInViews from "./server/middleware/userInViews";
import authRouter from "./server/routes/auth";
import usersRouter from "./server/routes/users";
import apiRouter from "./server/routes/api/api";

interface IMap {
    [key: string]: any;
}

dotenv.config();

const sess = {
    secret: "ObedienceEclair=Crabbing5Country5Aloft/HazelnutWiring",
    cookie: {} as IMap,
    resave: false,
    saveUninitialized: true
};

const strategy = new Strategy(
    {
        domain: process.env.AUTH0_DOMAIN!,
        clientID: process.env.AUTH0_CLIENT_ID!,
        clientSecret: process.env.AUTH0_CLIENT_SECRET!,
        callbackURL:
            process.env.AUTH0_CALLBACK_URL || "http://localhost:5000/callback"
    },
    (accessToken, refreshToken, extraParams, profile, done) => {
        // accessToken is the token to call Auth0 API (not needed in the most cases)
        // extraParams.id_token has the JSON Web Token
        // profile has all the information from the user
        return done(null, profile);
    }
);

passport.use(strategy);

(async () => {
    const app = express();
    app.set("view engine", "ejs");
    await mongoClient.connect();

    if (app.get("env") === "production") {
        // sess.cookie.secure = true; // serve secure cookies, requires https
    }

    app.use(session(sess));
    app.use(passport.initialize());
    app.use(passport.session());

    passport.serializeUser((user, done) => {
        done(null, user);
    });

    passport.deserializeUser((user, done) => {
        done(null, user);
    });

    app.use(userInViews());
    app.use("/", authRouter);
    app.use("/", usersRouter);

    app.use(express.static("public"));
    app.use(express.static("dist"));

    app.use("/api", apiRouter);

    app.get("/", (req, res) => {
        res.render("index", {auth: JSON.stringify({
            name: req.user ? req.user.displayName : null
        })});
    });

    app.listen(process.env.PORT || 5000, () => {
        console.log(`Server listening on ${process.env.PORT || 5000}`);
    });
})();
