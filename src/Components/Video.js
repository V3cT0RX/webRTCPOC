import React, { Component } from "react";
// import PopUp from "./PopUp";
const constraints = window.constraints = {
    audio: false,
    video: true
};
export default class Video extends Component {
    constructor(props) {
        super(props);
        this.videoRef = React.createRef();
    }

    makeCallClick = (event) => {
        event.preventDefault();
        navigator.mediaDevices.getUserMedia(constraints).then(stream => {
            this.handleSuccess(event);
            this.props.handleCallRequest(this.props.userName);
        })
    }

    handleSuccess = (event) => {
        navigator.mediaDevices.getUserMedia(constraints)
            .then(stream => {
                const video = this.videoRef.current;
                const videoTracks = stream.getVideoTracks();
                console.log('Got stream with constraints:', constraints);
                console.log(`Using video device: ${videoTracks[0].label}`);
                window.stream = stream; // make variable available to browser console
                video.srcObject = stream;
                event.target.disabled = true;
            }
            )
            .catch(error => {
                console.log(error);
            })
    }
    render() {
        return (
            <div className="d-flex  align-items-center flex-column w-100 ">
                <div>
                    <video
                        ref={this.videoRef}
                        // autoPlay 
                        playsInline
                    />
                </div>
                <div className="mb-3">
                    <button
                        type="button"
                        onClick={this.makeCallClick}
                    >
                        Call
                    </button>

                </div>
            </div>
        );
    }
}
