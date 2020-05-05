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

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        prevIcon: {
            transform: "rotate(180deg)"
        },
        root: {
            display: "flex",
            justifyContent: "center",
        },
        nextContent: {
            maxWidth: "150px"
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

    const dispatch = useDispatch();

    const fetchData = async() => {
        setFetching(true);
        const result = await Api.getEntry(id || "", filterLabels.map((elem: Label) => elem.id));
        setEntry({...result.data.entry});
        setNextEntry(result.data.next_entry);
        setPrevEntry(result.data.prev_entry);
        setFetching(false);
    };

    function loadNextEntry() {
        if (nextEntry !== undefined) {
            id = String(nextEntry.id);
            history.push("/entries/" + String(nextEntry.id) + location.search);
            fetchData().catch(e => dispatch(axiosError(e)));
        }
    }

    function loadPrevEntry() {
        if (prevEntry !== undefined) {
            id = String(prevEntry.id);
            history.push("/entries/" + String(prevEntry.id) + location.search);
            fetchData().catch(e => dispatch(axiosError(e)));
        }
    }

    useEffect(() => {
        fetchData().catch(e => dispatch(axiosError(e)));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterLabels]);

    if (fetching) {
        return <BoxCenter><CircularProgress/></BoxCenter>
    }

    let content: JSX.Element;

    if (display !== "edit") {
        content = <Box className={classes.root}>
            <Hidden xsDown={true}>
                <IconButton color={"primary"}  disabled={prevEntry === undefined} onClick={loadPrevEntry}>
                    <NavigateNext className={classes.prevIcon}/>
                    {prevEntry && <p className={classes.nextContent}>
                        <Typography variant={"h5"} gutterBottom>{formatDate(prevEntry.created_at)}</Typography>
                        <Typography variant={"h6"}>{prevEntry?.title}</Typography>
                    </p>}
                </IconButton>
            </Hidden>
            <div style={{maxWidth: 1000, width: "100%"}}>
                <Viewer entry={entry}/>
            </div>
            <Hidden xsDown={true}>
                <IconButton color={"primary"} disabled={nextEntry === undefined} onClick={loadNextEntry}>
                    {nextEntry && <p className={classes.nextContent}>
                        <Typography variant={"h5"} gutterBottom>{formatDate(nextEntry.created_at)}</Typography>
                        <Typography variant={"h6"}>{nextEntry.title}</Typography>
                    </p>}

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
