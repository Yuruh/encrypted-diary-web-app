import React, {Ref} from "react";
import {useDispatch} from "react-redux";
import TextField from "@material-ui/core/TextField";
import Api from "../Api";
import HttpErrorHandler from "../utils/HttpErrorHandler";
import {axiosError} from "../redux/reducers/root";
import {Typography} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import Tooltip from "@material-ui/core/Tooltip";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";

export function EnterOTP (funcProps: {
    token: string
    onValid: (token: string) => void
    ctx: "login" | "tfa-registration"
}) {
    // cannot use loop for react hooks
    const case0: any = React.useRef();
    const case1: any = React.useRef();
    const case2: any = React.useRef();
    const case3: any = React.useRef();
    const case4: any = React.useRef();
    const case5: any = React.useRef();
    const button: any = React.useRef();
    const dispatch = useDispatch();

    const [codeError, setCodeError] = React.useState("");

    const checkboxRef = React.useRef();

    const Case = React.forwardRef((props: {
        idx: number
        //ref?: any
        nextCaseRef?: any
    }, ref: Ref<HTMLDivElement>) => {

        // Uncontrolled, we use ref to retrieve the value
        return <TextField inputRef={ref} inputProps={{
            maxLength: 1,
            pattern: "[0-9]*",
            //          inputMode: "numeric"
        }} variant={"outlined"} style={{width: 50, textAlign: "center"}} onChange={(e) => {
            let value = e.target.value;
            if (value.length > 0) {
                if (props.nextCaseRef) {
                    props.nextCaseRef.current.value = "";
                    props.nextCaseRef.current.focus();
                }
            }
        }}/>
    });

    async function go() {
        setCodeError("");
        try {
            const code = case0.current.value + case1.current.value + case2.current.value +
                case3.current.value + case4.current.value + case5.current.value;

            // @ts-ignore  checkbox will never be undefined
            const res = await Api.validateOTP(code, funcProps.token, checkboxRef.current.checked);
            funcProps.onValid(res.data.token);
        } catch (e) {
            const errorHandler: HttpErrorHandler = new HttpErrorHandler();
            errorHandler.actions.set(400, () => setCodeError("Invalid Code"));
            dispatch(axiosError(e, errorHandler));
        }
    }
    return <div>
        {funcProps.ctx === "login" && <Typography variant="h5" color={"primary"}>
            Two-Factor Authentication requested
        </Typography>}
        <Typography variant={"subtitle1"} gutterBottom color={"secondary"}>
            Enter Passcode from your TOTP authenticator
        </Typography>
        <Case idx={0} ref={case0} nextCaseRef={case1}/>
        <Case idx={1} ref={case1} nextCaseRef={case2}/>
        <Case idx={2} ref={case2} nextCaseRef={case3}/>
        <Case idx={3} ref={case3} nextCaseRef={case4}/>
        <Case idx={4} ref={case4} nextCaseRef={case5}/>
        <Case idx={5} ref={case5}  nextCaseRef={button}/>
        <br/>
        <br/>
        <Button style={{marginLeft: "auto", marginRight: "auto"}} ref={button} onClick={go} variant={"outlined"} color={"primary"}>Validate Code</Button>
        {codeError !== "" && <Typography color={"error"} variant={"body2"}>{codeError}</Typography>}
        <br/>
        {funcProps.ctx === "login" &&
        <Tooltip title={"If enabled, you won't have to enter two factors code of this browser for 2 weeks"}>
            <FormControlLabel control={<Checkbox inputRef={checkboxRef}/>} label={"Keep session active"}/>
        </Tooltip>
        }
    </div>
}