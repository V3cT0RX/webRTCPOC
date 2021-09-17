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

    handleKmsCallClick = async (event) => {
        event.preventDefault();
        await this.props.showSelfStream();
        this.props.handleKmsCallRequest(this.props.userName);
    }
    handleKmsEndCallClick = (event) => {
        event.preventDefault();
        this.props.handleKmsEndCall();
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
                        onClick={this.handleKmsCallClick}
                    >
                        Call
                    </button>
                    <button
                        type="button"
                        className="btn btn-danger mx-5"
                        onClick={this.handleKmsEndCallClick}
                    >
                        End
                    </button>
                </div>
                <div className="mt-5" >
                    {/* style={{ border: "1px solid grey", borderRadius: "15px", padding: "1rem", boxShadow: "1px 1px 5px grey" }}> */}
                    <video
                        ref={this.props.selfVideoRef}
                        id="selfVideo"
                        autoPlay
                        playsInline
                        style={{ margin: 5, width: "550px" }}
                    />
                    <video
                        ref={this.props.remoteVideoRef}
                        id="remoteVideo"
                        autoPlay
                        playsInline
                        style={{ margin: 5, width: "550px" }}
                    />
                </div>
            </div>
        );
    }
}
