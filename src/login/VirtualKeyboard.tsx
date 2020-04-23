import React from "react"
import Keyboard from "react-simple-keyboard";
import 'react-simple-keyboard/build/css/index.css';

export default function VirtualKeyboard(props: {
    onKeyPress: (character: string) => void,
    onBackSpace: () => void
}) {
    const [layout, setLayout] = React.useState("default")

    const onKeyPress = (button: any) => {
        if (button === "{shift}" || button === "{lock}") {
            handleShift();
        }
        else if (button === "{space}") {
            props.onKeyPress(" ")
        } else if (button === "{bksp}") {
            props.onBackSpace();
        } else if (button !== "{enter}" && button !== "{tab}") {
            props.onKeyPress(button)
        }
    };

    const handleShift = () => {
        setLayout(layout === "default" ? "shift" : "default")
    };

    return <Keyboard
        layoutName={layout}
        onKeyPress={onKeyPress}
    />
}