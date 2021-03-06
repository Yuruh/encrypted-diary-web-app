import React, {ChangeEvent} from "react"
import {createStyles, IconButton, Theme, WithStyles} from "@material-ui/core";
import {Entry} from "../models/Entry";
import Api from "../Api";
import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import {Controlled as CodeMirror} from "react-codemirror2";
import {Visibility} from "@material-ui/icons";
import withStyles from "@material-ui/core/styles/withStyles";
import SaveDisplay from "./SaveDisplay";
import {RouteComponentProps, withRouter} from "react-router-dom";
import Picker from "../label/Picker";
import {AxiosError} from "axios";
import {axiosError} from "../redux/reducers/root";
import {connect} from "react-redux";
import {Label} from "../models/Label";

const ReactMarkdown = require('react-markdown');
require('codemirror/mode/markdown/markdown');
require('codemirror/lib/codemirror.css');
require('codemirror/theme/material.css');

require("../extend-codemirror.css");

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
        padding: "5px 5px 0px 5px",
        overflowWrap: "anywhere"
    },
});

interface IProps extends WithStyles<typeof styles>, RouteComponentProps<any> {
    entry: Entry
    updateEntry: (entry: Entry) => void
    handleError: (e: AxiosError) => void
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

const TIME_BEFORE_SAVE_MS = 2000;

class Editor extends React.Component<IProps, IState> {
    timeout: NodeJS.Timeout | null = null;
    constructor(props: IProps) {
        super(props);
        this.state = {
            entry: props.entry,
            fetching: false,
            saveStatus: EntrySaveStatus.SAVED
        };

        this.changeEntryTitle = this.changeEntryTitle.bind(this);
        this.changeEntryContent = this.changeEntryContent.bind(this);
        this.triggerSave = this.triggerSave.bind(this);
        this.addLabelToEntry = this.addLabelToEntry.bind(this);
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
                await Api.editEntry(this.state.entry, this.props.entry.labels.map((elem) => elem.id));
                this.setState({
                    saveStatus: EntrySaveStatus.SAVED,
                });
                this.props.updateEntry(this.state.entry);
            } catch (e) {
                this.setState({
                    saveStatus: EntrySaveStatus.ERROR,
                });
                this.props.handleError(e);
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

    async addLabelToEntry(labels: Label[]) {
        try {
            const res = await Api.editEntry(this.state.entry, labels.map((elem: Label) => elem.id));
            this.setState({
                saveStatus: EntrySaveStatus.SAVED,
            });
            this.props.updateEntry(res.data.entry);
        } catch (e) {
            this.setState({
                saveStatus: EntrySaveStatus.ERROR,
            });
            this.props.handleError(e);
        }
    }

    render() {
        return <div>
            <div style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
            }}>
                <div style={{marginRight: 20, marginLeft: 20}}>
                    <SaveDisplay status={this.state.saveStatus}/>
                </div>
                <div style={{
                    flexGrow: 1
                }}>

                </div>
                <IconButton color={"primary"} onClick={() => {this.props.history.push(this.props.location.pathname + "?display=view")}}>
                    <Visibility/>
                </IconButton>
            </div>
            <div style={{margin: "10px 0px 10px 0px"}}>
                <TextField label={"Title"} fullWidth value={this.state.entry.title} onChange={this.changeEntryTitle} variant={"outlined"} className={this.props.classes.title}
                           inputProps={{
                               style: {
                                   fontSize: 30,
                                   textAlign: "center",
                               }
                           }}
                />
            </div>
            <div style={{margin: "10px 0px 10px 0px"}}>
                <Picker addLabelToEntry={this.addLabelToEntry} labels={this.state.entry.labels}/>
            </div>
            <Grid container spacing={0} className={this.props.classes.root}>
                <Grid item xs={12} sm={6} lg={6}>
                    <Paper elevation={2}>
                        <CodeMirror value={this.state.entry.content} onBeforeChange={this.changeEntryContent} options={{
                            mode: "markdown",
                            theme: 'material',
                            autofocus: true,
                            lineWrapping: true
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

const mapDispatchToProps = (dispatch: any) => {
    return {
        handleError: (error: AxiosError) => dispatch(axiosError(error))
    }
};

export default withRouter(withStyles(styles)(connect(null, mapDispatchToProps)(Editor)));