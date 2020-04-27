import React, {useEffect, useState} from "react"
import {User} from "./models/User";
import Api from "./Api";
import {Typography} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import {Multipart} from "./utils/mutlipart";
import TextField from "@material-ui/core/TextField";

export default function Account() {
    const [user, setUser] = useState(new User());
    const [fetching, setFetching] = React.useState(false);
    const [qrSrc, setQrSrc] = React.useState("");
    const [token, setToken] = React.useState("");

    const fetchData = async() => {
        setFetching(true);
        const res = await Api.getAccountInfos();
        setUser(res.data.user);
        setFetching(false)
    };

    async function startOTPRegistration() {
        try {
            const res = await Api.requestOTPRegistration();
            setQrSrc(URL.createObjectURL(res.data))
        } catch (e) {
            console.log(e);
        }
        try {
            const res = await Api.request2FAToken();
            setToken(res.data.token)
        } catch (e) {
            console.log(e)
        }
    }

    useEffect(() => {
        fetchData().catch(e => console.log(e));
    }, []);


    return <div>
        <Typography variant={"h3"}>
            {user.email}
        </Typography>
        <div>
            <Button onClick={startOTPRegistration} disabled={user.has_registered_otp}>Enable Two Factors Authentication</Button>
            {token != "" && <div>
                <img src={qrSrc} alt={"qr-code"}/>
                <EnterOTP token={token}/>
            </div>}
        </div>
    </div>
}

function EnterOTP (funcProps: {
    token: string
}) {
    const [passcode, setPasscode] = React.useState("      ");
    // cannot use loop for react hooks
    const case1 = React.useRef();
    const case2 = React.useRef();

    for (let i = 0; i < 6; i++) {
    }

    function Case(props: {
        idx: number
        ref?: any
        nextCaseRef?: any
    }) {
        return <TextField ref={props.ref} variant={"outlined"} style={{width: 50}} value={passcode[props.idx]} onChange={(e) => {
            let value = e.target.value;
            console.log(e.target);
            if (value.length > 0) {
                const charac = value[value.length - 1];

                setPasscode(passcode.substr(0, props.idx) + charac + passcode.substr(props.idx + 1))

                if (props.nextCaseRef) {
                    console.log(props.nextCaseRef)
                    props.nextCaseRef.current.focus();
                }
            }
        }}/>
    }
    async function go() {
        try {
            await Api.validateOTP(passcode, funcProps.token)
        } catch (e) {
            console.log(e)
        }
    }
    // faut faire des forwards refs, je continuerai plus tard
    return <div>
        <Case idx={0} ref={case1} nextCaseRef={case2}/>
        <Case idx={1} ref={case2}/>
        <Case idx={2}/>
        <Case idxeer={3}/>
        <Case idx={4}/>
        <Case idx={5}/>
        <br/>
        <Button onClick={go}>FEU !</Button>
    </div>
}