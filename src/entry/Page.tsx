import React, {useEffect} from "react";

import {
    useParams,
    useLocation,
    useHistory
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
import CircularProgress from "@material-ui/core/CircularProgress";

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
    const query = useQuery();
    const location = useLocation();
    const history = useHistory();
    let display: string | null = query.get("display");

    const [entry, setEntry] = React.useState<Entry>(new Entry());
    const [fetching, setFetching] = React.useState(false);

    const [nextEntryId, setNextEntryId] = React.useState<number | undefined>(undefined);
    const [prevEntryId, setPrevEntryId] = React.useState<number | undefined>(undefined);


    const fetchData = async() => {
        setFetching(true);
        const result = await Api.getEntry(id || "");
        setEntry({...result.data.entry});
        setNextEntryId(result.data.next_entry_id);
        setPrevEntryId(result.data.prev_entry_id);
        setFetching(false);
    };

    function loadNextEntry() {
        id = String(nextEntryId);
        history.push("/entry/" + String(nextEntryId) + location.search);
        fetchData().catch(e => console.log(e));
    }

    function loadPrevEntry() {
        id = String(prevEntryId);
        history.push("/entry/" + String(prevEntryId) + location.search);
        fetchData().catch(e => console.log(e));
    }

    useEffect(() => {
        fetchData().catch(e => console.log(e));
    }, []);

    if (fetching) {
        return <CircularProgress/>
    }

    let content;

    if (display !== "edit") {
        content = <BoxCenter>
            <IconButton color={"primary"}  disabled={prevEntryId === undefined} onClick={loadPrevEntry}>
                <NavigateNext className={classes.prevIcon}/>
            </IconButton>
            <div style={{maxWidth: 1000}}>
                <Viewer entry={entry}/>
            </div>
            <IconButton color={"primary"} disabled={nextEntryId === undefined} onClick={loadNextEntry}>
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