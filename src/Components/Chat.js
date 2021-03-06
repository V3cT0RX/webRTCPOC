import React, { Component } from "react";

export default class Chat extends Component {
    constructor(props) {
        super(props);
        this.state = {
            msg: '',
        }
    }

    handleChange = (event) => {
        this.setState({ [event.target.name]: event.target.value });
    }

    handleSendClick = (event) => {
        event.preventDefault();
        this.props.handleSendChat({
            userName: this.props.userName,
            meetingId: this.props.meetingId,
            msg: this.state.msg
        });

        this.setState({ msg: '' });
    }
    render() {
        const chats = this.props.chats.map(chat => {
            return (
                <div className="d-flex justify-content-between">
                    <div style={{ fontWeight: 'bolder' }}>
                        {chat.by === this.props.userName ? "You" : chat.by}
                    </div>
                    <div>
                        {chat.msg}
                    </div>
                </div>
            )
        })
        return (
            <div className="d-flex  align-items-center flex-column w-100 ">
                {/* < div className="card" style={{ width: "50%" }}> */}
                <div style={{ width: '40%' }}>
                    <div>{chats}</div>
                </div>
                <div className="d-flex  justify-content-center w-100 fixed-bottom">
                    <form className="d-flex w-50 " onSubmit={this.handleSendClick}>
                        <div className="mx-1 mb-3 w-100  ">
                            <input
                                className=" w-100"
                                name="msg"
                                value={this.state.msg}
                                onChange={this.handleChange}
                            />
                        </div>
                        <div className="mb-3">
                            <button
                                // className="btn btn-primary"
                                type="button"
                                onClick={this.handleSendClick}
                            >
                                Send
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
}
