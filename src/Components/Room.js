import React, { Component } from "react";

export default class RoomContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userName: ''
        };
    }

    handleChange = event => {
        this.setState({ [event.target.name]: event.target.value });
    }

    handleJoinClick = event => {
        this.props.handleJoin(this.state.userName);
    };

    render() {
        return (
            <div className="d-flex justify-content-center align-items-center h-100">
                <form onSubmit={this.handleJoinClick} >
                    <label className="form-label" htmlFor="meeting">User Name</label>
                    <div className="mb-3">
                        <input
                            className="form-control "
                            name="userName"
                            onChange={this.handleChange}
                        />
                    </div>
                    <div className="mb-3">
                        <button
                            className="btn btn-primary"
                            type="button"
                            onClick={this.handleJoinClick}
                        >
                            Join
                        </button>
                    </div>
                </form>
            </div>
        );
    }
}
