import React, {useEffect} from "react";
import {Box, createStyles, Theme} from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";
import CircularProgress from "@material-ui/core/CircularProgress";
import Api, {decryptLabelAvatar} from "../Api";
import {Label} from "../models/Label";
import {LabelChip} from "./EntryLabelList";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import Button from "@material-ui/core/Button";
import {Delete, Save} from "@material-ui/icons";
import ImageCropper from "./Cropper";
import {useDispatch, useSelector} from "react-redux";
import {addDecryptedLabel, axiosError, EXAMPLE_ACTION, State} from "../redux/reducers/root";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        button: {
            margin: theme.spacing(1),
        },
        arrow: {
            fontSize: 40,
        }
    }),
);

// For avatars: https://github.com/roadmanfong/react-cropper


export default function LabelList() {
//    const classes = useStyles({});

    const [selectedLabel, setSelectedLabel] = React.useState<Label | null>(null);
    const [labels, setLabels] = React.useState<Label[]>([]);
    const [fetching, setFetching] = React.useState(false);

    const decryptedLabels = useSelector((state: State) => state.decryptedLabels);
    const dispatch = useDispatch();

    const fetchData = async() => {
        setFetching(true);
        const result = await Api.getLabels("", [], Number.MAX_SAFE_INTEGER, 1);

        // This logic should be in a reducer. Use redux thunks middleware for async actions

        // For each label avatar url, we check if it is already saved globally.
        const promises = [];
        for (const label of result.data.labels as Label[]) {
            const existing = decryptedLabels.find((elem) => elem.id === label.id);
            if (existing) {
                label.avatar_url = existing.decryptedImage
            } else {
                promises.push(decryptLabelAvatar(label));
            }
        }
        const decrypted: Label[] = await Promise.all(promises);

        for (const label of decrypted) {
            dispatch(addDecryptedLabel({id: label.id, decryptedImage: label.avatar_url}));
        }
        setLabels(result.data.labels);
        setFetching(false);
    };

    useEffect(() => {
        fetchData().catch((e) => dispatch(axiosError(e)));
    }, []);

    if (fetching) {
        return <span>Fetching data and decrypting images ...<CircularProgress/></span>
    }

    function onEdit(label: Label) {
        const existingLabelIdx: number = labels.findIndex((elem: Label) => elem.id === label.id);
        labels[existingLabelIdx] = {...label};
        setLabels([...labels]);
        setSelectedLabel(labels[existingLabelIdx])
    }

    function onDelete(labelId: number) {
        setLabels(labels.filter((elem: Label) => elem.id !== labelId));
        setSelectedLabel(null)
    }


    return <div>
        <div style={{marginBottom: "20px"}}>
            <Typography variant={"h4"} color={"primary"}>
                My Labels
            </Typography>
            <Typography variant={"subtitle1"} color={"secondary"} gutterBottom={true}>
                Click to edit
            </Typography>
            <Grid container spacing={1}>
                {labels.map((elem: Label, i) => {
                    return <Grid key={i} item>
                        <LabelChip color={elem.color} label={elem.name} avatarUrl={elem.avatar_url} onClick={() => setSelectedLabel(elem)}/>
                    </Grid>
                })}
            </Grid>
        </div>
        {selectedLabel !== null && <LabelEditor selectedLabel={selectedLabel} onDeleteSuccess={onDelete} onEditSuccess={onEdit}/>}
    </div>
}

function LabelEditor(props: {
    selectedLabel: Label,
    onEditSuccess: (label: Label) => void;
    onDeleteSuccess: (labelId: number) => void;
}) {
    const classes = useStyles({});

    const [label, setLabel] = React.useState<Label>(props.selectedLabel);
    const [avatarUrl, setAvatarUrl] = React.useState<string>("");
    const dispatch = useDispatch();

    if (props.selectedLabel.id !== label.id) {
        setLabel(props.selectedLabel);
    }

    return <div>
        <Typography variant={"h4"} color={"primary"} gutterBottom={true}>
            Label edition
        </Typography>
        <TextField value={label.name}
                   onChange={(event) => setLabel({...label, name: event.target.value})}/>
        <input type="color" name="color"
               value={label.color} onChange={(event) => setLabel({...label, color: event.target.value})}/>
        <ImageCropper updateDataUrl={(data) => setAvatarUrl(data)}/>
        <br/>
        <br/>
        <Box display={"flex"} alignItems={"center"}>
            <LabelChip color={props.selectedLabel.color} label={props.selectedLabel.name} avatarUrl={props.selectedLabel.avatar_url}/>
            <span className={classes.arrow}>&rarr;</span>
            <LabelChip color={label.color} label={label.name} avatarUrl={avatarUrl}/>
        </Box>
        <br/>
        <br/>
        <Button className={classes.button} variant={"contained"} color={"primary"} startIcon={<Save/>}
                onClick={async () => {
                    try {
                        const res = await Api.editLabel(label, avatarUrl);
                        props.onEditSuccess(res.data.label);
                    } catch (e) {
                        dispatch(axiosError(e));
                    }
                }}>Confirm changes</Button>
        <Button className={classes.button} variant={"contained"} color={"secondary"} startIcon={<Delete/>}
                onClick={async () => {
                    try {
                        await Api.deleteLabel(label);
                        props.onDeleteSuccess(label.id);
                    } catch (e) {
                        dispatch(axiosError(e));
                    }
                }}>Delete label</Button>
        <br/>
        <br/>
        <Divider/>
    </div>
}