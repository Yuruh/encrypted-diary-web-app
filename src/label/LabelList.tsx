import React, {useEffect} from "react";
import {createStyles, Theme} from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";
import CircularProgress from "@material-ui/core/CircularProgress";
import Api from "../Api";
import {Label} from "../models/Label";
import {LabelChip} from "./EntryLabelList";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import Button from "@material-ui/core/Button";
import {Delete, Save} from "@material-ui/icons";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        button: {
            margin: theme.spacing(1),
        },
    }),
);


export default function LabelList() {
    const classes = useStyles({});

    const [selectedLabel, setSelectedLabel] = React.useState<Label | null>(null);
    const [labels, setLabels] = React.useState<Label[]>([]);
    const [fetching, setFetching] = React.useState(false);
    const [redirect, setRedirect] = React.useState("");

    const fetchData = async() => {
        setFetching(true);
        const result = await Api.getLabels("", Number.MAX_SAFE_INTEGER, 1);
        setLabels(result.data.labels);
        setFetching(false);
    };

    useEffect(() => {
        fetchData().catch(e => console.log(e));
    }, []);

    if (fetching) {
        return <CircularProgress/>
    }




    return <div>
        {selectedLabel !== null && <div style={{marginBottom: "20px"}}>
            <Typography variant={"h4"} color={"primary"} gutterBottom={true}>
                Label edition
            </Typography>
            <TextField value={selectedLabel?.name}
                       onChange={(event) => setSelectedLabel({...selectedLabel, name: event.target.value})}/>
            <input type="color" name="color"
                   value={selectedLabel?.color} onChange={(event) => setSelectedLabel({...selectedLabel, color: event.target.value})}/>
            <br/>
            <br/>
            <span>Preview:  <LabelChip color={selectedLabel?.color} label={selectedLabel?.name}/></span>
            <br/>
            <br/>
            <Button className={classes.button} variant={"contained"} color={"primary"} startIcon={<Save/>}>Confirm changes</Button>
            <Button className={classes.button} variant={"contained"} color={"secondary"} startIcon={<Delete/>}>Delete label</Button>
            <br/>
            <br/>
            <Divider/>
        </div>}
        <div>
            <Typography variant={"h4"} color={"primary"} gutterBottom={true}>
                My Labels
            </Typography>
            <Grid container spacing={1}>
                {labels.map((elem: Label, i) => {
                    return <Grid key={i} item>
                        <LabelChip color={elem.color} label={elem.name} onClick={() => setSelectedLabel(elem)}/>
                    </Grid>
                })}
            </Grid>
        </div>
    </div>
}
