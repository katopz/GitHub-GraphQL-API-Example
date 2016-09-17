import React, { Component } from 'react';

import { ApolloProvider } from 'react-apollo';
import {login} from './githubLogin';

import ApolloClient, { createNetworkInterface } from 'apollo-client';

import Repository from './repository';
import Issue from './issue';

import { username, password } from './config';

let TOKEN = null;

const networkInterface = createNetworkInterface('https://api.github.com/graphql');

networkInterface.use([{
  applyMiddleware(req, next) {
    if (!req.options.headers) {
      req.options.headers = {};  // Create the header object if needed.
    }

    // Send the login token in the Authorization header
    req.options.headers.authorization = `Bearer ${TOKEN}`;
    next();
  }
}]);

const client = new ApolloClient({
  networkInterface,
});

export default class App extends Component {
  constructor() {
    super();
    this.state = { login: false };
  }
  componentDidMount() {
    if (username === 'xxx') {
      throw new Error('Please create a config.js your username and password.');
    }
    login(username, password).then((token) => {
      TOKEN = token;
      this.setState({ login: true });
    });
  }
  routeForIssue(id, title) {
    return {
      title,
      component: Issue,
      passProps: {
        id,
      },
    };
  }
  routeForRepository(login, name) {
    return {
      title: `${login}/${name}`,
      component: Repository,
      passProps: {
        login,
        name,
        goToIssue: (id, title) => {
          this.refs.nav.push(this.routeForIssue(id, title));
        }
      },
    };
  }
  render() {
    const _routeForRepository = this.routeForRepository('apollostack', 'apollo-client');
    console.log('_routeForRepository:', _routeForRepository);
    return this.state.login ? (
      <ApolloProvider client={client}>
        <Repository {..._routeForRepository} />
      </ApolloProvider>
    ) : <p>Logging in...</p>;
  }
}