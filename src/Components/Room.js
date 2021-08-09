import React from "react";
// import axios from 'axios';
import { io } from "socket.io-client";
const ENDPOINT = "http://127.0.0.1:4001";

class Room extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            userName: '',
            isJoin: false,
        }
    }
    handleChange = event => {
        this.setState({ userName: event.target.value });
    }
    setUsername = event => {

        const joinMeeting = (socket, _meeting_id, userName) => {
            let message = {
                type: 'JOIN',
                data: {
                    meetingId: _meeting_id,
                    userName: userName
                }
            };
            socket.emit("message", message);
            socket.on("_JOIN", (data) => {
                try {
                    this.setState({ isJoin: true });
                    console.log(data, this.state.isJoin);
                    // this.props.history.push({
                    //     pathname: '/chat',
                    //     state: {
                    //         meetId: data,
                    //     }
                    // })
                } catch (err) {
                    console.log(err, 'Unable to join room');
                    socket.on("_ROOM_FULL", (data) => { console.log(data, 'Room full') });
                }
            });
        }
        const socket = io(`http://127.0.0.1:4001/`, { transports: ['websocket'] });
        console.log("Joinin meeting ", this.props.location.state.meetId);
        joinMeeting(socket, this.props.location.state.meetId, this.props.location.state.userName);
    };


    render() {
        if (this.state.isJoin) {
            return (
                <Chat />
            );
        }
        else {
            return (
                <div className="d-flex justify-content-center align-items-center h-100">
                    <form >
                        <label className="form-label" htmlFor="meeting">User Name</label>
                        <div className="mb-3">
                            <input
                                className="form-control "
                                name="create"
                                onChange={this.handleChange}
                            />
                        </div>
                        <div className="mb-3">
                            <button
                                className="btn btn-primary"
                                type="button"
                                onClick={this.setUsername}
                            >
                                Join
                            </button>
                        </div>
                    </form>
                </div>
            );
        }
    }
}

class Chat extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            msg: '',
            chat: [],
        }
    }
    handleMsgChange = (e) => {
        this.setState({ msg: e.target.value });
    }
    sendMessage = (event) => {
        event.preventDefault();
        let message = {
            type: 'MESSAGE',
            data: {
                userName: this.userName,
                meetId: this.meetId,
                msg: this.state.msg
            }
        };
        socket.emit("message", message);
        // this.socket.emit('msgSend', { userName: this.userName, meetId: this.meetId, msg: this.state.msg });
        this.setState({ msg: '' });
    }
    render() {
        // const chats = this.state.chat.map(chat => {
        //     return (
        //         <div className="d-flex justify-content-between">
        //             <div style={{ fontWeight: 'bolder' }}>
        //                 {/* {chat.by} */} name
        //             </div>
        //             <div>
        //                 {/* {chat.msg} */}msg
        //             </div>
        //         </div>
        //     )
        // })
        return (
            <div className="d-flex  align-items-center flex-column w-100 ">
                {/* < div className="card" style={{ width: "50%" }}> */}
                <div style={{ width: '40%' }}>
                    {/* <div>{chats}</div> */}
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
export default Room;





// socket.on('userExists', data => {
    //     alert(data);
    // });
    // socket.on('userSet', data => {
    //     this.props.history.push({
    //         pathname: '/chat',
    //         state: { meetId: this.props.location.state.meetId, userName: this.state.userName }
    //     })
    // })