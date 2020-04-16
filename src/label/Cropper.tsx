import React, {ChangeEvent, Component, useRef} from 'react';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';

export default function ImageCropper(props: {
    updateDataUrl: (dataUrl: string) => void
}) {
    function crop() {
        try {
            props.updateDataUrl(cropper.current.cropper.getCroppedCanvas().toDataURL())
        } catch (e) {
            console.log(e);
        }
    }

    const [file, setFile] = React.useState();

    const cropper: any = useRef();
    const fileInput: any = useRef();

    function onInputFileChange(e: ChangeEvent<HTMLInputElement>) {
        console.log(e.target);
        console.log(fileInput);
        const file: File = fileInput.current.files[0];
        if (!file) {
            return;
        }


        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
            //me.modelvalue = reader.result;
            setFile(reader.result);
        };
        reader.onerror = function (error) {
            console.log('Error: ', error);
        };
    }

    return <div>
        <input type={"file"} ref={fileInput} onChange={onInputFileChange}/>
        <Cropper
        ref={cropper}
        src={file || 'https://avatars2.githubusercontent.com/u/13162326?s=460&u=44e0f40c4b6442d8d0932ceaa1da7d072db4b847&v=4'}
        style={{height: 400, width: '100%'}}
        // Cropper.js options
        aspectRatio={1}
//        guides={false}
        crop={crop} />
    </div>
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