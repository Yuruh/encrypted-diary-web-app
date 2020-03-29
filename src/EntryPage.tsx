import React from "react";

import {
    useParams,
    useLocation
} from "react-router-dom";
import Header from "./Header";
import "codemirror";
import EntryEditor from "./EntryEditor";

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

// need to do a class for the timeout reset to save changes
export default function EntryPage() {
    let { id } = useParams();
    let query = useQuery();
    let display: string | null = query.get("display");

    if (display !== "view" && display !== "edit") {
        display = "view"
    }

    // todo save title on click away (material ui has a clickaway listener)
    return <div>
        <Header/>
        <EntryEditor entryId={id || ""}/>
    </div>
}
// todo add a confirmation for cancel
// todo save the initial content