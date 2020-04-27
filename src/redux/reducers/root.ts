export const EXAMPLE_ACTION = "EXAMPLE_ACTION";
export const ADD_DECRYPTED_LABEL = "ADD_DECRYPTED_LABEL";
export const LOGIN = "LOGIN";
export const LOGOUT = "LOGOUT";

// todo organize with combineReducers
export class State {
    content: string = "toto";
    decryptedLabels: DecryptedImage[] = [];
    redirectToLogout: boolean = false;
}
const initialState: State = new State();

//We use this instead of a map as it is not advised in redux (https://github.com/reduxjs/redux/issues/1499)

class DecryptedImage {
    id: number = 0;
    decryptedImage: string = ""
}

// Actions
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

type ActionType = AddLabelAction | ExampleAction | LoginAction | LogoutAction;

// Action creator
export function addDecryptedLabel(payload: DecryptedImage): ActionType {
    return {
        type: ADD_DECRYPTED_LABEL,
        decrypted: payload
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
        default:
            return state
    }
}