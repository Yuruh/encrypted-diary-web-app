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
import {useDispatch} from "react-redux";
import {axiosError} from "./redux/reducers/root";
import Account from "./Account";
import AxiosErrorHandler from "./utils/AxiosErrorHandler";

// use this so goland does know what's happening
// function mapStateToProps(state: TypeOfYourRootStore, props: TypeOfYourComponentsProps) {}

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
    overrides: {
        MuiTooltip: {
            tooltip: {
                fontSize: "0.8rem"
            }
        },
        MuiGridListTileBar: {
            title: {
                fontSize: "1.2rem"
            },
            subtitle: {
                fontSize: "1rem"
            }
        },
        MuiSnackbar: {
            root: {
                width: "100%",
            }
        },
        MuiAlert: {
            root: {
                fontSize: "1.3rem",
//                maxWidth: "600px",
 //               flexGrow: 1,
                justifyContent: "center",
                alignItems: "center"
            },
        }
    }
} as any);

// Every 2 minutes we check that the user is still logged in (by checking that a /me does not return 401), otherwise we log him out
function EndSession() {
    const dispatch = useDispatch();

    setInterval(async () => {
        try {
            // To prevent redirection when the user's not logged in (on pages register, about, etc)
            if (Api.encryptionKey !== null) {
                await Api.getAccountInfos()
            }
        } catch (e) {
            dispatch(axiosError(e))
        }
    }, 1000 * 60 * 2);
    return <React.Fragment/>
}

const App = () => {
  return (
      <Router>
          <ThemeProvider theme={theme}>
              <AxiosErrorHandler/>
              <EndSession/>
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
                              <PrivateRoute component={Account} path="/account"/>
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