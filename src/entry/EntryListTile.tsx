import {Entry} from "../models/Entry";
import EntryLabelList, {addImageIfGodWillsIt} from "../label/EntryLabelList";
import Box from "@material-ui/core/Box";
import {BoxCenter} from "../BoxCenter";
import Typography from "@material-ui/core/Typography";
import React from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {createStyles, Theme} from "@material-ui/core";
import {Label} from "../models/Label";

const useStyles = makeStyles((theme: Theme) =>
        createStyles({
            background: {
                position: "absolute",
                width: "100%",
                height: "100%",
                backgroundImage: (props: any) => "url(" + props.url + ")" || "rgb(255, 255, 255)",
//                backgroundImage: "url('https://avatars2.githubusercontent.com/u/13162326?s=460&u=44e0f40c4b6442d8d0932ceaa1da7d072db4b847&v=4')",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                backgroundSize: "cover",
                //backdropFilter: "blur(3px)",
                filter: "blur(6px)",
            },
            container: {
                padding: 5,
                height: "100%",
                position: "relative",
            },
            imageContainer: {
                height: "100%",
                flexBasis: "70%",
//            flexShrink: 0
            },
            image: {
                marginLeft: "auto",
                marginRight: "auto",
                maxWidth: "100%", // 50% with labels, 100% without ?
                width: "auto",
                height: "auto",
                objectFit: "cover",
            },
        }),
);

export function TileContent(props: {elem: Entry}) {
    const godWillsIt: boolean = addImageIfGodWillsIt();
    let url = null;

    const firstLabelWithUrl: Label | undefined = props.elem.labels.find((elem: Label) => elem.avatar_url != "");

    if (firstLabelWithUrl) {
        url = firstLabelWithUrl.avatar_url;
    }
    const styleProps = { url: url };

    const classes = useStyles(styleProps);

    return <Box display={"flex"} style={{
        backgroundColor: "white",
        height: "100%" ,
    }}>

        {godWillsIt && <div className={classes.imageContainer}><img
            className={classes.image}
            src={"https://avatars2.githubusercontent.com/u/13162326?s=460&u=44e0f40c4b6442d8d0932ceaa1da7d072db4b847&v=4"}
            alt={"toto"}
        /></div>}
        <div className={classes.background}/>
        <div className={classes.container}>
            {props.elem.labels.length > 0 ? <EntryLabelList labels={props.elem.labels}/> : <BoxCenter style={{height: "80%", width:"100%"}}>
                <Typography variant="h5">
                    {props.elem.title}
                </Typography>
            </BoxCenter>}
        </div>
    </Box>
}