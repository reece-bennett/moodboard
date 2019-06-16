import React from "react";
import { GoogleLogin, GoogleLogout } from "react-google-login";
import "./App.css";

export default class App extends React.Component {
  state = {
    data: null,
    secret: null,
    user: null
  }

  componentDidMount() {
    this.callBackend("/api")
      .then(res => this.setState({ data: res.message }))
      .catch(err => console.error(err));
  }

  callBackend = async (url) => {
    const { user } = this.state;
    const headers = user ? { "Authorization": `Bearer ${user.idToken}` } : {};
    const response = await fetch(url, { headers: headers });
    const body = await response.json();

    if (response.status !== 200) {
      throw Error(body.message)
    }
    return body;
  }

  onSignIn = (googleUser) => {
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
    
    this.callBackend("/secret")
      .then(res => this.setState({ secret: res.message }))
      .catch(err => console.error(err));
  }

  onSignOut = () => {
    const { user } = this.state;
    console.log(`${user.givenName} ${user.familyName} (ID:${user.id}) signed out`);
    this.setState({ user: null });
  }

  render() {
    const signInButton = this.state.user ?
      (
        <GoogleLogout
          onLogoutSuccess={this.onSignOut}
          buttonText="Sign out"
        />
      ) : (
        <GoogleLogin
          clientId="551119125116-dh8arpi5njabjnqpamp10evsqk0ct87f.apps.googleusercontent.com"
          onSuccess={this.onSignIn}
          onFailure={(err) => console.error(`Sign in failed: ${err.error}`)}
          buttonText="Sign in"
          isSignedIn={true} // Try to auto sign in the user on page load
        />
      );

    return (
      <div className="App">
        <h1>Moodboard</h1>
        {signInButton}
        <p>Data: {this.state.data}</p>
        <p>Secret data: {this.state.secret}</p>
      </div>
      );
  }
}
