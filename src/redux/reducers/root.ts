import {AxiosError} from "axios";
import HttpErrorHandler from "../../utils/HttpErrorHandler";
import {Label} from "../../models/Label";

export const EXAMPLE_ACTION = "EXAMPLE_ACTION";
export const ADD_DECRYPTED_LABEL = "ADD_DECRYPTED_LABEL";
export const LOGIN = "LOGIN";
export const LOGOUT = "LOGOUT";
export const AXIOS_ERROR = "AXIOS_ERROR";
export const SET_FILTER_LABELS = "SET_FILTER_LABELS";

// should be organized with combineReducers once it gets too big
export class State {
    content: string = "toto";
    decryptedLabels: DecryptedImage[] = [];
    redirectToLogout: boolean = false;
    axiosError?: AxiosError;
    httpErrorHandler: HttpErrorHandler = new HttpErrorHandler();
    filterLabels: Label[] = [];
}
const initialState: State = new State();

//We use an array of object instead of a map as it is not advised in redux (https://github.com/reduxjs/redux/issues/1499)
export class DecryptedImage {
    id: number = 0;
    decryptedImage: string = ""
}

// Action types
interface ExampleAction {
    type: typeof EXAMPLE_ACTION;
    payload: string
}

interface AddLabelAction {
    type: typeof ADD_DECRYPTED_LABEL;
    decrypted: DecryptedImage;
}

interface LogoutAction {
    type: typeof LOGOUT;
}

interface LoginAction {
    type: typeof LOGIN;
}

interface SetFilterLabelAction {
    type: typeof SET_FILTER_LABELS
    labels: Label[]
}

interface AxiosErrorAction {
    type: typeof AXIOS_ERROR
    payload: {
        axiosError?: AxiosError
        // This will override default http handler, it must be set to normal after error is handled
        httpErrorHandler?: HttpErrorHandler
    }
}

type ActionType = AddLabelAction | ExampleAction | LoginAction | LogoutAction | AxiosErrorAction | SetFilterLabelAction;

// Action creators
export function addDecryptedLabel(payload: DecryptedImage): ActionType {
    return {
        type: ADD_DECRYPTED_LABEL,
        decrypted: payload
    }
}

export function setFiltersLabels(labels: Label[]): ActionType {
    return {
        type: SET_FILTER_LABELS,
        labels,
    }
}

export function axiosError(err?: AxiosError, handler?: HttpErrorHandler): ActionType {
    return {
        type: AXIOS_ERROR,
        payload: {
            axiosError: err,
            httpErrorHandler: handler
        }
    }
}

export function login(): ActionType {
    return {
        type: LOGIN
    }
}

export function logout(): ActionType {
    return {
        type: LOGOUT
    }
}

export function rootReducer(
    state = initialState,
    action: ActionType
): State {
    switch (action.type) {
        case EXAMPLE_ACTION:
            return {
                ...state,
                content: action.payload
            };
        case ADD_DECRYPTED_LABEL:
            const existing = state.decryptedLabels.find((elem: DecryptedImage) => elem.id === action.decrypted.id);
            if (existing) {
                // todo overwrite if exists
                return {
                    ...state
                }
            }
            return {
                ...state,
                decryptedLabels: [...state.decryptedLabels, action.decrypted]
            };
        case LOGOUT:
            return {
                ...state,
                redirectToLogout: true
            };
        case LOGIN:
            return {
                ...state,
                redirectToLogout: false
            };
        case AXIOS_ERROR:
            return {
                ...state,
                axiosError: action.payload.axiosError,
                httpErrorHandler: action.payload.httpErrorHandler || state.httpErrorHandler,
            };
        case SET_FILTER_LABELS:
            return {
                ...state,
                filterLabels: action.labels
            };

        default:
            return state
    }
}