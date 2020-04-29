import {AxiosError} from "axios";
import React from "react";
import Snackbar from "@material-ui/core/Snackbar";
import {Alert} from "@material-ui/lab";
import HttpErrorHandler from "./HttpErrorHandler";

export default function AxiosErrorHandler(props: {
    error: AxiosError, // The error itself
    onAlertClose: () => void, // Callback to signify the error display is done
    errorHandler?: HttpErrorHandler // To override default msg or run a callback instead of displaying action
}) {
    const [openSnackbar, setOpenSnackbar] = React.useState(true);
    const handler = props.errorHandler ? props.errorHandler : new HttpErrorHandler();
    // todo action callbacks
    const buildMsg = (): string => {
        if (props.error.response) {
            /*
             * The request was made and the server responded with a
             * status code that falls out of the range of 2xx
             */
            return handler.getErrorMsg(props.error.response.status);
        } else if (props.error.request) {
            //The request was made but no response was received, `error.request`
            return "No response received from the server";
        } else {
            // Something happened in setting up the request and triggered an Error
            console.log('Error', props.error.message);
            return "Could not build request";
        }
    };

    const msg = buildMsg();

    function onClose() {
        setOpenSnackbar(false);
        props.onAlertClose();
    }


    return <Snackbar open={openSnackbar} onClose={onClose}>
        <Alert onClose={onClose} severity="error">
            {msg}
        </Alert>
    </Snackbar>
}