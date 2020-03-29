import React from "react";
import {Button, createStyles, Theme} from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import makeStyles from "@material-ui/core/styles/makeStyles";
import AppBar from "@material-ui/core/AppBar";
import {Link, useHistory} from "react-router-dom";
import {Home} from "@material-ui/icons";
import Api from "./Api";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            flexGrow: 1,
            marginBottom: "10px",
        },
        menuButton: {
            marginRight: theme.spacing(2),
        },
        title: {
            flexGrow: 1,
        },
    }),
);

export default function Header() {
    const classes = useStyles({});
    const history = useHistory();

    function redirectHome() {
        history.push("/");
    }

    return <div className={classes.root}>
        <AppBar position="static">
            <Toolbar>
                <IconButton onClick={redirectHome} className={classes.menuButton} edge="start" color="inherit" aria-label="menu">
                    <Home/>
                </IconButton>
                <Typography variant="h6" className={classes.title}>
                    Encrypted diary
                </Typography>
                <Button color="inherit" onClick={() => {
                    Api.encryptionKey = null;
                    Api.token = null;
                    redirectHome()
                }}>Logout</Button>
            </Toolbar>
        </AppBar>
    </div>
}