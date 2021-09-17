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

    handleEndCallClick = (event) => {
        event.preventDefault();
        this.props.handleEndCall();
    }

    render() {
        return (
            <div className="d-flex  align-items-center flex-column w-100 mb-5">
                <div
                    className="mt-5"
                    style={{ border: "1px solid grey", borderRadius: "15px", padding: "1rem", boxShadow: "1px 1px 5px grey" }}
                >
                    <button
                        type="button"
                        className="btn btn-success mx-5"
                        onClick={this.handleCallClick}
                    >
                        Call
                    </button>
                    <button
                        type="button"
                        className="btn btn-danger mx-5"
                        onClick={this.handleEndCallClick}
                    >
                        End
                    </button>
                </div>
                {/* <div  className="mt-5" style={{ border: "1px solid grey", borderRadius: "15px", padding: "1rem", boxShadow: "1px 1px 5px grey" }}> */}
                <div style={{ position: "relative" }}>
                    <video
                        style={{ margin: 5, position: "absolute", top: "10px", left: "10px", border: "2px solid white", width: "30%", height: "30%", zIndex: "1" }}
                        ref={this.props.selfVideoRef}
                        id="selfVideo"
                        autoPlay
                        playsInline
                    />
                    <video
                        style={{ margin: 5, width: "600px" }}
                        ref={this.props.remoteVideoRef}
                        id="remoteVideo"
                        autoPlay
                        playsInline
                    />
                </div>
            </div>
        );
    }
}
