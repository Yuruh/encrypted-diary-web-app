import React, {useEffect} from "react";

import {
    useParams,
    useLocation,
    useHistory
} from "react-router-dom";
import "codemirror";
import Editor from "./Editor";
import {NavigateNext} from "@material-ui/icons";
import {createStyles, IconButton, Theme} from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Viewer from "./Viewer";
import {Entry} from "../models/Entry";
import Api from "../Api";
import CircularProgress from "@material-ui/core/CircularProgress";
import Box from "@material-ui/core/Box";
import Hidden from "@material-ui/core/Hidden";
import {BoxCenter} from "../BoxCenter";
import {useDispatch} from "react-redux";
import {axiosError} from "../redux/reducers/root";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        prevIcon: {
            transform: "rotate(180deg)"
        },
        root: {
            display: "flex",
            justifyContent: "center",
        }
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

    const dispatch = useDispatch();

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
        history.push("/entries/" + String(nextEntryId) + location.search);
        fetchData().catch(e => dispatch(axiosError(e)));
    }

    function loadPrevEntry() {
        id = String(prevEntryId);
        history.push("/entries/" + String(prevEntryId) + location.search);
        fetchData().catch(e => dispatch(axiosError(e)));
    }

    useEffect(() => {
        fetchData().catch(e => dispatch(axiosError(e)));
    }, []);

    if (fetching) {
        return <BoxCenter><CircularProgress/></BoxCenter>
    }

    let content: JSX.Element;

    if (display !== "edit") {
        content = <Box className={classes.root}>
            <Hidden xsDown={true}>
                <IconButton color={"primary"}  disabled={prevEntryId === undefined} onClick={loadPrevEntry}>
                    <NavigateNext className={classes.prevIcon}/>
                </IconButton>
            </Hidden>
            <div style={{maxWidth: 1000, width: "100%"}}>
                <Viewer entry={entry}/>
            </div>
            <Hidden xsDown={true}>
                <IconButton color={"primary"} disabled={nextEntryId === undefined} onClick={loadNextEntry}>
                    <NavigateNext/>
                </IconButton>
            </Hidden>
        </Box>
    } else {
        content = <Editor entry={entry} updateEntry={(updated: Entry) => setEntry(updated)}/>
    }

    return <div>
        {content}
    </div>
}
