import React from "react";
import Header from "./Header";
import {createStyles, Theme} from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";

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
