import React, {useEffect} from "react";
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
const ReactMarkdown = require('react-markdown');
require('codemirror/mode/markdown/markdown');
require('codemirror/lib/codemirror.css');
require('codemirror/theme/material.css');

require("./extend-codemirror.css");

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {

        },
        preview: {
            height: "100%",
            padding: 5
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
    }

    return <div>
        <Header/>
        <Grid container spacing={0} className={classes.root}>
            <Grid item xs={12} sm={12} lg={6}>
                <Paper elevation={2}>
                    <CodeMirror value={entry.content} onBeforeChange={changeEntryContent} options={{
                        mode: "markdown",
                        theme: 'material',
                        autofocus: true
                    }}/>
                </Paper>
            </Grid>
            <Grid item xs={12} sm={12} lg={6}>
                <Paper elevation={2} className={classes.preview}>
                    <ReactMarkdown source={entry.content}/>
                </Paper>
            </Grid>
        </Grid>
    </div>
}
