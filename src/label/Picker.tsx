import React from "react"
import {createStyles, Theme, WithStyles} from "@material-ui/core";
import withStyles from "@material-ui/core/styles/withStyles";
import {Label} from "../models/Label";
import TextField from "@material-ui/core/TextField";
import Api from "../Api";


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
}

const TIME_BEFORE_SAVE_MS = 500;

class Picker extends React.Component<IProps, IState> {
    timeout: NodeJS.Timeout | null = null;
    constructor(props: IProps) {
        super(props);
        this.state = {
            labels: [],
            newLabelName: ""
        };
        this.keyPress = this.keyPress.bind(this);
        this.onChangeLabel = this.onChangeLabel.bind(this);
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
        this.setState({
            newLabelName: event.target.value
        })
    }

    render() {

        return <div>
            <TextField onKeyDown={this.keyPress}
                       label="Add chip"
                       variant="outlined"
                       placeholder="Work / Family / ..."
                       value={this.state.newLabelName}
                       onChange={this.onChangeLabel}/>
            {JSON.stringify(this.props.labels)}
        </div>
    }
}

export default withStyles(styles)(Picker);