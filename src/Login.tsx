import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardContent from "@material-ui/core/CardContent";
import TextField from "@material-ui/core/TextField";
import CardActions from "@material-ui/core/CardActions";
import Button from "@material-ui/core/Button";
import React, {ChangeEvent} from "react";
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Divider from "@material-ui/core/Divider";
import {Link, Redirect} from "react-router-dom";
import Api from "./Api";
import {Select} from "@material-ui/core";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import MenuItem from "@material-ui/core/MenuItem";
import InputAdornment from "@material-ui/core/InputAdornment";
import {Keyboard as KeyboardIcon} from "@material-ui/icons";
import IconButton from "@material-ui/core/IconButton";
import VirtualKeyboard from "./login/VirtualKeyboard";
import Tooltip from "@material-ui/core/Tooltip";
import Collapse from "@material-ui/core/Collapse";
import {useDispatch, useSelector} from "react-redux";
import {EXAMPLE_ACTION, State} from "./redux/reducers/root";
import {login as actionLogin} from "./redux/reducers/root";
import {EnterOTP} from "./Account";
import {AxiosError} from "axios";
import Snackbar from "@material-ui/core/Snackbar";
import {Alert} from "@material-ui/lab";
import HttpErrorHandler from "./utils/HttpErrorHandler";
import AxiosErrorHandler from "./utils/AxiosErrorHandler";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            maxWidth: 545,
        },
        field: {
            width: "100%",
            marginTop: "5px",
        }, media: {
            height: 140,
        },
        button: {
            width: "100%"
        },
        action: {
            flexDirection: "column",
        },
        divider: {
            width: "100%",
            marginTop: 30,
            marginBottom: 20,
        },
    }),
);

export function Login() {
    const classes = useStyles();
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [redirect, setRedirect] = React.useState<boolean>(false);
    const [duration, setDuration] = React.useState<number>(1000 * 60 * 30); // 30 minutes
    const [openKeyboard, setOpenKeyboard] = React.useState<boolean>(false);
    const [TFAToken, setTFAToken] = React.useState("");

    /*
        This is an exemple on how to handle  http errors:
     */
    const [axiosError, setAxiosError] = React.useState<AxiosError | null>(null);
    const errorHandler = new HttpErrorHandler();
    errorHandler.messages.set(404, "User not found");

    const dispatch = useDispatch();

    function onChangeEmail(event: any) {
        setEmail(event.target.value)
    }

    function onChangePassword(event: any) {
        setPassword(event.target.value)
    }

    async function login() {
        try {
            const res = await Api.login(email, password, duration);
            // TFA is required
            if (res.data.two_factors_methods.length > 0) {
                setTFAToken(res.data.token);
            } else {
                dispatch(actionLogin());
                setRedirect(true)
            }
        } catch (e) {
            setAxiosError(e);
//            console.log(e);
            // todo
        }
    }

    if (redirect) {
        return <Redirect to={{ pathname: "/" }} />
    }

    async function keyPress(e: any) {
        if (e.keyCode === 13) {
            await login();
        }
    }

    return <Card className={classes.root} elevation={5}>
        <CardHeader title={"Encrypted Diary"} subheader={"Log in"}/>
        <CardContent>
            <TextField className={classes.field} type={"email"} onKeyDown={keyPress} label="Email" variant="outlined" placeholder="awesome@mail.com" value={email} onChange={onChangeEmail}/>
            <TextField className={classes.field}
                       value={password}
                       onKeyDown={keyPress}
                       onChange={onChangePassword}
                       variant="outlined"
                       label="Password"
                       type="password"
                       InputProps={{
                           endAdornment: <InputAdornment position="end">
                               <Tooltip title={"Virtual keyboard to prevent key logging"}>
                                   <IconButton onClick={() => setOpenKeyboard(!openKeyboard)}>
                                       <KeyboardIcon/>
                                   </IconButton>
                               </Tooltip>
                           </InputAdornment>
                       }}
            />
            <Collapse in={openKeyboard}>
                <VirtualKeyboard
                    onKeyPress={(button: string) => setPassword(password + button)}
                    onBackSpace={() => {
                        if (password.length > 0) {
                            setPassword(password.slice(0, password.length - 1))
                        }
                    }}
                />
            </Collapse>

            <FormControl variant="outlined" className={classes.field}>
                <InputLabel htmlFor="filled-simple">Session Duration</InputLabel>
                <Select
                    label={"Session Duration"}
                    value={duration}
                    onChange={(event: ChangeEvent<{value: unknown}>) => setDuration(event.target.value as number)}
                >
                    <MenuItem value={1000 * 60 * 10}>10 minutes</MenuItem>
                    <MenuItem value={1000 * 60 * 15}>15 minutes</MenuItem>
                    <MenuItem value={1000 * 60 * 30}>30 minutes</MenuItem>
                    <MenuItem value={1000 * 60 * 60}>1 hour</MenuItem>
                </Select>
            </FormControl>
        </CardContent>
        <CardActions className={classes.action}>
            {TFAToken === "" ?
                <Button className={classes.button} variant={"contained"} color={"primary"} onClick={login}>Log
                    in</Button> :
                <EnterOTP token={TFAToken} onValid={(accessToken) => {
                    Api.onLogin(accessToken);
                    dispatch(actionLogin());
                    setRedirect(true)
                }}/>
            }
            <Divider className={classes.divider}/>
            <Link to={"/register"}>Register here</Link>
        </CardActions>
        {axiosError && <AxiosErrorHandler error={axiosError} onAlertClose={() => setAxiosError(null)} errorHandler={errorHandler}/>}
    </Card>;
}
