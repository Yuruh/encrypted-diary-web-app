import React, {ChangeEvent, Component, useRef} from 'react';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import Api, {decrypt, encrypt} from "../Api";
import {Skeleton} from "@material-ui/lab";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {createStyles, Theme} from "@material-ui/core";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        cropper: {
            height: 400,
            width: '100%',
            maxWidth: 1000
        },
    }),
);


export default function ImageCropper(props: {
    updateDataUrl: (dataUrl: string) => void
}) {

    const classes = useStyles();

    const [file, setFile] = React.useState();
    const [dataUrl, setDataUrl] = React.useState("");

    const cropper: any = useRef();
    const fileInput: any = useRef();

    function onInputFileChange(e: ChangeEvent<HTMLInputElement>) {
        const file: File = fileInput.current.files[0];
        if (!file) {
            return;
        }


        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
            setFile(reader.result);
        };
        reader.onerror = function (error) {
            console.log('Error: ', error);
        };

    }

    //avant 3529890
    //après 352071
    //après 91651

    return <div>
        <input type={"file"} ref={fileInput} onChange={onInputFileChange}/>
        {file ?
            <Cropper
                ref={cropper}
                src={file || ""}
                className={classes.cropper}
                aspectRatio={1}
                viewMode={0}
                cropend={onCropEnd}/> :
            <Skeleton className={classes.cropper} variant="rect"/>}
        <p>Size before encryption in bytes: <strong>{dataUrl.length}</strong></p>
        {/*        <p>Size afterr encryption in bytes: <strong>{encrypt(dataUrl, Api.encryptionKey as string).length}</strong></p>*/}
    </div>;

    function onCropEnd() {
        try {
            if (cropper && cropper.current && cropper.current.cropper) {
                const url = cropper.current.cropper.getCroppedCanvas().toDataURL("image/jpeg",0.2);
                setDataUrl(url);
                props.updateDataUrl(url)
            }
        } catch (e) {
            console.log(e);
        }
    }
}

/*
const cropper = React.createRef(null);

class Demo extends Component {
    _crop(){
        // image in dataUrl
        console.log(this.refs.cropper.getCroppedCanvas().toDataURL());
    }

    render() {
        return (
            <Cropper
                ref={cropper}
                src='http://fengyuanchen.github.io/cropper/img/picture.jpg'
                style={{height: 400, width: '100%'}}
                // Cropper.js options
                aspectRatio={16 / 9}
                guides={false}
                crop={this._crop.bind(this)} />
        );
    }
}*/