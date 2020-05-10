import React, {Ref, useEffect, useState} from "react"
import {User} from "./models/User";
import Api from "./Api";
import {createStyles, Theme, Typography} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import {axiosError} from "./redux/reducers/root";
import {useDispatch} from "react-redux";
import HttpErrorHandler from "./utils/HttpErrorHandler";
import Divider from "@material-ui/core/Divider";
import Collapse from "@material-ui/core/Collapse";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import IconButton from "@material-ui/core/IconButton";
import {CheckCircle, ExpandMore, PhoneAndroid, PhonelinkErase, Sms, VerifiedUser, VpnKey} from "@material-ui/icons";
import makeStyles from "@material-ui/core/styles/makeStyles";
import clsx from 'clsx';
import CardContent from "@material-ui/core/CardContent";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";
import Modal from "@material-ui/core/Modal";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            maxWidth: 800,
        },
        expand: {
            transform: 'rotate(0deg)',
            marginLeft: 'auto',
            transition: theme.transitions.create('transform', {
                duration: theme.transitions.duration.shortest,
            }),
        },
        expandOpen: {
            transform: 'rotate(180deg)',
        },
    }),
);

function Section(props: React.PropsWithChildren<{
    title: string
    icon: JSX.Element
}>) {
    const classes = useStyles();
    const [open, setOpen] = React.useState(false);
    return <Card className={classes.root}>
        <CardHeader title={props.title}
                    avatar={props.icon}
                    action={<IconButton
                        onClick={() => setOpen(!open)}
                        aria-label="show more"
                        className={clsx(classes.expand, {
                            [classes.expandOpen]: open,
                        })}
                    >
                        <ExpandMore/>
                    </IconButton>}/>
        <Collapse in={open} timeout={"auto"}>
            <CardContent>
            {props.children}
            </CardContent>
        </Collapse>
    </Card>
}

const useAccountStyles = makeStyles((theme: Theme) =>
    createStyles({
        checkedIcon: {
            color: "green"
        },
    }),
);

export default function Account() {
    const [user, setUser] = useState(new User());
//    const [fetching, setFetching] = React.useState(false);
    const [qrSrc, setQrSrc] = React.useState("");
    const [token, setToken] = React.useState("");
    const [modelOtp, setModalOtp] = React.useState(false);
    const dispatch = useDispatch();
    const classes = useAccountStyles();

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
            try {
                const res = await Api.request2FAToken();
                setToken(res.data.token);
                setModalOtp(true)
            } catch (e) {
                dispatch(axiosError(e));
            }
        } catch (e) {
            dispatch(axiosError(e));
        }

    }

    useEffect(() => {
        fetchData().catch(e => dispatch(axiosError(e)));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    return <div>
        <Typography variant={"h3"} gutterBottom={true}>
            Security Settings
        </Typography>
        <Divider/>
        <br/>

        <Section title={"Two Factors Authentication"} icon={<VerifiedUser/>}>
            <List subheader={<ListSubheader>Methods</ListSubheader>}>
                <ListItem button onClick={startOTPRegistration}>
                    <ListItemIcon>
                        <PhoneAndroid/>
                    </ListItemIcon>
                    <ListItemText primary={"Mobile App"} secondary={"Authenticate through a free mobile app, like Google Authenticator or LastPass Authenticator"}/>
                    {user.has_registered_otp && <ListItemIcon>
                        <CheckCircle className={classes.checkedIcon}/>
                    </ListItemIcon>}
                </ListItem>
                <ListItem button disabled>
                    <ListItemIcon>
                        <PhonelinkErase/>
                    </ListItemIcon>
                    <ListItemText primary={"Recovery Codes"} secondary={"Codes to use if you do not have access to your phone"}/>
                </ListItem>
                <ListItem disabled={true}>
                    <ListItemIcon>
                        <Sms/>
                    </ListItemIcon>
                    <ListItemText primary={"SMS"} secondary={"Authenticate through code received by SMS"}/>
                </ListItem>
            </List>
            <Typography variant={"h5"}>
                Active sessions
            </Typography>
            <Typography variant={"subtitle1"} color={"secondary"}>
                Sessions where TFA is not prompted on login
            </Typography>
        </Section>
        <br/>
        <Section title={"Password"} icon={<VpnKey/>}>
            <p>
                Password change soon to come - require heavy client side logic
            </p>
        </Section>
        <RegisterOTPModal open={modelOtp} handleClose={(valid: boolean) => {
            setModalOtp(false);
            if (valid) {
                fetchData().catch((e) => console.log(e));
            }
        }} qrSrc={qrSrc} token={token}/>
    </div>
}

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
    }),
);


function RegisterOTPModal(props: {
    open: boolean
    handleClose: (valid: boolean) => void;
    qrSrc: string;
    token: string;
}) {
    const classes = useModalStyles();
    return <Modal
        open={props.open}
        onClose={() => props.handleClose(false)}
    >
        <div        className={classes.root}
        >
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
            <img src={props.qrSrc} alt={"qr-code"}/>
            <Typography variant={"h5"}>
                Step 2.
            </Typography>
            <Typography variant={"body1"}>
                Enter the code on your app to finalize the registration
            </Typography>
            <EnterOTP token={props.token} onValid={() => {
                props.handleClose(true);
            }}/>
        </div>
    </Modal>
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
            funcProps.onValid(res.data.token);
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