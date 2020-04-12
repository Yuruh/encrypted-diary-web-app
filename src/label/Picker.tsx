import React from "react"
import {createStyles, Theme, WithStyles} from "@material-ui/core";
import withStyles from "@material-ui/core/styles/withStyles";
import {Label} from "../models/Label";
import TextField from "@material-ui/core/TextField";
import Api from "../Api";
import CircularProgress from "@material-ui/core/CircularProgress";
import Autocomplete from '@material-ui/lab/Autocomplete';
import {LabelChip} from "./EntryLabelList";

// Theme-dependent styles
const styles = (theme: Theme) => createStyles({
    root: {

    },
    option: {
        '&[data-focus="true"]': {
            backgroundColor: "#bdbdbd",
        },
    }
});

interface IProps extends WithStyles<typeof styles> {
    addLabelToEntry: (ids: number[]) => Promise<void>
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
                const res = await Api.getLabels(this.state.newLabelName, this.state.labels.map((elem) => elem.id),6);
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

    onChangeLabel(event: any) {
        this.setState({
            newLabelName: event.target.value
        });
        this.triggerAutocompletion();
    }

    async onOptionsChange(event: React.ChangeEvent<{}>, value: Array<Label | string>) {
        // If the last element is a string instead of a label, it means it was just created
        if (value.length > 0 && typeof value[value.length - 1] === "string") {

            // We start by checking if the value is in the offered labels, and if so we use this one instead of trying to create a new label
            // We compare from lowercase to handle case
            const existingIdx = this.state.offeredLabels.findIndex((elem: Label) => elem.name.toLowerCase() ===
                (value[value.length - 1] as string).toLowerCase()
            );
            if (existingIdx != -1) {
                value[value.length - 1] = this.state.offeredLabels[existingIdx];
            } else {
                const label: Label = new Label();
                label.name = value[value.length - 1] as string;
                try {
                    const res = await Api.addLabel(label);

                    this.setState({
                        newLabelName: ""
                    });
                    value[value.length - 1] = res.data.label;
                } catch (e) {
                    console.log(e);
                }
            }
        }
        try {
            await this.props.addLabelToEntry((value as Label[]).map((elem: Label) => elem.id));
            this.setState({
                labels: value as Label[]
            });
            this.triggerAutocompletion();
        } catch (e) {
            console.log(e);
        }
    }

    // https://material-ui.com/components/autocomplete/
    render() {
        return <Autocomplete
            classes={{
                option: this.props.classes.option
            }}
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
                /*
                    We don't want the component to display already selected
                    It messes up the selection
                    So we'll prevent offering labels already in list (server side)
                    And we'll prevent adding an already existing
                 */
                return false//option.id === value.id
            }}
            getOptionLabel={(option) => option.name}
            options={this.state.offeredLabels}
            filterOptions={((options, state) => {
                const base: Label[] = [];
                /*if (state.inputValue !== '') {
                    const label: Label = new Label();
                    label.name = state.inputValue;
                    label.color ="#FFFFFF"
                    base.push(label);
                }*/

                return base.concat(options);
            })} // We don't want the component to filter, as it is done server side
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
                        <LabelChip key={index} onDelete={getTagProps({ index }).onDelete} color={option.color} label={option.name} style={{marginLeft: 3}} />
                    )})
            }


            renderInput={(params) => <TextField
                    //onKeyDown={this.keyPress}
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