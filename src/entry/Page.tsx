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
import Viewer, {formatDate} from "./Viewer";
import {Entry} from "../models/Entry";
import Api from "../Api";
import CircularProgress from "@material-ui/core/CircularProgress";
import Box from "@material-ui/core/Box";
import Hidden from "@material-ui/core/Hidden";
import {BoxCenter} from "../BoxCenter";
import {useDispatch, useSelector} from "react-redux";
import {axiosError, State} from "../redux/reducers/root";
import {Label} from "../models/Label";
import Typography from "@material-ui/core/Typography";
import EntryFilterDrawer from "./EntryFilterDrawer";
import Tooltip from "@material-ui/core/Tooltip";
import Button from "@material-ui/core/Button";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        prevIcon: {
            transform: "rotate(180deg)"
        },
        root: {
            display: "flex",
            justifyContent: "center",
        },
        prevNext: {
            position: "sticky",
            top: 80,
            alignSelf: "flex-start",
        },
        nextContent: {
            maxWidth: "150px",
            textOverflow: "ellipsis",
            overflow: "hidden",
            whiteSpace: "nowrap",
            textTransform: "none",
        }
    }),
);

export function useQuery() {
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

    const [nextEntry, setNextEntry] = React.useState<Entry | undefined>(undefined);
    const [prevEntry, setPrevEntry] = React.useState<Entry | undefined>(undefined);

    const filterLabels = useSelector((state: State) => state.filterLabels);

    // We store these as classic variable to handle keyUp event (state is not accessible in window global even)
    let nextEntryGlobal: Entry;
    let prevEntryGlobal: Entry;

    const dispatch = useDispatch();

    const fetchData = async() => {
        setFetching(true);
        const result = await Api.getEntry(id || "", filterLabels.map((elem: Label) => elem.id));
        setEntry({...result.data.entry});
        setNextEntry(result.data.next_entry);
        setPrevEntry(result.data.prev_entry);
        prevEntryGlobal = result.data.prev_entry;
        nextEntryGlobal = result.data.next_entry;
        setFetching(false);
    };

    function loadNextEntry() {
        loadEntry(nextEntry);
    }
    
    function loadEntry(entry: Entry | undefined) {
        if (entry !== undefined) {
            id = String(entry.id);
            history.push("/entries/" + String(entry.id) + location.search);
            fetchData().catch(e => dispatch(axiosError(e)));
        }
    }

    function loadPrevEntry() {
        loadEntry(prevEntry)
    }


    function onKeyUp(event: any) {
        if (event.keyCode === 37) {
            loadEntry(prevEntryGlobal)
        } else if (event.keyCode === 39) {
            loadEntry(nextEntryGlobal)
        }
    }

    useEffect(() => {
        fetchData().catch(e => dispatch(axiosError(e)));
        // eslint-disable-next-line react-hooks/exhaustive-deps
        window.addEventListener("keyup", onKeyUp);
        return () => window.removeEventListener("keyup", onKeyUp);

    }, [filterLabels]);

    if (fetching) {
        return <BoxCenter><CircularProgress/></BoxCenter>
    }

    let content: JSX.Element;

    if (display !== "edit") {
        content = <EntryFilterDrawer>
            <Box className={classes.root}>
                <Hidden xsDown={true}>
                    <div className={classes.prevNext}>
                        <Button size="large" startIcon={<NavigateNext className={classes.prevIcon}/>} color={"primary"}  disabled={prevEntry === undefined} onClick={loadPrevEntry}>
                            {prevEntry ? <span>
                                <Typography className={classes.nextContent} variant={"body1"} gutterBottom>{new Date(prevEntry.created_at).toLocaleDateString()}</Typography>
                                <Typography className={classes.nextContent} variant={"body2"}>{prevEntry.title}</Typography>
                            </span>: ""}
                        </Button>
                    </div>
                </Hidden>
                <div style={{maxWidth: 1000, width: "100%"}}>
                    <Viewer entry={entry}/>
                </div>
                <Hidden xsDown={true}>
                    <div className={classes.prevNext}>
                        <Button size="large" endIcon={<NavigateNext/>} color={"primary"}  disabled={nextEntry === undefined} onClick={loadNextEntry}>
                            {nextEntry ? <span>
                                <Typography className={classes.nextContent} variant={"body1"} gutterBottom>{new Date(nextEntry.created_at).toLocaleDateString()}</Typography>
                                <Typography className={classes.nextContent} variant={"body2"}>{nextEntry.title}</Typography>
                            </span>: ""}
                        </Button>
                    </div>
                </Hidden>
            </Box>
        </EntryFilterDrawer>
    } else {
        content = <Editor entry={entry} updateEntry={(updated: Entry) => setEntry(updated)}/>
    }

    return <div>
        {content}
    </div>
}
