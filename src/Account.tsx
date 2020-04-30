import React, {Ref, useEffect, useState} from "react"
import {User} from "./models/User";
import Api from "./Api";
import {Typography} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import {axiosError} from "./redux/reducers/root";
import {useDispatch} from "react-redux";
import HttpErrorHandler from "./utils/HttpErrorHandler";

export default function Account() {
    const [user, setUser] = useState(new User());
//    const [fetching, setFetching] = React.useState(false);
    const [qrSrc, setQrSrc] = React.useState("");
    const [token, setToken] = React.useState("");
    const dispatch = useDispatch();

    const fetchData = async() => {
  //      setFetching(true);
        const res = await Api.getAccountInfos();
        setUser(res.data.user);
    //    setFetching(false)
    };

    async function startOTPRegistration() {
        try {
            const res = await Api.requestOTPRegistration();
            setQrSrc(URL.createObjectURL(res.data))
        } catch (e) {
            dispatch(axiosError(e));
        }
        try {
            const res = await Api.request2FAToken();
            setToken(res.data.token)
        } catch (e) {
            dispatch(axiosError(e));
        }
    }

    useEffect(() => {
        fetchData().catch(e => dispatch(axiosError(e)));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    return <div>
        <Typography variant={"h2"} color={"primary"} gutterBottom={true}>
            Settings for <strong>{user.email}</strong>
        </Typography>
        <div>
            {user.has_registered_otp ? <p>2FA With OTP ok</p> : (token === "" && <Button onClick={startOTPRegistration} disabled={user.has_registered_otp}>Enable Two Factors Authentication</Button>)}
            {token !== "" && <div>
                <Typography variant={"h3"}>
                    Two Factors Authentication Registration
                </Typography>
                <Typography variant={"subtitle2"} gutterBottom={true}>
                    With Time-based One-time Password Algorithm (TOTP)
                </Typography>
                <Typography variant={"h5"}>
                    Step 1.
                </Typography>
                <Typography variant={"body1"}>
                    Scan this qr code with a TOTP compliant application. (e.g. Google Authenticator, LastPass Authenticator, ...)
                </Typography>
                <img src={qrSrc} alt={"qr-code"}/>
                <Typography variant={"h5"}>
                    Step 2.
                </Typography>
                <Typography variant={"body1"}>
                    Enter the code on your app to finalize the registration
                </Typography>
                <EnterOTP token={token} onValid={() => {
                    fetchData().catch();
                }}/>
            </div>}
        </div>
    </div>
}

export function EnterOTP (funcProps: {
    token: string
    onValid: (token: string) => void
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
            const res = await Api.validateOTP(code, funcProps.token);
            funcProps.onValid(res.data.token); // todo send token from validateOTP
        } catch (e) {
            const errorHandler: HttpErrorHandler = new HttpErrorHandler();
            errorHandler.actions.set(400, () => setCodeError("Invalid Code"));
            dispatch(axiosError(e, errorHandler));
        }
    }
    return <div>
        <Typography variant="h5" color={"primary"}>
            Two-Factor Authentication requested
        </Typography>
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
    </div>
}