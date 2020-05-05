import React, {useEffect} from "react";
import {createStyles, Theme} from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {Entry} from "./models/Entry";
import Api, {decryptLabelAvatar} from "./Api";
import Fab from "@material-ui/core/Fab";
import AddIcon from '@material-ui/icons/Add';
import IconButton from "@material-ui/core/IconButton";
import {Edit, Visibility} from "@material-ui/icons";
import CircularProgress from "@material-ui/core/CircularProgress";
import {useHistory} from "react-router-dom";
import {addImageIfGodWillsIt} from "./label/EntryLabelList";
import {DRAWER_WIDTH} from "./AppDrawer";
import "./dateHelper"
import moment from "moment";
import GridList from "@material-ui/core/GridList";
import GridListTile from "@material-ui/core/GridListTile";
import GridListTileBar from "@material-ui/core/GridListTileBar";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import useTheme from "@material-ui/core/styles/useTheme";
import InfiniteScroll from 'react-infinite-scroller';
import {Pagination} from "./models/Pagination";
import { BoxCenter } from "./BoxCenter";
import {TileContent} from "./entry/EntryListTile";
import Tooltip from "@material-ui/core/Tooltip";
import {Label} from "./models/Label";
import {addDecryptedLabel, axiosError, DecryptedImage, State} from "./redux/reducers/root";
import {useDispatch, useSelector} from "react-redux";
import {Skeleton} from "@material-ui/lab";
import EntryFilterDrawer from "./entry/EntryFilterDrawer";

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
//            display: 'flex',
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
/*                    transition: [theme.transitions.create("all", {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.enteringScreen,
                    }),
                        theme.transitions.create("filter", {
                            easing: theme.transitions.easing.sharp,
                            duration: 0,
                        })],*/
                    background:
                        'linear-gradient(to top, rgba(0,0,0,1) 0%, ' +
                                        'rgba(0,0,0,0.8) 70%, rgba(0,0,0,0.7) 100%)',
                    height: "60px",
