import React from "react";
import logo from "./logo.svg";
import "./App.css";

export default class App extends React.Component {
  state = {
    data: null
  }

  componentDidMount() {
    this.callBackend()
    .then(res => this.setState({ data: res.message }))
    .catch(err => console.error(err));
  }

  async callBackend() {
    const response = await fetch("/api");
    const body = await response.json();

    if (response.status !== 200) {
      throw Error(body.message)
    }
    return body;
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
          <p>Data: {this.state.data}</p>
        </header>
      </div>
    );
  }
}
