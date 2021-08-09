import React from "react";
// import axios from 'axios';
// import socketIOClient from "socket.io-client";
import { io } from "socket.io-client";
// import API from '../api';
// const ENDPOINT = "http://127.0.0.1:4001";

class Chat extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            msg: '',
            chat: [],
        }
    }
    componentDidMount() {

        // this.socket = io(ENDPOINT, { transports: ['websocket'] });
        this.socket.on('msgRecv', data => {
            this.state.chat.push({ by: data.userName, msg: data.msg })
            this.setState({ chat: this.state.chat });
        });

        this.userName = this.props.location.state.userName;
        this.meetId = this.props.location.state.meetId

    }
    userName = ''
    handleMsgChange = (e) => {
        this.setState({ msg: e.target.value });
    }
    sendMessage = (event) => {
        event.preventDefault();
        // this.state.chat.push({ by: this.userName, msg: this.state.msg });
        this.socket.emit('msgSend', { userName: this.userName, meetId: this.meetId, msg: this.state.msg });
        this.setState({ msg: '' });
    }
    render() {
        const chats = this.state.chat.map(chat => {
            return (
                <div className="d-flex justify-content-between">
                    <div style={{ fontWeight: 'bolder' }}>
                        {chat.by}
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
                    <form className="d-flex w-50 " onSubmit={this.sendMessage}>
                        {/* <label className="form-label" htmlFor="meeting">Enter Message</label> */}
                        <div className="mx-1 mb-3 w-100  ">
                            <input
                                className=" w-100"
                                name="create"
                                value={this.state.msg}
                                onChange={this.handleMsgChange}
                            />
                        </div>
                        <div className="mb-3">
                            <button
                                // className="btn btn-primary"
                                type="button"
                                onClick={this.sendMessage}
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



export default Chat;