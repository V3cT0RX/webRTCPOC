import React from "react";
// import { Modal } from "bootstrap";

export default class PopUp extends React.Component {
    constructor(props) {
        super(props);
        // this.videoRef = React.createRef();
    }
    render() {
        return (
            <div>

                <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="exampleModalLabel">Call from Agent</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            {/* <div class="modal-body">
                            </div> */}
                            <div class="modal-footer">
                                <button type="button" class="btn btn-danger" data-bs-dismiss="modal">Decline</button>
                                <button type="button" class="btn btn-success" >Accept</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}