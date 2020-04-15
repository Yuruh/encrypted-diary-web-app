import React from "react";
import {Button, createStyles, fade, Theme} from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import makeStyles from "@material-ui/core/styles/makeStyles";
import AppBar from "@material-ui/core/AppBar";
import {Link, useHistory} from "react-router-dom";
import {Menu, Search} from "@material-ui/icons";
import Api from "./Api";
import InputBase from "@material-ui/core/InputBase";
import AppDrawer from "./AppDrawer";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            flexGrow: 1,
            marginBottom: "10px",
        },
        appBar: {
            zIndex: theme.zIndex.drawer + 1,
            transition: theme.transitions.create(['width', 'margin'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
            }),
        },
        menuButton: {
            marginRight: theme.spacing(2),
        },
        grow: {
            flexGrow: 1,
        },
        search: {
            position: 'relative',
            flexGrow: 1,
            maxWidth: "400px",
            borderRadius: theme.shape.borderRadius,
            backgroundColor: fade(theme.palette.common.white, 0.15),
            '&:hover': {
                backgroundColor: fade(theme.palette.common.white, 0.25),
            },
            marginRight: theme.spacing(2),
            marginLeft: 0,
            width: '100%',
            [theme.breakpoints.up('sm')]: {
                marginLeft: theme.spacing(3),
                width: 'auto',
            },
        },
        searchIcon: {
            padding: theme.spacing(0, 2),
            height: '100%',
            position: 'absolute',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
        inputRoot: {
            color: 'inherit',
            width: "100%"
        },
        inputInput: {
            padding: theme.spacing(1, 1, 1, 0),
            // vertical padding + font size from searchIcon
            paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
            //transition: theme.transitions.create('width'),
            width: '100%',
        },
    }),
);

// Taken from https://material-ui.com/components/app-bar/#app-bar-with-a-primary-search-field
export default function Header(props: {
    content: JSX.Element
}) {
    const classes = useStyles({});
    const history = useHistory();

    const [open, setOpen] = React.useState(false);

    const loggedIn = Api.token !== "" && Api.token !== null;

    const handleDrawerChange = () => {
        setOpen(!open);
    };

    function redirectHome() {
        history.push("/");
    }

    return <div className={classes.root}>
        <AppBar position="static" className={classes.appBar}>
            <Toolbar>
                <IconButton onClick={handleDrawerChange}
                            className={classes.menuButton}
                            edge="start" color="inherit" aria-label="menu">
                    <Menu/>
                </IconButton>
                <Link to="/">
                    <img src={"/logo512.png"} alt={"logo"} width={40} height={40}/>
                </Link>
                <Typography variant="h6" style={{marginLeft: 10}}>
                    Encrypted diary
                </Typography>
                {loggedIn && <div className={classes.search}>
                    <div className={classes.searchIcon}>
                        <Search/>
                    </div>
                    <InputBase
                        placeholder="Search Entry by Label, Date, Title…"
                        classes={{
                            root: classes.inputRoot,
                            input: classes.inputInput,
                        }}
                        inputProps={{ 'aria-label': 'search' }}
                    />
                </div>}
                <div className={classes.grow}/>
                {loggedIn &&
                <Button color="inherit" onClick={() => {
                    Api.encryptionKey = null;
                    Api.token = null;
                    if (process.env.NODE_ENV === "development") {
                        localStorage.clear();
                    }
                    console.log(Api.token)
                    redirectHome();
                }}>Logout</Button>}
            </Toolbar>
        </AppBar>
        {loggedIn ? <AppDrawer open={open} changeOpen={(value) => setOpen(value)} content={props.content}/>
            : <div>{props.content}</div>}
    </div>
}