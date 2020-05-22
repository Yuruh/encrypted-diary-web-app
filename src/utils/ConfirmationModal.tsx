import makeStyles from "@material-ui/core/styles/makeStyles";
import {createStyles, Theme} from "@material-ui/core";
import Modal from "@material-ui/core/Modal";
import React from "react";
import Button from "@material-ui/core/Button";

const useModalStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            maxWidth: 800,
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "white",
            position: 'absolute',
            padding: 50,
        },
        buttonContainer: {
            width: "100%"
        },
        confirmButton: {
            marginLeft: "auto",
        }
    }),
);

export function ConfirmationModal(props: React.PropsWithChildren<{
    open: boolean
    handleChoice: (valid: boolean) => void;
}>) {
    const classes = useModalStyles();
    return <Modal
        open={props.open}
        onClose={() => props.handleChoice(false)}
    >
        <div className={classes.root}>
            <div>
                {props.children}
            </div>
            <br/>
            <div className={classes.buttonContainer}>
                <Button variant={"contained"} onClick={() => props.handleChoice(false)}>Cancel</Button>
                <Button className={classes.confirmButton} variant={"contained"} color={"primary"} onClick={() => props.handleChoice(true)}>Confirm</Button>
            </div>
        </div>
    </Modal>
}