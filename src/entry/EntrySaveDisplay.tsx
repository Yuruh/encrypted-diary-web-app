import {EntrySaveStatus} from "../EntryEditor";
import {CloudDone, CloudQueue, Error} from "@material-ui/icons";
import React from "react"
import CircularProgress from "@material-ui/core/CircularProgress";
import {BoxCenter} from "../BoxCenter";

const icon = (status: EntrySaveStatus) => {
    if (status === EntrySaveStatus.SAVED) {
        return <CloudDone/>
    } else if (status === EntrySaveStatus.PENDING) {
        return <CloudQueue/>
    } else if (status === EntrySaveStatus.SAVING) {
        return <CircularProgress size={20} thickness={3.6}/>
    } else {
        return <Error/>
    }
};

export default function EntrySaveDisplay(props: {
    status: EntrySaveStatus
}) {
    return <BoxCenter>
        {icon(props.status)}
        <span style={{marginLeft: 10}}>{props.status}</span>
    </BoxCenter>;

}