import React from "react"
import {Drawer} from "@material-ui/core";
import clsx from 'clsx';
import {useDrawerStyles} from "../AppDrawer";
import Picker from "../label/Picker";
import Typography from "@material-ui/core/Typography";
import {useDispatch, useSelector} from "react-redux";
import {setFiltersLabels, State} from "../redux/reducers/root";
import {Label} from "../models/Label";


export default function EntryFilterDrawer(props: {
    content: JSX.Element
}) {
    const classes = useDrawerStyles();
    const open = true;
    const dispatch = useDispatch();
    const filterLabels = useSelector((state: State) => state.filterLabels)

    async function updateLabels(labels: Label[]) {
        dispatch(setFiltersLabels(labels));
    }

    return (<div className={classes.root}>
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
                <Picker labels={filterLabels} addLabelToEntry={updateLabels} narrow={true}/>
                </div>
            </Drawer>
    </div>

);
}