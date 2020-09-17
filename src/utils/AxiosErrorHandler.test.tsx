import React from 'react';
import { render } from '@testing-library/react';
import AxiosErrorHandler from "./AxiosErrorHandler";
import { Provider } from "react-redux"
import store from "../redux/store";
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Redirect
} from "react-router-dom";
import {unmountComponentAtNode} from "react-dom";
import { act } from "react-dom/test-utils";

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

it("dunno yet", () => {
    act(()=> {
        render(<Provider store={store}>
            <Router>
                <AxiosErrorHandler/>
            </Router>
        </Provider>)
    })
    expect(container).toBeDefined();
    if (container) {
        expect(container.textContent).toBe("");
    }
})


/*test("dunno yet", () => {
    const { getByText } = render(<Provider store={store}>
        <Router>
        <AxiosErrorHandler/>
        </Router>
    </Provider>)
    const tast = getByText(/toto/i);
    expect(tast).toBeInTheDocument();
})*/
