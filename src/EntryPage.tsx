import React, {useEffect} from "react";
import {createStyles, Theme} from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";

import {
    useParams,
    useLocation
} from "react-router-dom";
import {Entry} from "./models/Entry";
import Api from "./Api";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Header from "./Header";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({

    }),
);

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

export default function EntryPage() {
    let { id } = useParams();
    let query = useQuery();
    let display: string | null = query.get("display");
    if (display !== "view" && display !== "edit") {
        display = "view"
    }

    const [entry, setEntry] = React.useState<Entry>(new Entry());
    const [fetching, setFetching] = React.useState(false);

    const fetchData = async() => {
        setFetching(true);
        const result = await Api.getEntry(id || "");
        setEntry(result.data.entry);
        setFetching(false);
    };

    useEffect(() => {
        fetchData().catch(e => console.log(e));
    }, []);
    let content = <ul>
        <li>{entry.title}</li>
        <li>{entry.content}</li>
    </ul>;

    if (display !== "view") {
        return <div>
            <TextField multiline={true}/>
            <Button>Edit</Button>
        </div>
    } return <div><Header/>{content}</div>
}
