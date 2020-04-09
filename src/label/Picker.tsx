import React from "react"
import {createStyles, Theme, WithStyles} from "@material-ui/core";
import withStyles from "@material-ui/core/styles/withStyles";
import {Label} from "../models/Label";
import TextField from "@material-ui/core/TextField";
import Api from "../Api";
import CircularProgress from "@material-ui/core/CircularProgress";
import Autocomplete from '@material-ui/lab/Autocomplete';
import {EntrySaveStatus} from "../entry/Editor";
import Chip from "@material-ui/core/Chip";
import {LabelChip} from "./LabelList";

// Theme-dependent styles
const styles = (theme: Theme) => createStyles({
    root: {

    },
});

interface IProps extends WithStyles<typeof styles> {
    addLabelToEntry: (id: number) => Promise<void>
    labels: Label[]
}

interface IState {
    labels: Label[]
    newLabelName: string
    loading: boolean
    open: boolean
    offeredLabels: Label[]
}

const TIME_BEFORE_REQUEST_MS = 200;

class Picker extends React.Component<IProps, IState> {
    timeout: NodeJS.Timeout | null = null;
    constructor(props: IProps) {
        super(props);
        //console.log(props.labels)
        this.state = {
            labels: props.labels,
            newLabelName: "",
            loading: false,
            open: false,
            offeredLabels: []
        };
        this.keyPress = this.keyPress.bind(this);
        this.onChangeLabel = this.onChangeLabel.bind(this);
        this.triggerAutocompletion = this.triggerAutocompletion.bind(this);
        this.onOptionsChange = this.onOptionsChange.bind(this);
    }

    componentDidMount(): void {
        this.triggerAutocompletion();
    }

    triggerAutocompletion() {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }

        this.timeout = setTimeout(async() => {
            this.setState({
                loading: true
            });
            try {
                const res = await Api.getLabels(this.state.newLabelName, 6);
                this.setState({
                    offeredLabels: res.data.labels
                });
            } catch (e) {
                console.log(e)
            }
            this.setState({
                loading: false
            });
        }, TIME_BEFORE_REQUEST_MS);
    }

    async keyPress(e: any) {
        if (e.keyCode === 13) {
            const label: Label = new Label();
            label.name = this.state.newLabelName;
            try {
                const res = await Api.addLabel(label);

                this.setState({
                    newLabelName: ""
                });
                await this.props.addLabelToEntry(res.data.label.id);
            } catch (e) {
                console.log(e);
            }
        }
    }

    onChangeLabel(event: any) {
        this.triggerAutocompletion();
        this.setState({
            newLabelName: event.target.value
        })
    }

    onOptionsChange(event: React.ChangeEvent<{}>, value: Label[]) {
        this.setState({
            labels: value
        });
    }

    // https://material-ui.com/components/autocomplete/
    render() {
        return <Autocomplete
            multiple
            freeSolo
            id="label-picker"
           // style={{ width: 300 }}
            open={this.state.open}
            onOpen={() => {
                this.setState({open: true});
            }}
            onClose={() => {
                this.setState({open: false});
            }}
            onChange={this.onOptionsChange}
            value={this.state.labels}
            getOptionSelected={(option, value) => {
                return option.id === value.id
            }}
            getOptionLabel={(option) => option.name}
            options={this.state.offeredLabels}
            filterOptions={((options, state) => options)} // We don't want the component to filter, as it is done server side
            loading={this.state.loading}
            renderOption={(option: Label, {inputValue}) => {
                return (
                    <React.Fragment>
                        <span style={{
                            marginRight: 5,
                            height: 20,
                            width: 20,
                            border: "1px solid black",
                            backgroundColor: option.color
                        }}/>
                        {option.name}
                    </React.Fragment>
                )
            }}
            renderTags={(value: Label[], getTagProps: any) =>
                value.map((option: Label, index: number) => {
                    return (
                        <LabelChip key={index} onDelete={getTagProps({ index }).onDelete} color={option.color} label={option.name}  />
                    )})
            }


            renderInput={(params) => <TextField
                    onKeyDown={this.keyPress}
                    {...params}
                    label="Labels"
                    variant="outlined"
                    placeholder="Work, Family, ..."
                    value={this.state.newLabelName}
                    onChange={this.onChangeLabel}
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <React.Fragment>
                                {this.state.loading ? <CircularProgress color="inherit" size={20} /> : null}
                                {params.InputProps.endAdornment}
                            </React.Fragment>
                        ),
                    }}
                />
            }
        />
    }
}

export default withStyles(styles)(Picker);