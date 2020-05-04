import React from "react"
import {Drawer, ListItem, ListItemText} from "@material-ui/core";
import clsx from 'clsx';
import Divider from "@material-ui/core/Divider";
import List from "@material-ui/core/List";
import {useDrawerStyles} from "../AppDrawer";
import Picker from "../label/Picker";
import Typography from "@material-ui/core/Typography";


export default function EntryFilterDrawer(props: {
    content: JSX.Element
}) {
    const classes = useDrawerStyles();
    const open = true;

    return ( <div className={classes.root}>
            <main className={classes.content}>
                {props.content}
            </main>

            <Drawer
                anchor={"right"}
                variant="permanent"
                className={clsx(classes.drawer, {
                    [classes.drawerOpen]: open,
                    [classes.drawerClose]: !open,
                })}
                classes={{
                    paper: clsx({
                        [classes.drawerOpen]: open,
                        [classes.drawerClose]: !open,
                    }),
                }}
            >
                <div className={classes.toolbar}/>
                <div style={{padding: 7}}>
                <Typography variant={"h4"} color={"primary"} align={"center"} gutterBottom>
                    Filters
                </Typography>
                <Picker labels={[]} addLabelToEntry={async (ids: number[]) => {return}} narrow={true}/>
                </div>
            </Drawer>
    </div>

);
}