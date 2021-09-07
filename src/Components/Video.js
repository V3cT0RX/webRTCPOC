import React, { Component } from "react";
// import PopUp from "./PopUp";
const constraints = window.constraints = {
    audio: false,
    video: true
};
export default class Video extends Component {
    constructor(props) {
        super(props);
    }

    handleCallClick = (event) => {
        event.preventDefault();
        this.props.showSelfStream();
        this.props.handleCallRequest(this.props.userName);
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
                        style={{ margin: 5 }}
                    />
                    {/* </div>
                <div> */}
                    <video
                        ref={this.props.remoteVideoRef}
                        id="remoteVideo"
                        autoPlay
                        playsInline
                        style={{ margin: 5 }}
                    />
                </div>
                <div className="mb-3">
                    <button
                        type="button"
                        onClick={this.handleCallClick}
                    >
                        Call
                    </button>

                </div>
            </div>
        );
    }
}
