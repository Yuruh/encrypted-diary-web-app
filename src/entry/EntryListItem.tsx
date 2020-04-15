import GridListTile from "@material-ui/core/GridListTile";
import Divider from "@material-ui/core/Divider";
import Typography from "@material-ui/core/Typography";
import {Entry} from "../models/Entry";
import moment from "moment";
import EntryLabelList, {addImageIfGodWillsIt} from "../label/EntryLabelList";
import Box from "@material-ui/core/Box";
import GridListTileBar from "@material-ui/core/GridListTileBar";
import React from "react";
import IconButton from "@material-ui/core/IconButton";
import {Edit, Visibility} from "@material-ui/icons";
import {IEntriesByMonth, upperCaseFirstLetter} from "../EntryList";
import useTheme from "@material-ui/core/styles/useTheme";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {createStyles, Theme} from "@material-ui/core";
import {useHistory} from "react-router-dom";

const useStyles = makeStyles((theme: Theme) =>
        createStyles({
            dividerFullWidth: {
                margin: `5px 0 0 ${theme.spacing(2)}px`,
            },
            elemBar: {
                backgroundColor: "rgba(0, 0, 0, 0.7)",
                height: "50px",
                textShadow: "-1px -1px 1px rgba(0, 0, 0, 0.4), 1px -1px 1px rgba(0, 0, 0, 0.4), -1px 1px 1px rgba(0, 0, 0, 0.4), 1px 1px 1px rgba(0, 0, 0, 0.4);",
            },
            elemIcon: {
                color: "white",
                marginLeft: 'auto'
            },
            elemContainer: {
                backgroundColor: "white",
                padding: 5,
                height: "100%",
                flexBasis: "100%",
            },
            elemImageContainer: {
                height: "100%",
                flexBasis: "70%",
//            flexShrink: 0
            },
            elemImage: {
                marginLeft: "auto",
                marginRight: "auto",
                maxWidth: "100%", // 50% with labels, 100% without ?
                width: "auto",
                height: "auto",
                objectFit: "cover",
            },
            divider: {
                //color: "white",
                //backgroundColor: theme.palette.primary.main
                margin: `5px 0 0 ${theme.spacing(2)}px`,
            },
        }),
);

export default function EntryListItem(props: {monthly: IEntriesByMonth}): any {
    const theme = useTheme();
    const downSm = useMediaQuery(theme.breakpoints.down('sm'));
    const downMd = useMediaQuery(theme.breakpoints.down('md'));
    const history = useHistory();

    const classes = useStyles();

    const [redirect, setRedirect] = React.useState("");

    let nbColsInGrid = 5;
    if (downSm) {
        nbColsInGrid = 2;
    } else if (downMd) {
        nbColsInGrid = 3;
    }

    if (redirect !== "") {
        history.push(redirect);
        return [];
    }

    return [
        <GridListTile key="Subheader" cols={nbColsInGrid} style={{ height: 'auto'}}>
            <Divider/>
            <br/>
            <Typography className={"divider"}
                        color="textPrimary"
                        display="block"
                        variant="subtitle1">
                {upperCaseFirstLetter(props.monthly.month + " " + props.monthly.year)}
            </Typography>
        </GridListTile>,
        props.monthly.entries.map((elem: Entry, i) => {
            let date = moment(elem.created_at).format("dddd D MMMM YYYY ");
            date = upperCaseFirstLetter(date);

            const godWillsIt: boolean = addImageIfGodWillsIt();
            let colSpan = 1;
            if (godWillsIt && nbColsInGrid >= 2) {
                colSpan = 2
            }
            return <GridListTile key={i} cols={colSpan}>
                <Box display={"flex"} style={{backgroundColor: "white", height: "100%"}}>
                    {godWillsIt && <div className={classes.elemImageContainer}><img
                        className={classes.elemImage}
                        src={"https://avatars2.githubusercontent.com/u/13162326?s=460&u=44e0f40c4b6442d8d0932ceaa1da7d072db4b847&v=4"}
                        alt={"toto"}
                    /></div>}
                    <div className={classes.elemContainer}>
                        {elem.labels.length > 0 ? <EntryLabelList labels={elem.labels}/> : <p>a pa dlabel</p>}
                    </div>
                </Box>
                <GridListTileBar
                    title={date}
                    subtitle={elem.title}
                    className={classes.elemBar}
                    actionIcon={
                        <React.Fragment>
                            <IconButton className={classes.elemIcon} onClick={() => setRedirect("/entries/" + elem.id + "?display=edit")} aria-label="edit">
                                <Edit/>
                            </IconButton>
                            <IconButton className={classes.elemIcon} onClick={() => setRedirect("/entries/" + elem.id + "?display=view")} aria-label="view">
                                <Visibility/>
                            </IconButton>
                        </React.Fragment>
                    }
                />
            </GridListTile>
        })]
}