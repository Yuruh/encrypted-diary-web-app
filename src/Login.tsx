import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardContent from "@material-ui/core/CardContent";
import TextField from "@material-ui/core/TextField";
import CardActions from "@material-ui/core/CardActions";
import Button from "@material-ui/core/Button";
import React from "react";
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import {CardMedia} from "@material-ui/core";
import Divider from "@material-ui/core/Divider";
import {Link, Redirect} from "react-router-dom";
import Api from "./Api";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            maxWidth: 345,
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
        }
    }),
);

const specials: string = "~!@#$%^&*()-_+={}[]|\\/:;'<>,.?\"€";

function validatePwd(pwd: string): boolean {
    if (!pwd || pwd.length === 0) {
        return true
    }
    let number: boolean = false;
    let upper: boolean = false;
    let special: boolean = false;

    for (const c of pwd) {
        if (c >= '0' && c <= '9') {
            number = true;
        }
        if (c >= 'A' && c <= 'Z') {
            upper = true;
        }
        if (specials.includes(c)) {
            special = true;
        }
    }
    return number && upper && special;
}

export function Login() {
    const classes = useStyles();
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [redirect, setRedirect] = React.useState<boolean>(false);

    function onChangeEmail(event: any) {
        setEmail(event.target.value)
    }

    function onChangePassword(event: any) {
        setPassword(event.target.value)
    }

    async function login() {
        try {
            await Api.login(email, password);
            setRedirect(true)
        } catch (e) {
            console.log(e);
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
            <TextField className={classes.field} value={password} onKeyDown={keyPress} onChange={onChangePassword} variant="outlined" label="Password" type="password"/>
        </CardContent>
        <CardActions className={classes.action}>
            <Button className={classes.button} variant={"contained"} color={"primary"} onClick={login}>Log in</Button>
            <Divider className={classes.divider}/>
            <Link to={"/register"}>Register here</Link>
        </CardActions>
    </Card>;
}
