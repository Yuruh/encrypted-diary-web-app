import React, {Ref, useEffect, useState} from "react"
import {User} from "./models/User";
import Api from "./Api";
import {Typography} from "@material-ui/core";
import Button from "@material-ui/core/Button";
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
    // cannot use loop for react hooks
    const case0: any = React.useRef();
    const case1: any = React.useRef();
    const case2: any = React.useRef();
    const case3: any = React.useRef();
    const case4: any = React.useRef();
    const case5: any = React.useRef();

    const button: any = React.useRef();

    for (let i = 0; i < 6; i++) {
    }

    const Case = React.forwardRef((props: {
        idx: number
        //ref?: any
        nextCaseRef?: any
    }, ref: Ref<HTMLDivElement>) => {


  //      const [character, setCharacter] = React.useState("0");


        return <TextField inputRef={ref} inputProps={{maxLength: 1}} variant={"outlined"} style={{width: 50}} /*value={character}*/ onChange={(e) => {
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
        try {
            const code = case0.current.value + case1.current.value + case2.current.value +
                case3.current.value + case4.current.value + case5.current.value;
            console.log(code);
            await Api.validateOTP(code, funcProps.token)
        } catch (e) {
            console.log(e)
        }
    }
    // faut faire des forwards refs, je continuerai plus tard
    return <div>
        <Case idx={0} ref={case0} nextCaseRef={case1}/>
        <Case idx={1} ref={case1} nextCaseRef={case2}/>
        <Case idx={2} ref={case2} nextCaseRef={case3}/>
        <Case idx={3} ref={case3} nextCaseRef={case4}/>
        <Case idx={4} ref={case4} nextCaseRef={case5}/>
        <Case idx={5} ref={case5}  nextCaseRef={button}/>
        <br/>
        <Button ref={button} onClick={go}>Finalize 2FA Registration with OTP</Button>
    </div>
}