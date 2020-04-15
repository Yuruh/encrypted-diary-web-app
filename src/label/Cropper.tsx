import React, {Component, useRef} from 'react';
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

    const cropper: any = useRef();

    return <Cropper
        ref={cropper}
        src='https://avatars2.githubusercontent.com/u/13162326?s=460&u=44e0f40c4b6442d8d0932ceaa1da7d072db4b847&v=4'
        style={{height: 400, width: '100%'}}
        // Cropper.js options
        aspectRatio={1}
//        guides={false}
        crop={crop} />
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