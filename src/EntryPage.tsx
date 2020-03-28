import React, {ChangeEvent, useEffect} from "react";
import {createStyles, Theme} from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";

import {
    useParams,
    useLocation
} from "react-router-dom";
import {Entry} from "./models/Entry";
import Api from "./Api";
import Header from "./Header";
import "codemirror";
import {Controlled as CodeMirror} from 'react-codemirror2'
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Fab from "@material-ui/core/Fab";
import AddIcon from "@material-ui/icons/Add";
import {Clear, Done} from "@material-ui/icons";
import TextField from "@material-ui/core/TextField";
const ReactMarkdown = require('react-markdown');
require('codemirror/mode/markdown/markdown');
require('codemirror/lib/codemirror.css');
require('codemirror/theme/material.css');

require("./extend-codemirror.css");

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {

        },
        title: {
            fontSize: 40,
            textAlign: "center",
            //width: "100%"
        },
        preview: {
            height: "100%",
            padding: 5
        },
        fab: {
            margin: 0,
            top: 'auto',
            right: 20,
            bottom: 20,
            left: 'auto',
            position: 'fixed',
        },
        cancelFab: {
            margin: 0,
            top: 'auto',
            right: 100,
            bottom: 20,
            left: 'auto',
            position: 'fixed',
        }
    }),
);

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

//create your forceUpdate hook
function useForceUpdate(){
    const [value, setValue] = React.useState(0); // integer state
    return () => setValue(value => ++value); // update the state to force render
}

// need to do a class for the timeout reset to save changes
export default function EntryPage() {
    const classes = useStyles();
    let { id } = useParams();
    let query = useQuery();
    let display: string | null = query.get("display");

    if (display !== "view" && display !== "edit") {
        display = "view"
    }

    const [entry, setEntry] = React.useState<Entry>(new Entry());
    const [fetching, setFetching] = React.useState(false);
    const forceUpdate = useForceUpdate();
    const fetchData = async() => {
        setFetching(true);
        const result = await Api.getEntry(id || "");
        setEntry({...result.data.entry});
        setFetching(false);
    };

    useEffect(() => {
        fetchData().catch(e => console.log(e));
    }, []);

    function changeEntryContent(editor: any, data: any, value: string) {
        entry.content = value;
        setEntry({...entry})
        //todo timout to save, need conversion to class
    }

    function changeEntryTitle(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        entry.title = event.target.value;
        setEntry({...entry})
    }

    // todo save title on click away (material ui has a clickaway listener)
    return <div>
        <Header/>
        <TextField fullWidth value={entry.title} onChange={changeEntryTitle} variant={"outlined"} className={classes.title}
        inputProps={{
            style: {
                fontSize: 30,
                textAlign: "center",
            }
        }}
            />
        <Grid container spacing={0} className={classes.root}>
            <Grid item xs={12} sm={6} lg={6}>
                <Paper elevation={2}>
                    <CodeMirror value={entry.content} onBeforeChange={changeEntryContent} options={{
                        mode: "markdown",
                        theme: 'material',
                        autofocus: true
                    }}/>
                </Paper>
            </Grid>
            <Grid item xs={12} sm={6} lg={6}>
                <Paper elevation={2} className={classes.preview}>
                    <ReactMarkdown source={entry.content}/>
                </Paper>
            </Grid>
        </Grid>
        <Fab color="primary" aria-label="add" size={"large"} className={classes.fab} onClick={async () => {
            try {
                await Api.editEntry(entry);
                // todo redirect to view
            } catch (e) {

            }
        }}>
            <Done/>
        </Fab>
        <Fab color="secondary" aria-label="add" size={"medium"} className={classes.cancelFab} onClick={fetchData}>
            <Clear/>
        </Fab>
    </div>
}
// todo add a confirmation for cancel
// todo save the initial content