import React, {ChangeEvent} from "react";
import Header from "./Header";
import Switch from "@material-ui/core/Switch";
import {createStyles, FormControlLabel, Theme} from "@material-ui/core";
import Container from "@material-ui/core/Container";
import Tooltip from "@material-ui/core/Tooltip";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Api from "./Api";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        tooltip: {
            fontSize: 16,
        },
    }),
);


export default function HomePage() {
    const classes = useStyles({});

    return <div>
        <Header/>
        <p>
            Home Page
        </p>
    </div>
}
