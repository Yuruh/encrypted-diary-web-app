import React, {useEffect} from "react";
import {createStyles, Theme} from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {Entry} from "./models/Entry";
import Api from "./Api";
import Fab from "@material-ui/core/Fab";
import AddIcon from '@material-ui/icons/Add';
import IconButton from "@material-ui/core/IconButton";
import {Edit, Visibility} from "@material-ui/icons";
import CircularProgress from "@material-ui/core/CircularProgress";
import {useHistory} from "react-router-dom";
import EntryLabelList, {addImageIfGodWillsIt} from "./label/EntryLabelList";
import {DRAWER_WIDTH} from "./AppDrawer";
import "./dateHelper"
import moment from "moment";
import GridList from "@material-ui/core/GridList";
import GridListTile from "@material-ui/core/GridListTile";
import GridListTileBar from "@material-ui/core/GridListTileBar";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import Box from "@material-ui/core/Box";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import useTheme from "@material-ui/core/styles/useTheme";
import InfiniteScroll from 'react-infinite-scroller';
import {Pagination} from "./models/Pagination";
import { BoxCenter } from "./BoxCenter";

moment.locale(navigator.language);

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        tooltip: {
            fontSize: 16,
        },
        fab: {
            margin: 0,
            top: 'auto',
            right: 20,
            bottom: 20,
            left: 'auto',
            position: 'fixed',
        },
        content: {
            flexGrow: 1,
//            padding: theme.spacing(3),
            [theme.breakpoints.up("md")]: {
                padding: "30px 100px 20px 100px",
            },
            [theme.breakpoints.down("sm")]: {
                padding: "5px",
            },
        },
        cardAction: {
            marginLeft: 'auto'
        },
        drawer: {
            width: DRAWER_WIDTH,
            flexShrink: 0,
            whiteSpace: 'nowrap',
        },
        drawerSurface: {
            width: DRAWER_WIDTH,
            backgroundColor: "#EEEEEE",
            overflowX: 'hidden',
        },
        root: {
            display: 'flex',
        },
        toolbar: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            padding: theme.spacing(0, 1),
            // necessary for content to be below app bar
            ...theme.mixins.toolbar,
        },
        dividerFullWidth: {
            margin: `5px 0 0 ${theme.spacing(2)}px`,
        },
        tile: {
            shadows: 3,
            borderRadius: "15px",
            '&:hover': {
                '& $elemBar': {
                    transition: theme.transitions.create("all", {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.enteringScreen,
                    }),
//                    background:
  //                      'linear-gradient(to top, rgba(0,0,0,1) 0%, ' +
    //                                    'rgba(0,0,0,0.6) 70%, rgba(0,0,0,0.4) 100%)',
    //                backgroundColor: "red",
                    filter: "blur(0)",
                    height: "50px",
                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                }
            },
        },
        elemBar: {

//            backgroundColor: "rgba(0, 0, 0, 0.7)",
            //visibility: "hidden",
            height: "50px",
            textShadow: "-1px -1px 1px rgba(0, 0, 0, 0.4), 1px -1px 1px rgba(0, 0, 0, 0.4), -1px 1px 1px rgba(0, 0, 0, 0.4), 1px 1px 1px rgba(0, 0, 0, 0.4);",
            background:
                'linear-gradient(to top, rgba(0,0,0,0.5) 0%, ' +
                'rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
        },
        elemIcon: {
            color: "white",
            marginLeft: 'auto'
        },
        elemContainer: {
            padding: 5,
            height: "100%",
            position: "relative",
//            flexBasis: "100%",
        },
        elemBackground: {
            position: "absolute",
            width: "100%",
            height: "100%",
            backgroundImage: "url('https://avatars2.githubusercontent.com/u/13162326?s=460&u=44e0f40c4b6442d8d0932ceaa1da7d072db4b847&v=4')",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            //backdropFilter: "blur(3px)",
            filter: "blur(5px)",
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

export interface IEntriesByMonth {
    year: string
    month: string
    entries: Entry[]
}

// Parse the entire list of entries month by month
// We assume it is received from newest to oldest
// Should it be done server side ?
function parseEntriesMonth(entries: Entry[]) {
    const ret: IEntriesByMonth[] = [];
    let currentMonth = "";
    let currentYear = "";

    let entriesToAdd: Entry[] = [];

    function addEntryByMonth() {
        if (entriesToAdd.length > 0 && currentYear !== "" && currentMonth !== "") {
            ret.push({
                year: currentYear,
                month: currentMonth,
                entries: entriesToAdd
            })
        }
        entriesToAdd = [];
    }

    for (const entry of entries) {
        const date = moment(entry.created_at);
        const month = date.format("MMMM");
        const year = date.format("YYYY");

        // We check if we enter a new section. If so, we build the previous one
        if (year !== currentYear) {
            addEntryByMonth();
            currentMonth = "";
            currentYear = year;
        }
        if (currentMonth !== month) {
            addEntryByMonth();
            currentMonth = month;
        }
        entriesToAdd.push(entry);
    }

    addEntryByMonth();

    return ret;
}

export function upperCaseFirstLetter(s: string): string {
    if (s.length < 1) {
        return s
    }
    return s.charAt(0).toUpperCase() + s.slice(1);
}

function RenderDivider(props: {monthly: IEntriesByMonth, nbColsInGrid: number}) {
    return <GridListTile key="Subheader" cols={props.nbColsInGrid} style={{ height: 'auto'}}>
        <Divider/>
        <br/>
        <Typography className={"divider"}
                    color="textPrimary"
                    display="block"
                    variant="subtitle1">
            {upperCaseFirstLetter(props.monthly.month + " " + props.monthly.year)}
        </Typography>
    </GridListTile>
}

export default function EntryList() {
    const classes = useStyles({});
    const history = useHistory();
    const theme = useTheme();
    const downSm = useMediaQuery(theme.breakpoints.down('sm'));
    const downMd = useMediaQuery(theme.breakpoints.down('md'));
    const elemsPerPage = 10;

    let nbColsInGrid = 5;
    if (downSm) {
        nbColsInGrid = 2;
    } else if (downMd) {
        nbColsInGrid = 3;
    }

    const [entries, setEntries] = React.useState<Entry[]>([]);
    const [fetching, setFetching] = React.useState(false);
    const [redirect, setRedirect] = React.useState("");
    const [pagination, setPagination] = React.useState<Pagination>(new Pagination());

    const fetchData = async(page: number) => {
        setFetching(true);
        const result = await Api.getEntries(elemsPerPage, page);
        setEntries(entries.concat(result.data.entries));
        setPagination(result.data.pagination);
        setFetching(false);
    };

    useEffect(() => {
        fetchData(1).catch(e => console.log(e));
    }, []);



    if (redirect !== "") {
        history.push(redirect);
    }

    const monthlyEntries: IEntriesByMonth[] = parseEntriesMonth(entries);

    // or use https://material-ui.com/components/skeleton/
    if (fetching && entries.length === 0) {
        return <CircularProgress/>
    }

    function loadMoreEntries(page: number) {
        fetchData(page).catch((err) => console.log(err));
    }
    // Faire apparaitre menu sur un hover ?
    return <React.Fragment>
        <InfiniteScroll
            pageStart={1}
            loadMore={loadMoreEntries}
            hasMore={pagination.has_next_page}
            loader={<BoxCenter key={"progress"}><CircularProgress/></BoxCenter>}
        >
            <div className={classes.root}>
                <GridList cellHeight={200} cols={nbColsInGrid} spacing={10}>
                    {/*monthlyEntries.map((monthly: IEntriesByMonth, i) => {
                        return <EntryListItem monthly={monthly} key={i}/>;
                    })*/}
                    {monthlyEntries.map((monthly: IEntriesByMonth, i) => {
                        return [
                            <GridListTile key="Subheader" cols={nbColsInGrid} style={{ height: 'auto'}}>
                                <Divider/>
                                <br/>
                                <Typography className={"divider"}
                                            color="textPrimary"
                                            display="block"
                                            variant="subtitle1">
                                    {upperCaseFirstLetter(monthly.month + " " + monthly.year)}
                                </Typography>
                            </GridListTile>,
                            monthly.entries.map((elem: Entry, i) => {
                                let date = moment(elem.created_at).format("dddd D MMMM YYYY ");
                                date = upperCaseFirstLetter(date);

                                const godWillsIt: boolean = addImageIfGodWillsIt();
                                let colSpan = 1;
                                if (godWillsIt && nbColsInGrid >= 2) {
                                    colSpan = 2
                                }
                                return <GridListTile key={i} cols={colSpan} /*className={classes.tile}*/
                                classes={{tile: classes.tile}}>
                                    <TileContent elem={elem}/>
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
                    })}
                </GridList>
        </div>
    </InfiniteScroll>
        <Fab color="primary" aria-label="add" size={"large"} className={classes.fab} onClick={async () => {
            const entry: Entry = new Entry();
            entry.title = "Diary Entry";
            entry.content = "Your entry content, in **markdown** format, client-side encrypted";
            try {
                const res = await Api.addEntry(entry);
                setRedirect("/entries/" + res.data.entry.id + "?display=edit")
            } catch (e) {
                // todo
            }
        }}>
            <AddIcon/>
        </Fab>

    </React.Fragment>
}

function TileContent(props: {elem: Entry}) {
    const classes = useStyles({});
    const godWillsIt: boolean = addImageIfGodWillsIt();

    return <Box display={"flex"} style={{
        backgroundColor: "white",
        height: "100%" ,
    }}>

        {godWillsIt && <div className={classes.elemImageContainer}><img
            className={classes.elemImage}
            src={"https://avatars2.githubusercontent.com/u/13162326?s=460&u=44e0f40c4b6442d8d0932ceaa1da7d072db4b847&v=4"}
            alt={"toto"}
        /></div>}
        <div className={classes.elemBackground}/>
        <div className={classes.elemContainer}>
            {props.elem.labels.length > 0 ? <EntryLabelList labels={props.elem.labels}/> : <BoxCenter style={{height: "80%"}}>
                <Typography variant="h5">
                    {props.elem.title}
                </Typography>
            </BoxCenter>}
        </div>
    </Box>
}