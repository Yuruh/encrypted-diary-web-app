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

export function Register() {
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

    async function register() {
        try {
            await Api.register(email, password);
            setRedirect(true)
        } catch (e) {

        }
    }

    const validPwd: boolean = validatePwd(password);

    if (redirect) {
        return <Redirect to={{ pathname: "/login" }} />
    }

    return <Card className={classes.root} elevation={5}>
        <CardMedia component={"img"} image={"/diary.jpg"} title={"diary"}/>
        <CardHeader title={"Encrypted Diary"} subheader={"So your private thoughts stay private"}/>
        <CardContent>
                <TextField className={classes.field} required label="Email" variant="outlined" placeholder="awesome@mail.com" value={email} onChange={onChangeEmail}/>
                <TextField className={classes.field} value={password} onChange={onChangePassword} variant="outlined" error={!validPwd} required label="Password" type="password"
                           helperText={"Minimum eight characters, at least one uppercase letter, " +
                           "one lowercase letter, one number and one special character"}/>
        </CardContent>
        <CardActions className={classes.action}>
            <Button className={classes.button} variant={"contained"} color={"primary"} onClick={register}>Register</Button>
            <Divider className={classes.divider}/>
            <Link to={"/login"}>Log in here</Link>
        </CardActions>
    </Card>;
}
