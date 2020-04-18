import React from "react"
import {Label} from "../models/Label";
import Chip, {ChipProps} from "@material-ui/core/Chip";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {createStyles, Theme} from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Avatar from "@material-ui/core/Avatar";

const avatarThemeSize = 5;

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        label: {
//            color: "black",
            fontSize: 16,
 //           webkitTextStrokeWidth: "1px black", // Doesn't seem to be actually supported
//            textShadow: "-1px -1px 1px #000, 1px -1px 1px #000, -1px 1px 1px #000, 1px 1px 1px #000;",

            //fontSize: "22px",
            height: theme.spacing(avatarThemeSize + 1),
            //borderRadius: "25px",
   //         backgroundColor: (props: any) => props.color
        },
        avatar: {
            backgroundColor: (props: any) => props.color || "white",
            width: theme.spacing(7),
            height: theme.spacing(7),
//            position: "relative",
        },
        root: {
            '& $avatar': {
                marginLeft: 5,
                marginRight: -6,
                width: theme.spacing(avatarThemeSize),
                height: theme.spacing(avatarThemeSize),
                fontSize: 16,
                backgroundColor: "white"
            },
        },
        outlined: {
            backgroundColor: "rgba(255, 255, 255, 0.8)"
        },
        container: {
            margin: 3
        }
    }),
);

interface ILabelChipProps {
    color: string,
    avatarUrl?: string
}

export function addImageIfGodWillsIt(): boolean {
    return false;
//        return Math.random() > 0.7
}

// Takes as parameters custom labels and all chip props except those custom declared
export function LabelChip(props: ILabelChipProps & Omit<ChipProps, keyof ILabelChipProps>) {
    const classes = useStyles(props);

    // We separate color from the props
    const {color, avatarUrl, ...other} = props;

    const avatarValue = other && other.label && (other.label as string).length > 0 ? (other.label as string)[0].toUpperCase() : "";

    return <Chip
        variant={"outlined"}
        classes={{
            avatar: classes.avatar,
            root: classes.root,
            outlined: classes.outlined,
        }}
        avatar={<Avatar src={avatarUrl}>
            {avatarValue}
        </Avatar>}
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
            avatarUrl={elem.avatar_url}
        /></Grid>
    })
    }</Grid>
}