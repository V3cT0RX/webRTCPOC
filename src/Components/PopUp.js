import React from "react";
// import { Modal } from "bootstrap";

export default class PopUp extends React.Component {
    // constructor(props) {
    //     super(props);
    //     // this.videoRef = React.createRef();
    // }
    handleCallAccept = (callStatus) => {
        console.log(this.props.userName, callStatus);
        this.props.handleCallResponse(this.props.userName, callStatus);
    }
    render() {
        return (
            <div>

                <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="exampleModalLabel">Call from Agent</h5>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            {/* <div className="modal-body">
                            </div> */}
                            <div className="modal-footer">
                                <button type="button" className="btn btn-danger" data-bs-dismiss="modal" onClick={() => this.handleCallAccept(0)}> Decline</button>
                                <button type="button" className="btn btn-success" data-bs-dismiss="modal" onClick={() => this.handleCallAccept(1)}>Accept</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}