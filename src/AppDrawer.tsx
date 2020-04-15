import React from "react"
import makeStyles from "@material-ui/core/styles/makeStyles";
import {createStyles, Theme, Drawer, ListItem, ListItemIcon, ListItemText} from "@material-ui/core";
import useTheme from "@material-ui/core/styles/useTheme";
import clsx from 'clsx';
import IconButton from "@material-ui/core/IconButton";
import {ChevronRight, ChevronLeft, Label, CalendarToday} from "@material-ui/icons";
import Divider from "@material-ui/core/Divider";
import List from "@material-ui/core/List";
import {useHistory, useLocation} from "react-router-dom";
import useMediaQuery from "@material-ui/core/useMediaQuery";
//Taken from https://material-ui.com/components/drawers/#mini-variant-drawer

export const DRAWER_WIDTH = 240;

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            display: 'flex',
        },
        drawer: {
            width: DRAWER_WIDTH,
            flexShrink: 0,
            whiteSpace: 'nowrap',
        },
        drawerOpen: {
            backgroundColor: "#EEEEEE",
            width: DRAWER_WIDTH,
            transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
            }),
        },
        drawerClose: {
            backgroundColor: "#EEEEEE",
            transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
            }),
            overflowX: 'hidden',
            width: theme.spacing(7) + 1,
            [theme.breakpoints.up('sm')]: {
                width: theme.spacing(9) + 1,
            },
        },
        toolbar: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            padding: theme.spacing(0, 1),
            // necessary for content to be below app bar
            ...theme.mixins.toolbar,
        },
        content: {
            flexGrow: 1,
            padding: theme.spacing(3),
        },
    }),
);

export default function AppDrawer(props: {
    open: boolean,
    changeOpen: (open: boolean) => void,
    content: JSX.Element
}) {
    const classes = useStyles();
    const theme = useTheme();

    const location = useLocation();
    const history = useHistory();


    const entriesPath = "/entries";
    const labelsPath = "/labels";

    return (
        <div className={classes.root}>
            <Drawer
                variant="permanent"
                className={clsx(classes.drawer, {
                    [classes.drawerOpen]: props.open,
                    [classes.drawerClose]: !props.open,
                })}
                classes={{
                    paper: clsx({
                        [classes.drawerOpen]: props.open,
                        [classes.drawerClose]: !props.open,
                    }),
                }}
            >
                <div className={classes.toolbar}>
                    <IconButton onClick={() => props.changeOpen(false)}>
                        {theme.direction === 'rtl' ? <ChevronRight/> : <ChevronLeft/>}
                    </IconButton>
                </div>
                <Divider/>
                <List>
                    <ListItem button selected={location.pathname.substr(0, entriesPath.length) === entriesPath} onClick={() => history.push(entriesPath)}>
                        <ListItemIcon><CalendarToday/></ListItemIcon>
                        <ListItemText primary={"Entries"} />
                    </ListItem>
                    <ListItem button selected={location.pathname.substr(0, labelsPath.length) === labelsPath} onClick={() => history.push(labelsPath)}>
                        <ListItemIcon><Label/></ListItemIcon>
                        <ListItemText primary={"Labels"} />
                    </ListItem>
                </List>
            </Drawer>
            <main className={classes.content}>
                {props.content}
            </main>
        </div>
    );
}