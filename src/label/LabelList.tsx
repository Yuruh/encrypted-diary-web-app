import React from "react"
import {Label} from "../models/Label";
import Chip, {ChipProps} from "@material-ui/core/Chip";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {createStyles, Theme} from "@material-ui/core";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        label: {
            color: "white",
            textShadow: "0px 0px 2px black",
            //fontSize: "22px",
            //height: "50px",
            //borderRadius: "25px",
            backgroundColor: (props: any) => props.color
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
export default function LabelList(props: {
    labels: Label[]
}) {
    return <React.Fragment>{props.labels.map((elem: Label, i) => {

        return <LabelChip
            key={i}
            label={elem.name}
            color={elem.color}
        />
    })
    }</React.Fragment>
}