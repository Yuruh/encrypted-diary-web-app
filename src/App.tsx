import React from 'react';
import './App.css';
import Api from "./Api";
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Redirect
} from "react-router-dom";
import EntryList from "./EntryList";
import {
    createMuiTheme,
    ThemeProvider,
} from '@material-ui/core/styles';
import {blueGrey, indigo} from "@material-ui/core/colors";
import {Register} from "./Register";
import Page from "./entry/Page";
import {Login} from "./Login";
import Header from "./Header";
import LabelList from "./label/LabelList";

// @ts-ignore
const PrivateRoute = ({ component: Component, ...rest }) => (
    <Route {...rest} render={props => {
        const token = Api.token;
        if (!token) {
            // not logged in so redirect to login page with the return url
            return <Redirect to={{ pathname: '/login', state: { from: props.location } }} />
        }

        // authorised so return component
        return <Component {...props} />
    }} />
);

const theme = createMuiTheme({
    palette: {
        primary: indigo,
        secondary: blueGrey
    },
} as any);

const App = () => {
  return (
      <Router>
          <ThemeProvider theme={theme}>
              <Header content={
                  <div>
                      {/* <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
                      <Switch>
                          <Route path="/login">
                              <div style={{
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  flexDirection: "column",
                              }}>
                                  <div style={{marginTop: 50}}>
                                      <Login/>
                                  </div>
                              </div>
                          </Route>
                          <Route path="/register">
                              <div style={{
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  flexDirection: "column",
                              }}>
                                  <div style={{marginTop: 50}}>
                                      <Register/>
                                  </div>
                              </div>
                          </Route>
                          <PrivateRoute component={Page} path="/entries/:id"/>
                          <PrivateRoute component={EntryList} path="/entries"/>
                          <PrivateRoute component={LabelList} path="/labels"/>
                          <PrivateRoute component={EntryList} path="/"/>
                          <Redirect to='/entries' />
                      </Switch>
                  </div>
              }/>

          </ThemeProvider>
      </Router>
  );
};

export default App;