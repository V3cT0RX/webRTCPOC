import React from "react";
import { io } from "socket.io-client";
// const ENDPOINT = "http://127.0.0.1:4001";
const socket = io(`http://127.0.0.1:4001/`, { transports: ['websocket'] });

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
                },
            };
            socket.emit("message", message);
            // #region 
            // socket.on("message", msg => {
            //     switch (msg.type) {
            //         case '_JOIN':
            //             try {
            //                 let message = msg.data;
            //                 this.setState({ isJoin: true });
            //                 console.log(message, this.state.isJoin);
            //             } catch (err) {
            //                 console.log(err, 'Unable to join room');
            //                 socket.on("_ROOM_FULL", (message) => { console.log(message, 'Room full') });
            //             }
            //             break
            //         default:
            //             console.log('Invalid type');
            //             break;
            //     }
            // });
            // #endregion

            socket.on("_JOIN", (data) => {
                try {
                    this.setState({ isJoin: true });
                } catch (err) {
                    console.log(err, 'Unable to join room');
                    socket.on("_ROOM_FULL", (data) => { console.log(data, 'Room full') });
                }
            });

        }
        joinMeeting(socket, this.props.location.state.meetId, this.state.userName);
    };

    render() {
        if (this.state.isJoin) {
            return (
                <Chat userName={this.state.userName} meetId={this.props.location.state.meetId} />
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
        this.userName = this.props.userName;
        this.meetId = this.props.meetId;
        this.state = {
            msg: '',
            chat: [],
        }
    }
    componentDidMount() {

        socket.on('_CHAT', data => {
            console.log('no');
            this.state.chat.push({ by: data.UserName, msg: data.msgData })
            this.setState({ chat: this.state.chat });
        });
        // this.userName = this.props.location.state.userName;
        // this.meetId = this.props.location.state.meetId

    }
    handleMsgChange = (e) => {
        this.setState({ msg: e.target.value });
    }
    sendMessage = (event) => {
        event.preventDefault();
        let message = {
            type: 'CHAT',
            data: {
                UserName: this.userName,
                meetingId: this.meetId,
                msg: this.state.msg
            }
        };
        socket.emit("message", message);
        this.state.chat.push({ by: 'me', msg: this.state.msg })
        this.setState({ chat: this.state.chat });

        // this.socket.emit('msgSend', { userName: this.userName, meetId: this.meetId, msg: this.state.msg });
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
