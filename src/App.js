import React from "react";
import { GoogleLogin, GoogleLogout } from "react-google-login";
import Board from "./Board";
import "./App.css";

export default class App extends React.Component {
  state = {
    data: [],
    user: null
  };

  callBackend = async (method, url, payload) => {
    const { user } = this.state;
    const headers = {
      ...(user && { Authorization: `Bearer ${user.idToken}` }),
      ...(payload && { "Content-Type": "application/json" })
    };
    const response = await fetch(url, {
      ...(payload && { body: JSON.stringify(payload) }),
      headers: headers,
      method
    });
    const body = await response.json();

    if (response.status !== 200) {
      throw Error(body.message);
    }
    return body;
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

    this.callBackend("GET", "/images", null)
      .then(data => this.setState({ data }))
      .catch(err => console.error(err));
  };

  onSignOut = () => {
    const { user } = this.state;
    console.log(`${user.givenName} ${user.familyName} (ID:${user.id}) signed out`);
    this.setState({ user: null });
  };

  updateImage = (id, changes) => {
    console.log(`Updating ${id}`);
    return new Promise((resolve, reject) => {
      this.callBackend("PUT", `/images/${id}`, changes)
        .then(newImage => {
          this.setState(state => ({
            data: state.data.map(el => el._id === id ? { ...el, ...newImage } : el)
          }));
          resolve();
        })
        .catch(err => reject(err));
    });
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
        <Board images={this.state.data} onUpdate={this.updateImage} />
      </div>
    );
  }
}
