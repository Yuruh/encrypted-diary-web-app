import React, {useEffect} from "react";
import Header from "./Header";
import {createStyles, Theme} from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {Entry} from "./models/Entry";
import Api from "./Api";
import Fab from "@material-ui/core/Fab";
import AddIcon from '@material-ui/icons/Add';
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardContent from "@material-ui/core/CardContent";
import IconButton from "@material-ui/core/IconButton";
import {Edit, Visibility} from "@material-ui/icons";
import CardActions from "@material-ui/core/CardActions";
import CircularProgress from "@material-ui/core/CircularProgress";
import { useHistory } from "react-router-dom";
import Typography from "@material-ui/core/Typography";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        tooltip: {
            fontSize: 16,
        },
        fab: {
            margin: 0,
            top: 'auto',
            right: 20,
            bottom: 20,
            left: 'auto',
            position: 'fixed',
        },
        grid: {
            [theme.breakpoints.up("md")]: {
                padding: "30px 100px 20px 100px",
            },
            [theme.breakpoints.down("sm")]: {
                padding: "5px",
            },
        },
        cardAction: {
            marginLeft: 'auto'
        },
        root: {

        }
    }),
);


export default function EntryList() {
    const classes = useStyles({});
    const history = useHistory();

    const [entries, setEntries] = React.useState<Entry[]>([]);
    const [fetching, setFetching] = React.useState(false);
    const [redirect, setRedirect] = React.useState("");

    const fetchData = async() => {
        setFetching(true);
        const result = await Api.getEntries();
        setEntries(result.data.entries);
        setFetching(false);
    };

    useEffect(() => {
        fetchData().catch(e => console.log(e));
    }, []);

    if (fetching) {
        return <CircularProgress/>
    }

    if (redirect != "") {
        history.push(redirect);
    }

    return <div>
        <Header/>
        <Grid className={classes.grid} container spacing={3}>
            {entries.map((elem: Entry, i) => {
                return <Grid item xs={12} sm={6} lg={3} key={i}>
                    <Card elevation={3}>
                        <CardHeader title={new Date(elem.created_at).toLocaleDateString()} subheader={elem.title}/>
                        <CardContent>

                        </CardContent>
                        <CardActions>
                            <IconButton onClick={() => setRedirect("/entry/" + elem.id + "?display=edit")} aria-label="edit" className={classes.cardAction}>
                                <Edit/>
                            </IconButton>
                            <IconButton onClick={() => setRedirect("/entry/" + elem.id + "?display=view")} aria-label="view" className={classes.cardAction}>
                                <Visibility/>
                            </IconButton>
                        </CardActions>
                    </Card>
                </Grid>
            })}
        </Grid>
        <Fab color="primary" aria-label="add" size={"large"} className={classes.fab} onClick={async () => {
            const entry: Entry = new Entry();
            entry.title = "Diary Entry";
            entry.content = "Your entry content, in **markdown** format, client-side encrypted";
            try {
                const res = await Api.addEntry(entry);
                setRedirect("/entry/" + res.data.entry.id + "?display=edit")
            } catch (e) {
                // todo
            }
        }}>
            <AddIcon/>
        </Fab>
    </div>
}
