import React, {useEffect, useState} from "react"
import {TwoFactorsCookies, User} from "./models/User";
import Api from "./Api";
import {createStyles, Theme, Typography} from "@material-ui/core";
import {axiosError} from "./redux/reducers/root";
import {useDispatch} from "react-redux";
import Divider from "@material-ui/core/Divider";
import Collapse from "@material-ui/core/Collapse";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import IconButton from "@material-ui/core/IconButton";
import {
    CheckCircle,
    DesktopWindows,
    ExpandMore,
    PhoneAndroid,
    PhonelinkErase,
    Sms,
    VerifiedUser,
    VpnKey
} from "@material-ui/icons";
import makeStyles from "@material-ui/core/styles/makeStyles";
import clsx from 'clsx';
import CardContent from "@material-ui/core/CardContent";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";
import Modal from "@material-ui/core/Modal";
import {ConfirmationModal} from "./utils/ConfirmationModal";
import {EnterOTP} from "./login/EnterOPT";
import {dateToLocalDateTime} from "./utils/date";

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
        header: {
            fontSize: "1.2rem"
        }
    }),
);

function Section(props: React.PropsWithChildren<{
    title: string
    icon: JSX.Element
}>) {
    const classes = useStyles();
    const [open, setOpen] = React.useState(true);
    return <Card className={classes.root}>
        <CardHeader
            title={props.title}
            avatar={props.icon}
            classes={{
                title: classes.header
            }}
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
    const [openDisableOTP, setOpenDisableOTP] = React.useState(false);
    const dispatch = useDispatch();
    const classes = useAccountStyles();

    const fetchData = async() => {
  //      setFetching(true);
        const res = await Api.getAccountInfos();
        setUser(res.data.user);
    //    setFetching(false)
    };

    async function startOTPRegistration() {
        if (user.has_registered_otp) {
            setOpenDisableOTP(true)
        } else {
            try {
                const res = await Api.requestOTPRegistration();
                setQrSrc(URL.createObjectURL(res.data));
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

        <Section title={"Two Factors Authentication"} icon={<VerifiedUser fontSize={"large"}/>}>
            <List subheader={<ListSubheader>
                <Typography variant={"h5"}>
                    Methods
                </Typography>
                <Typography variant={"subtitle1"} color={"secondary"}>
                    Manage your secondary authentication methods
                </Typography>
            </ListSubheader>}>
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
            <List subheader={<ListSubheader>
                <Typography variant={"h5"}>
                    Active sessions
                </Typography>
                <Typography variant={"subtitle1"} color={"secondary"}>
                    Consult sessions where two factors authentication is not prompted on login
                </Typography>
            </ListSubheader>}>
                {user.two_factors_cookies.map((elem, i) => <TwoFactorsCookie elem={elem} key={i}/>)}
            </List>
        </Section>
        <br/>
        <Section title={"Password"} icon={<VpnKey fontSize={"large"}/>}>
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
        <ConfirmationModal open={openDisableOTP} handleChoice={(valid: boolean) => {
            setOpenDisableOTP(false);
            if (valid) {
                alert("Not implemented yet");
            }
        }}>
            Do you really want to disable OTP ?
        </ConfirmationModal>
    </div>
}

function TwoFactorsCookie(props: {
    elem: TwoFactorsCookies
}) {
    return  <React.Fragment>
    <ListItem>
            <ListItemIcon>
                <DesktopWindows fontSize={"large"}/>
            </ListItemIcon>
            <ListItemText
                primary={props.elem.ip_addr}
                secondary={
                    <React.Fragment>
                        <Typography>
                            Created: {dateToLocalDateTime(new Date(props.elem.created_at))}
                        </Typography>
                        <Typography>
                            Last Used: {dateToLocalDateTime(new Date(props.elem.last_used))}
                        </Typography>
                        <Typography>
                            Expires: {dateToLocalDateTime(new Date(props.elem.expires))}
                        </Typography>
                        <Typography>
                            Agent: {props.elem.user_agent}
                        </Typography>
                    </React.Fragment>
                }
            />
        </ListItem>
        <Divider component="li"/>
    </React.Fragment>
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
            }} ctx={"tfa-registration"}/>
        </div>
    </Modal>
}
