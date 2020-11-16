import auth0 from "auth0-js";
import m from "mithril";
import jwt from "jsonwebtoken";

import AUTH0 from "./auth0-variables";

export default class Auth {
  public auth0 = new auth0.WebAuth({
    domain: AUTH0.domain,
    clientID: AUTH0.clientID,
    redirectUri: new URL("/#!/callback", location.origin).href,
    responseType: "token id_token",
    scope: "openid profile email"
  });

  public login() {
    this.auth0.authorize();
  }

  public handleAuthentication() {
    this.auth0.parseHash((err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        this.setSession(authResult);
        m.route.set("/");
      } else if (err) {
        m.route.set("/auth");
        console.error(err);
      }
    });
  }

  public setSession(authResult: any) {
    // Set the time that the Access Token will expire at
    const expiresAt = JSON.stringify(
      authResult.expiresIn * 1000 + new Date().getTime()
    );
    localStorage.setItem("access_token", authResult.accessToken);
    localStorage.setItem("id_token", authResult.idToken);
    localStorage.setItem("expires_at", expiresAt);
    // navigate to the home route
    m.route.set("/");
  }

  public logout() {
    // Clear Access Token and ID Token from local storage
    localStorage.removeItem("access_token");
    localStorage.removeItem("id_token");
    localStorage.removeItem("expires_at");
    // navigate to the default route
    m.route.set("/auth");
  }

  public isAuthenticated() {
    // Check whether the current time is past the
    // Access Token's expiry time
    const expiresAt = JSON.parse(localStorage.getItem("expires_at") || "{}");
    return new Date().getTime() < expiresAt;
  }

  public getJwt(): any {
    const idToken = localStorage.getItem("id_token");
    if (idToken !== null) {
        return jwt.decode(idToken);
    }
    return {};
}
}
