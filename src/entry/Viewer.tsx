import React from "react";

import "codemirror";
import {createStyles, IconButton, Theme} from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {Entry} from "../models/Entry";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardContent from "@material-ui/core/CardContent";
import {Edit} from "@material-ui/icons";
import {useHistory, useLocation} from "react-router-dom";
const ReactMarkdown = require('react-markdown');

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        prevIcon: {
            transform: "rotate(180deg)"
        },
        preview: {
            [theme.breakpoints.up("md")]: {
                padding: "20px 40px 20px 40px",
            },
            [theme.breakpoints.down("sm")]: {
                padding: "0px",
            },
            overflowWrap: "anywhere"
        },
        date: {
            marginLeft: 40
        }
    }),
);

export default function Viewer(props: {
    entry: Entry
}) {
    const classes = useStyles();
    const location = useLocation();
    const history = useHistory();

    return <Card elevation={2} className={classes.preview}>
        <CardHeader title={new Date(props.entry.created_at).toLocaleDateString()}
                    subheader={props.entry.title}
                    action={<IconButton color={"primary"} onClick={() => {history.push(location.pathname + "?display=edit")}}>
                        <Edit/>
                    </IconButton>}
        />

        <CardContent>
            <ReactMarkdown source={props.entry.content}/>
        </CardContent>
    </Card>
}
