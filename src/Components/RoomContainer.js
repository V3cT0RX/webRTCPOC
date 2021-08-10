import React, { Component } from "react";
import { io } from "socket.io-client";

import Room from './Room';
import Chat from './Chat';

export default class RoomContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userName: '',
            isJoin: false,
            chat: []
        }
    }

    handleSocketMessages = () => {
        this.socket.on("message", msg => {
            console.log('received socket message:', msg);
            let message = msg.data;
            switch (msg.type) {
                case '_JOIN':
                    if (message.isRoomFull) {
                        this.socket.disconnect();
                    } else {
                        this.setState({ isJoin: true });
                    }
                    break;
                case '_CHAT':
                    let chat = [...this.state.chat];
                    chat.push({ by: message.userName, msg: message.msgData })
                    this.setState({ chat });
                    break;
                default:
                    console.log('Invalid type');
                    break;
            }
        });
    }

    handleJoin = (userName) => {
        this.socket = io(`http://127.0.0.1:4001/`, { transports: ['websocket'] });
        let message = {
            type: 'JOIN',
            data: {
                meetingId: this.props.location.state.meetingId,
                userName
            },
        };
        this.socket.emit('message', message);
        this.setState({ userName });
        this.handleSocketMessages();
    };

    handleSendChat = (data) => {
        console.log(this.socket);
        let message = {
            type: 'CHAT',
            data
        };

        this.socket.emit('message', message);
        let chat = [...this.state.chat];
        chat.push({ by: data.userName, msg: data.msg })
        this.setState({ chat });
    }

    render() {
        return (
            this.state.isJoin ?
                <Chat
                    userName={this.state.userName}
                    meetingId={this.props.location.state.meetingId}
                    chats={this.state.chat}
                    handleSendChat={this.handleSendChat}
                />
                :
                <Room
                    handleJoin={this.handleJoin}
                />
        );

    }
}