//                    backgroundColor: "rgba(0, 0, 0, 0.9)",
                    color: "rgba(0,0,0,0)",
                    filter: "blur(0px)",
                    visibility: "visible",
                }
            },
        },
        elemBar: {
            '& $title': {
                color: "rgba(0,0,0,0)",
            },

//            backgroundColor: "rgba(0, 0, 0, 0.7)",
//            visibility: "hidden",
            filter: "blur(15px)",
            height: "20px",
//            backgroundColor: "#666666",
//            textShadow: "-1px -1px 1px rgba(0, 0, 0, 0.6), 1px -1px 1px rgba(0, 0, 0, 0.6), -1px 1px 1px rgba(0, 0, 0, 0.6), 1px 1px 1px rgba(0, 0, 0, 0.6);",
            background:'linear-gradient(to top, #000000 0%, #FFFFFF 100%)',
        },
        elemIcon: {
            color: "white",
            marginLeft: 'auto'
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
    entries = entries.sort((a: Entry, b: Entry) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
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

// Skeleton to simulate entry list
// Using https://material-ui.com/components/skeleton/
// Should be updated on entry tile style change
function EntryListLoader(props: {
    nbColsInGrid: number
}) {
    const content: any[] = [];
    for (let i = 0; i < 15; i++) {
        content.push(<GridListTile key={i} cols={1} style={{height: "auto"}}>
            <Skeleton animation="wave" variant={"rect"} height={200} style={{borderRadius: "15px"}}/>
        </GridListTile>)
    }
    return <div>
        <Divider/>
        <br/>
        <Skeleton animation="wave" variant={"text"} width={200}/>
        <br/>
        <br/>
        <GridList cellHeight={200} cols={props.nbColsInGrid} spacing={30}>
        {content}
    </GridList></div>
}

export async function populateLabelAvatar(label: Label, decryptedLabels: DecryptedImage[]): Promise<Label> {
    const existing = decryptedLabels.find((elem) => elem.id === label.id);
    if (existing) {
        label.avatar_url = existing.decryptedImage;
        return label;
    } else {
        return decryptLabelAvatar(label);
    }
}

export function labelsStrippedOfAvatar(labels: Label[]): Label[] {
    // Deep copy of labels to preserve avatar url
    const labelsCpy = JSON.parse(JSON.stringify(labels));

    // We start by displaying the label without avatar (for faster loading and in case the object storage provider has a problem)
    return labelsCpy.map((elem: Label) => {
        // Deleting the url here as we don't want to html to load it as an image, as it must be decrypted first
        delete elem.avatar_url;
        return elem;
    });
}

export default function EntryList() {
    const classes = useStyles({});
    const history = useHistory();
    const theme = useTheme();
    const downSm = useMediaQuery(theme.breakpoints.down('sm'));
    const downMd = useMediaQuery(theme.breakpoints.down('md'));
    const elemsPerPage = 10;

    let nbColsInGrid = 3;
    if (downSm) {
        nbColsInGrid = 1;
    } else if (downMd) {
        nbColsInGrid = 2;
    }

    const [entries, setEntries] = React.useState<Entry[]>([]);
    const [fetching, setFetching] = React.useState(false);
    const [redirect, setRedirect] = React.useState("");
    const [pagination, setPagination] = React.useState<Pagination>(new Pagination());
    const decryptedLabels = useSelector((state: State) => state.decryptedLabels);
    const dispatch = useDispatch();

    // To load images after entries are loaded.
    const populateImages = async(newEntries: Entry[]) => {

        const updatedEntries: Entry[] = await Promise.all(newEntries.map(async (entry: Entry) => {
            const promises = [];

            for (const label of entry.labels as Label[]) {
                promises.push(populateLabelAvatar(label, decryptedLabels));
            }
            const decrypted: Label[] = await Promise.all(promises);

            for (const label of decrypted) {
                dispatch(addDecryptedLabel({id: label.id, decryptedImage: label.avatar_url}));
            }
            return entry
        }));

        setEntries(updatedEntries);
    };

    const fetchData = async(page: number) => {
        setFetching(true);
        const result = await Api.getEntries(elemsPerPage, page);

        setEntries(entries.concat(result.data.entries));
        setPagination(result.data.pagination);
        setFetching(false);
        populateImages(entries.concat(result.data.entries)).catch((e) => console.log("something went wrong", e));
    };

    // https://github.com/facebook/create-react-app/issues/6880
    useEffect(() => {
        fetchData(1).catch(e => dispatch(axiosError(e)));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (redirect !== "") {
        history.push(redirect);
    }

    const monthlyEntries: IEntriesByMonth[] = parseEntriesMonth(entries);

    if (fetching && entries.length === 0) {
        return <EntryListLoader nbColsInGrid={nbColsInGrid}/>
    }

    async function loadMoreEntries(page: number) {
        // We set has_next_page to false while we retrieve data so infinite scroller does not trigger
        setPagination({...pagination, has_next_page: false});
        try {
            await fetchData(page);
        }
        catch (err) {
            dispatch(axiosError(err))
        }
    }

    // I'll do the infinite scroll loader myself
    return <React.Fragment>
        <EntryFilterDrawer content={<InfiniteScroll
            pageStart={1}
            threshold={250}
            loadMore={loadMoreEntries}
            hasMore={pagination.has_next_page}>
            <div className={classes.root}>
                <GridList cellHeight={200} cols={nbColsInGrid} spacing={30}>
                    {monthlyEntries.map((monthly: IEntriesByMonth) => {
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
                                            <BoxCenter>
                                                <Tooltip title={"Edit Entry"}>
                                                    <IconButton className={classes.elemIcon} onClick={() => setRedirect("/entries/" + elem.id + "?display=edit")} aria-label="edit">
                                                        <Edit/>
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title={"View Entry"}>
                                                    <IconButton className={classes.elemIcon} onClick={() => setRedirect("/entries/" + elem.id + "?display=view")} aria-label="view">
                                                        <Visibility/>
                                                    </IconButton>
                                                </Tooltip>
                                            </BoxCenter>
                                        }
                                    />
                                </GridListTile>
                            })]
                    })}
                </GridList>
                {/*pagination.has_next_page && <EntryListLoader nbColsInGrid={nbColsInGrid}/>*/}
            </div>
        </InfiniteScroll>
        }/>
        <Fab color="primary" aria-label="add" size={"large"} className={classes.fab} onClick={async () => {
            const entry: Entry = new Entry();
            entry.title = "Diary Entry";
            entry.content = "Your entry content, in **markdown** format, client-side encrypted";
            try {
                const res = await Api.addEntry(entry);
                setRedirect("/entries/" + res.data.entry.id + "?display=edit")
            } catch (e) {
                dispatch(axiosError(e))
            }
        }}>
            <AddIcon/>
        </Fab>

    </React.Fragment>
}
