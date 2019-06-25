import React from "react";
import { GoogleLogin, GoogleLogout } from "react-google-login";
import "./App.css";
import Board from "./Board";

export default class App extends React.Component {
  state = {
    data: [],
    user: null
  };

  callBackend = async url => {
    const { user } = this.state;
    const headers = user ? { Authorization: `Bearer ${user.idToken}` } : {};
    const response = await fetch(url, { headers: headers });
    const body = await response.json();

    if (response.status !== 200) {
      throw Error(body.message);
    }
    return body;
  };

  getImages = async () => {
    const { user } = this.state;
    const headers = user ? { Authorization: `Bearer ${user.idToken}` } : {};
    const response = await fetch("/images", { headers: headers });

    if (response.ok) {
      return await response.json();
    } else {
      return response.body;
    }
  };

  onSignIn = googleUser => {
    const profile = googleUser.getBasicProfile();
    const user = {
      idToken: googleUser.tokenId,
      id: profile.getId(),
      givenName: profile.getGivenName(),
      familyName: profile.getFamilyName(),
      imageUrl: profile.getImageUrl()
    };
    this.setState({ user });
    console.log(`${user.givenName} ${user.familyName} (ID:${user.id}) signed in`);

    this.callBackend("/images")
      .then(data => this.setState({ data }))
      .catch(err => console.error(err));
  };

  onSignOut = () => {
    const { user } = this.state;
    console.log(`${user.givenName} ${user.familyName} (ID:${user.id}) signed out`);
    this.setState({ user: null });
  };

  render() {
    const signInButton = this.state.user ? (
      <GoogleLogout onLogoutSuccess={this.onSignOut} buttonText="Sign out" />
    ) : (
      <GoogleLogin
        clientId="551119125116-6300399vra3kiv0cgud65ag9rgbqbt0o.apps.googleusercontent.com"
        onSuccess={this.onSignIn}
        onFailure={err => console.error(`Sign in failed: ${err.error}`)}
        buttonText="Sign in"
        isSignedIn={true} // Try to auto sign in the user on page load
      />
    );

    return (
      <div className="App">
        <h1>Moodboard</h1>
        {signInButton}
        <Board images={this.state.data} />
      </div>
    );
  }
}
