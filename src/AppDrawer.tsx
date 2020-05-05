import React from "react"
import makeStyles from "@material-ui/core/styles/makeStyles";
import {createStyles, Theme, Drawer, ListItem, ListItemIcon, ListItemText} from "@material-ui/core";
import clsx from 'clsx';
import {Label, CalendarToday, AccountCircle} from "@material-ui/icons";
import Divider from "@material-ui/core/Divider";
import List from "@material-ui/core/List";
import {useHistory, useLocation} from "react-router-dom";
import Link from "@material-ui/core/Link";

//Adapted from https://material-ui.com/components/drawers/#mini-variant-drawer

export const DRAWER_WIDTH = 240;

export const useDrawerStyles = makeStyles((theme: Theme) =>
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
            width: DRAWER_WIDTH,
/*            transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
            }),*/
        },
        drawerClose: {
/*            transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
            }),*/
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
        footer: {
            margin: "auto 10px 10px 10px",

        }
    }),
);

export default function AppDrawer(props: {
    open: boolean,
    changeOpen: (open: boolean) => void,
    content: JSX.Element
}) {
    const classes = useDrawerStyles();

    const location = useLocation();


    const entriesPath = "/entries";
    const labelsPath = "/labels";
    const accountPath = "/account";

    const history = useHistory();

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
                <div className={classes.toolbar}/>
                <Divider/>
                <List>
                    <ListItem button selected={location.pathname.substr(0, entriesPath.length) === entriesPath} onClick={() => history.push(entriesPath)}>
                        <ListItemIcon><CalendarToday color="primary"/></ListItemIcon>
                        <ListItemText color="primary" primary={"Entries"} />
                    </ListItem>
                    <ListItem button selected={location.pathname.substr(0, labelsPath.length) === labelsPath} onClick={() => history.push(labelsPath)}>
                        <ListItemIcon><Label color="primary"/></ListItemIcon>
                        <ListItemText primary={"Labels"} />
                    </ListItem>
                    <ListItem button selected={location.pathname.substr(0, accountPath.length) === accountPath} onClick={() => history.push(accountPath)}>
                        <ListItemIcon><AccountCircle color="primary"/></ListItemIcon>
                        <ListItemText primary={"Settings"} />
                    </ListItem>
                </List>
                <div className={classes.footer}>
                    <Link href={"https://github.com/yuruh/encrypted-diary#encrypted-diary"} target={"_blank"} rel={"noreferrer"}
                          variant={"subtitle1"}>
                        About
                    </Link>
                </div>
            </Drawer>
            <main className={classes.content}>
                {props.content}
            </main>
        </div>
    );
}