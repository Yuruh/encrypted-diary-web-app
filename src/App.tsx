import React, {ErrorInfo, Suspense} from 'react';
import './App.css';
import Api from "./Api";
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Redirect
} from "react-router-dom";
import {
    createMuiTheme,
    ThemeProvider,
} from '@material-ui/core/styles';
import {blueGrey, indigo} from "@material-ui/core/colors";
import Header from "./Header";
import {useDispatch} from "react-redux";
import {axiosError} from "./redux/reducers/root";
import AxiosErrorHandler from "./utils/AxiosErrorHandler";
import EntryFilterDrawer from "./entry/EntryFilterDrawer";
import {BoxCenter} from "./BoxCenter";

const EntryList = React.lazy(() => import('./EntryList'));
const Page = React.lazy(() => import('./entry/Page'));
const Register = React.lazy(() => import('./Register'));
const Login = React.lazy(() => import('./login/Login'));
const LabelList = React.lazy(() => import('./label/LabelList'));
const Account = React.lazy(() => import('./Account'));

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
                fontSize: "1rem"
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
// Todo instead of running a dummy request, check token expiration date
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

class ErrorBoundary extends React.Component<{}, {hasError: boolean}> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false };
    }

    // Update state so we display fallback UI
    static getDerivedStateFromError(error: Error) {
        // TODO different display for different errors (chunk not loaded / logic error for instance)
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // TODO Log to sentry
    }
    render() {
        if (this.state.hasError) {
            // TODO show a nice display
            return <BoxCenter>
                <h1>Something went wrong.</h1>
                <h2>Please Reload.</h2>
                <h3>Sorry.</h3>
                <h4>Thank you.</h4>
            </BoxCenter>
        }
        return this.props.children;
    }
}

const App = () => {
    return (
        <ErrorBoundary>
            <Router>
                <ThemeProvider theme={theme}>
                    <AxiosErrorHandler/>
                    <EndSession/>
                    <Header content={
                        <div>
                            <Suspense fallback={<h3>Loading ...</h3>}>
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
                                    <PrivateRoute component={WrappedEntryList} path="/entries"/>
                                    <PrivateRoute component={LabelList} path="/labels"/>
                                    <PrivateRoute component={Account} path="/account"/>
                                    <PrivateRoute component={WrappedEntryList} path="/"/>
                                    <Redirect to='/entries' />
                                </Switch>
                            </Suspense>
                        </div>
                    }/>
                </ThemeProvider>
            </Router>
        </ErrorBoundary>
    );
};

function WrappedEntryList() {
    return <EntryFilterDrawer>
        <EntryList/>
    </EntryFilterDrawer>
}

export default App;