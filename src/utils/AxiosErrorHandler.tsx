import {AxiosError} from "axios";
import React from "react";
import Snackbar from "@material-ui/core/Snackbar";
import {Alert} from "@material-ui/lab";
import HttpErrorHandler from "./HttpErrorHandler";
import {useDispatch, useSelector} from "react-redux";
import {axiosError, State} from "../redux/reducers/root";

/*
 * Handles error called by "dispatch(axiosError(e, errorHandler));" in components
 * It displays standard http errors unless overriden (by passing errorHandler)
 * It doesn't handle multiple errors at once
 */
export default function AxiosErrorHandler() {
    const error: AxiosError | undefined = useSelector((state: State) => state.axiosError);
    const handler: HttpErrorHandler = useSelector((state: State) => state.httpErrorHandler);
    const dispatch = useDispatch();

    if (!error) {
        return <React.Fragment/>
    }

    // todo action callbacks
    const buildMsg = (): string => {
        if (error.response) {
            /*
             * The request was made and the server responded with a
             * status code that falls out of the range of 2xx
             */
            return handler.getErrorMsg(error.response.status);
        } else if (error.request) {
            //The request was made but no response was received, `error.request`
            return "No response received from the server";
        } else {
            // Something happened in setting up the request and triggered an Error
            console.log('Error', error.message);
            return "Could not build request";
        }
    };

    const msg = buildMsg();

    // We reset error state once it is done displaying error so subsequent error may be displayed
    function onClose() {
        dispatch(axiosError(undefined, new HttpErrorHandler()));
    }

    return <Snackbar open={error !== undefined} autoHideDuration={6000} onClose={onClose}>
        <Alert onClose={onClose} severity="error">
            {msg}
        </Alert>
    </Snackbar>
}