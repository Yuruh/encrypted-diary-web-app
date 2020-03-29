import React, {useEffect} from "react";

import {
    useParams,
    useLocation
} from "react-router-dom";
import Header from "../Header";
import "codemirror";
import Editor from "./Editor";
import {BoxCenter} from "../BoxCenter";
import {NavigateNext} from "@material-ui/icons";
import {createStyles, IconButton, Theme} from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Viewer from "./Viewer";
import {Entry} from "../models/Entry";
import Api from "../Api";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        prevIcon: {
            transform: "rotate(180deg)"
        },
    }),
);

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

// need to do a class for the timeout reset to save changes
export default function Page() {
    const classes = useStyles();
    let { id } = useParams();
    let query = useQuery();
    let display: string | null = query.get("display");

    const [entry, setEntry] = React.useState<Entry>(new Entry());
    const [fetching, setFetching] = React.useState(false);

    const fetchData = async() => {
        setFetching(true);
        const result = await Api.getEntry(id || "");
        setEntry({...result.data.entry});
        setFetching(false);
    };

    useEffect(() => {
        fetchData().catch(e => console.log(e));
    }, []);

    let content;
    if (display !== "edit") {
        content = <BoxCenter>
            <IconButton color={"primary"}>
                <NavigateNext className={classes.prevIcon}/>
            </IconButton>
            <div style={{maxWidth: 1000}}>
                <Viewer entry={entry}/>
            </div>
            <IconButton color={"primary"}>
                <NavigateNext/>
            </IconButton>
        </BoxCenter>
    } else {
        content = <Editor entryId={id || ""}/>
    }

    return <div>
        <Header/>
        {content}
    </div>
}
