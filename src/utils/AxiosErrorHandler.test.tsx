import React from 'react';
import AxiosErrorHandler from "./AxiosErrorHandler";
import { Provider } from "react-redux"
import store from "../redux/store";
import {
    BrowserRouter as Router,
} from "react-router-dom";
import {render, unmountComponentAtNode} from "react-dom";
import { act } from "react-dom/test-utils";

import {axiosError} from "../redux/reducers/root";
import {AxiosError, AxiosRequestConfig, AxiosResponse} from "axios";

// We test a function that uses redux so we simulate a store too

/*
 * https://create-react-app.dev/docs/running-tests/
 * Library "Enzyme" can be used to test components in isolation from their children
 *


 */

let container: HTMLDivElement | null = null

beforeEach(() => {
    // met en place un élément DOM comme cible de rendu
    container = document.createElement("div");
    document.body.appendChild(container);
});

afterEach(() => {
    // nettoie en sortie de test
    if (container) {
        unmountComponentAtNode(container);
        container.remove();
        container = null;
    }
});


const error: AxiosError = new class implements AxiosError<any> {
    code: string = "401";
    config: any = null;
    isAxiosError: boolean = true;
    message: string = "error message";
    name: string = "error name";
    request: any = null;
    response: AxiosResponse<any> = new class implements AxiosResponse<any> {
        config: any = null;
        data: any;
        headers: any;
        request: any;
        status: number = 400;
        statusText: string = "Bad request";
    }();
    stack: string = "";

    toJSON(): object {
        return {};
    }
}();

it("should not render anything", () => {
    act(()=> {
        render(<Provider store={store}>
            <Router>
                <AxiosErrorHandler/>
            </Router>
        </Provider>, container)
    })
    expect(container).toBeDefined();
    if (container) {
        expect(container.textContent).toBe("");
    }
})

it("should render error message using response", () => {
    store.dispatch(axiosError(error))
    act(()=> {
        render(<Provider store={store}>
            <Router>
                <AxiosErrorHandler/>
            </Router>
        </Provider>, container)
    })
    expect(container).toBeDefined();
    if (container) {
        expect(container.textContent).toBe("Bad Request");
    }
})

it("should clear tokens on 401", () => {
    if (error.response)
        error.response.status = 401
    store.dispatch(axiosError(error))
    act(()=> {
        render(<Provider store={store}>
            <Router>
                <AxiosErrorHandler/>
            </Router>
        </Provider>, container)
    })
    expect(container).toBeDefined();
    if (container) {
        expect(container.textContent).toBe("");
    }
})


it("should render error message specifying there's no response", () => {
    error.response = undefined;
    error.request = {};
    store.dispatch(axiosError(error))
    act(()=> {
        render(<Provider store={store}>
            <Router>
                <AxiosErrorHandler/>
            </Router>
        </Provider>, container)
    })
    expect(container).toBeDefined();
    if (container) {
        expect(container.textContent).toBe("No response received from the server");
    }
})
