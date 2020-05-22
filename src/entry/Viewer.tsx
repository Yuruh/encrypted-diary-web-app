import React, {useEffect} from "react";

import "codemirror";
import {createStyles, IconButton, Theme} from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {Entry} from "../models/Entry";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardContent from "@material-ui/core/CardContent";
import {Edit} from "@material-ui/icons";
import {useHistory, useLocation} from "react-router-dom";
import EntryLabelList from "../label/EntryLabelList";
import moment from "moment";
import {upperCaseFirstLetter} from "../EntryList";
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

export function formatDate(date: string | Date | number) {
    return upperCaseFirstLetter(moment(date).format("dddd D MMMM YYYY "));
}

export default function Viewer(props: {
    entry: Entry
    onKeyUp: (keyCode: number) => void
}) {
    const classes = useStyles();
    const location = useLocation();
    const history = useHistory();

    function onKeyUp(event: any) {
        if (event.keyCode === 37 || event.keyCode === 39) {
            props.onKeyUp(event.keyCode)
        }
    }

    useEffect(() => {
        window.addEventListener("keyup", onKeyUp);
        return () => window.removeEventListener("keyup", onKeyUp);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    let date = moment(props.entry.created_at).format("dddd D MMMM YYYY ");
    date = upperCaseFirstLetter(date);

    return <Card elevation={2} className={classes.preview}>
        <CardHeader title={date}
                    subheader={props.entry.title}
                    action={<IconButton color={"primary"} onClick={() => {history.push(location.pathname + "?display=edit")}}>
                        <Edit/>
                    </IconButton>}
        />

        <CardContent>
            <EntryLabelList labels={props.entry.labels}/>
            <ReactMarkdown source={props.entry.content}/>
        </CardContent>
    </Card>
}
