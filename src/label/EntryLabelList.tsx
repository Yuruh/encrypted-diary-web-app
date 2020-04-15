import React from "react"
import {Label} from "../models/Label";
import Chip, {ChipProps} from "@material-ui/core/Chip";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {createStyles, Theme} from "@material-ui/core";
import Grid from "@material-ui/core/Grid";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        label: {
            color: "black",
            fontSize: 15,
            webkitTextStrokeWidth: "1px black", // Doesn't seem to be actually supported
//            textShadow: "-1px -1px 1px #000, 1px -1px 1px #000, -1px 1px 1px #000, 1px 1px 1px #000;",

            //fontSize: "22px",
            //height: "50px",
            //borderRadius: "25px",
            backgroundColor: (props: any) => props.color
        },
        container: {
            margin: 3
        }
    }),
);

interface ILabelChipProps {
    color: string
}

// Takes as parameters custom labels and all chip props except those custom declared
export function LabelChip(props: ILabelChipProps & Omit<ChipProps, keyof ILabelChipProps>) {
    const classes = useStyles(props);

    // We separate color from the props
    const {color, ...other} = props;

    return <Chip
        variant={"outlined"}
        className={classes.label}
        {...other}

    />
}

// https://material-ui.com/styles/basics/#adapting-based-on-props
export default function EntryLabelList(props: {
    labels: Label[]
}) {
    return <Grid container spacing={1}>{props.labels.map((elem: Label, i) => {
        return <Grid item key={i}><LabelChip
            label={elem.name}
            color={elem.color}
        /></Grid>
    })
    }</Grid>
}