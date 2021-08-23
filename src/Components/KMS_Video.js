import React, { Component } from "react";
// import PopUp from "./PopUp";
const constraints = window.constraints = {
    audio: false,
    video: true
};
export default class KmsVideo extends Component {
    constructor(props) {
        super(props);
    }

    handleKmsCallClick = (event) => {
        event.preventDefault();
        this.props.showSelfStream();
        this.props.handleKmsCallRequest(this.props.userName);
    }

    render() {
        return (
            <div className="d-flex  align-items-center flex-column w-100 ">
                <div>
                    <video
                        ref={this.props.selfVideoRef}
                        id="selfVideo"
                        autoPlay
                        playsInline
                    />
                </div>
                <div>
                    <video
                        ref={this.props.remoteVideoRef}
                        id="remoteVideo"
                        autoPlay
                        playsInline
                    />
                </div>
                <div className="mb-3">
                    <button
                        type="button"
                        onClick={this.handleKmsCallClick}
                    >
                        Call
                    </button>

                </div>
            </div>
        );
    }
}
