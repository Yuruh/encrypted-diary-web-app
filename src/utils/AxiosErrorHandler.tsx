import {AxiosError} from "axios";
import React from "react";
import Snackbar from "@material-ui/core/Snackbar";
import {Alert} from "@material-ui/lab";
import HttpErrorHandler from "./HttpErrorHandler";
import {useDispatch, useSelector} from "react-redux";
import {axiosError, State} from "../redux/reducers/root";
import {useHistory} from "react-router-dom";
import Api from "../Api";

/*
 * Handles error called by "dispatch(axiosError(e, errorHandler));" in components
 * It displays standard http errors unless overriden (by passing errorHandler)
 * It run callbacks for specific code if specified in errorHandler.
 * If a callback is specified, it will be ran instead of displaying the message
 * It doesn't handle multiple errors at once
 */
export default function AxiosErrorHandler() {
    const error: AxiosError | undefined = useSelector((state: State) => state.axiosError);
    const handler: HttpErrorHandler = useSelector((state: State) => state.httpErrorHandler);
    const dispatch = useDispatch();
    const history = useHistory();

    // Whenever we catch a 401, we disconnect the user and clear the encryption key
    handler.actions.set(401, () => {
        Api.encryptionKey = null;
        Api.token = null;
        if (process.env.NODE_ENV === "development") {
            localStorage.clear();
        }
        history.push("/login?ctx=expired")
    });

    if (!error) {
        return <React.Fragment/>
    }

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
            console.log('Error', error.message, error);
            return "Could not build request";
        }
    };

    const buildAction = (): (() => void) | undefined => {
        if (error.response) {
            /*
             * The request was made and the server responded with a
             * status code that falls out of the range of 2xx
             */
            return handler.getErrorCallback(error.response.status)
        }
    };

    const msg = buildMsg();
    const callback = buildAction();

    if (callback) {
        callback();
        onClose();
    }

    // We reset error state once it is done displaying error so subsequent error may be displayed
    function onClose() {
        dispatch(axiosError(undefined, new HttpErrorHandler()));
    }

    // Has to be open as we previously check error is defined
    return <Snackbar open={true} autoHideDuration={6000} onClose={onClose}>
        <Alert onClose={onClose} severity="error" variant={"outlined"}>
            {msg}
        </Alert>
    </Snackbar>
}
