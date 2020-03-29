import React, {ChangeEvent} from "react"
import {createStyles, Theme, WithStyles} from "@material-ui/core";
import {Entry} from "./models/Entry";
import Api from "./Api";
import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import {Controlled as CodeMirror} from "react-codemirror2";
import Fab from "@material-ui/core/Fab";
import {Clear, Done} from "@material-ui/icons";
import withStyles from "@material-ui/core/styles/withStyles";
import EntrySaveDisplay from "./entry/EntrySaveDisplay";

const ReactMarkdown = require('react-markdown');
require('codemirror/mode/markdown/markdown');
require('codemirror/lib/codemirror.css');
require('codemirror/theme/material.css');

require("./extend-codemirror.css");
// Theme-dependent styles
const styles = (theme: Theme) => createStyles({
    root: {

    },
    title: {
        fontSize: 40,
        textAlign: "center",
        //width: "100%"
    },
    preview: {
        height: "100%",
        padding: 5
    },
    fab: {
        margin: 0,
        top: 'auto',
        right: 20,
        bottom: 20,
        left: 'auto',
        position: 'fixed',
    },
    cancelFab: {
        margin: 0,
        top: 'auto',
        right: 100,
        bottom: 20,
        left: 'auto',
        position: 'fixed',
    }
});

interface IProps extends WithStyles<typeof styles> {
    entryId: number | string
}

interface IState {
    entry: Entry
    fetching: boolean
    saveStatus: EntrySaveStatus
}

export enum EntrySaveStatus {
    SAVED = "Saved",
    PENDING = "Save pending",
    SAVING = "Saving",
    ERROR = "An error occurred"
}

const TIME_BEFORE_SAVE_MS = 3000;

class EntryEditor extends React.Component<IProps, IState> {
    timeout: NodeJS.Timeout | null = null;
    constructor(props: IProps) {
        super(props);
        this.state = {
            entry: new Entry(),
            fetching: false,
            saveStatus: EntrySaveStatus.SAVED
        };

        this.changeEntryTitle = this.changeEntryTitle.bind(this);
        this.changeEntryContent = this.changeEntryContent.bind(this);
        this.triggerSave = this.triggerSave.bind(this);

    }

    async componentDidMount(): Promise<void> {
        this.setState({fetching: true});
        try {
            const result = await Api.getEntry(this.props.entryId);
            this.setState({
                entry: result.data.entry,
                fetching: false,
            });
        } catch (e) {
            //todo handle error
        }
    }

    triggerSave() {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        this.setState({
            saveStatus: EntrySaveStatus.PENDING,
        });

        this.timeout = setTimeout(async() => {
            this.setState({
                saveStatus: EntrySaveStatus.SAVING,
            });
            try {
                await Api.editEntry(this.state.entry);
                this.setState({
                    saveStatus: EntrySaveStatus.SAVED,
                });
            } catch (e) {
                this.setState({
                    saveStatus: EntrySaveStatus.ERROR,
                });
            }
        }, TIME_BEFORE_SAVE_MS);
    }

    changeEntryTitle(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        this.triggerSave();
        this.setState({
            entry: {
                ...this.state.entry,
                title: event.target.value
            }
        });
    }

    changeEntryContent(editor: any, data: any, value: string) {
        this.triggerSave();
        this.setState({
            entry: {
                ...this.state.entry,
                content: value,
            }
        });
    }

    render() {
        return <div>
            <div style={{
                display: "flex"
            }}>
                <div style={{
                    flexGrow: 1
                }}>

                </div>
                <div style={{marginRight: 20}}>
                    <EntrySaveDisplay status={this.state.saveStatus}/>
                </div>
            </div>
            <TextField fullWidth value={this.state.entry.title} onChange={this.changeEntryTitle} variant={"outlined"} className={this.props.classes.title}
                       inputProps={{
                           style: {
                               fontSize: 30,
                               textAlign: "center",
                           }
                       }}
            />
            <Grid container spacing={0} className={this.props.classes.root}>
                <Grid item xs={12} sm={6} lg={6}>
                    <Paper elevation={2}>
                        <CodeMirror value={this.state.entry.content} onBeforeChange={this.changeEntryContent} options={{
                            mode: "markdown",
                            theme: 'material',
                            autofocus: true
                        }}/>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} lg={6}>
                    <Paper elevation={2} className={this.props.classes.preview}>
                        <ReactMarkdown source={this.state.entry.content}/>
                    </Paper>
                </Grid>
            </Grid>
        </div>
    }
}

export default withStyles(styles)(EntryEditor);