import React, { Component } from "react";
import { io } from "socket.io-client";
import { Modal } from "bootstrap";

import Room from './Room';
// import Chat from './Chat';
import Video from "./Video";
import PopUp from "./PopUp";

const constraints = window.constraints = {
    audio: false,
    video: true
};
const offerOptions = {
    offerToReceiveAudio: 1,
    offerToReceiveVideo: 1
};
export default class RoomContainer extends Component {
    constructor(props) {
        super(props);
        this.videoRef = React.createRef();
        this.remoteVideoRef = React.createRef();
        this.state = {
            userName: '',
            isJoin: false,
            chat: []
        }
    }

    pcs = [];
    pc;

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
                case '_CALL_REQUEST':
                    console.log(message);
                    let myModal = new Modal(document.getElementById('exampleModal'));
                    myModal.show();
                    break;
                case '_CALL_RESPONSE':
                    console.log('_call_response on', message);
                    if (message.callStatus == 1) {
                        this.call();
                        window.stream.getTracks().forEach(track => this.pc.addTrack(track, window.stream));
                        this.pc.createOffer(offerOptions)
                            .then(sdpOffer => {
                                this.pc.setLocalDescription(sdpOffer)
                                    .then(() => {
                                        this.sendSDPOffer(sdpOffer);
                                    })
                            });
                    }
                    break;
                case '_SDP_OFFER':
                    console.log('sdp offer on', message);
                    this.pc.setRemoteDescription(message.sdpOffer)
                        .then(() => {
                            // this.getVideoStream()
                            this.videoRef.current.handleSuccess()
                                .then((stream) => {
                                    stream.getTracks().forEach(track => this.pc.addTrack(track, stream));
                                    this.pc.createAnswer()
                                        .then(sdpAnswer => {
                                            this.pc.setLocalDescription(sdpAnswer)
                                                .then(() => {
                                                    this.sendSDPAnswer(sdpAnswer);
                                                })
                                        });
                                })
                        })
                    break;
                case '_SDP_ANSWER':
                    console.log('sdp answer on', message);
                    this.pc.setRemoteDescription(message.sdpAnswer);
                    break;
                case '_ICE_CANDIDATE':
                    console.log('ice candidate on', message);
                    this.pcs.map(pc => {
                        pc.addIceCandidate(message.candidate);
                    });
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
        // console.log(this.socket);
        let message = {
            type: 'CHAT',
            data
        };

        this.socket.emit('message', message);
        let chat = [...this.state.chat];
        chat.push({ by: data.userName, msg: data.msg })
        this.setState({ chat });
    }

    handleCallRequest = (userName) => {
        let message = {
            type: 'CALL_REQUEST',
            data: {
                meetingId: this.props.location.state.meetingId,
                userName,
                userId: this.socket.id,
            }
        };
        console.log(message.data);
        this.socket.emit('message', message);
    }

    handleCallResponse = (userName, callStatus) => {
        let message = {
            type: 'CALL_RESPONSE',
            data: {
                meetingId: this.props.location.state.meetingId,
                userId: this.socket.id,
                userName,
                callStatus
            }
        };
        console.log('call response emit', message.data);
        this.socket.emit('message', message);
        if (callStatus == 1) {
            this.call();
        }
    }

    sendSDPOffer = (sdpOffer, userName) => {
        let message = {
            type: 'SDP_OFFER',
            data: {
                meetingId: this.props.location.state.meetingId,
                userId: this.socket.id,
                userName,
                sdpOffer,
            }
        };
        console.log('sdp offer emit', message);
        this.socket.emit('message', message);
    }

    sendSDPAnswer = (sdpAnswer, userName) => {
        let message = {
            type: 'SDP_ANSWER',
            data: {
                meetingId: this.props.location.state.meetingId,
                userId: this.socket.id,
                userName,
                sdpAnswer
            }
        };
        console.log('sdp answer emit', message);
        this.socket.emit('message', message);
    }

    sendICECandidate = (iceCandidate, userName) => {
        let message = {
            type: 'ICE_CANDIDATE',
            data: {
                meetingId: this.props.location.state.meetingId,
                userId: this.socket.id,
                userName,
                iceCandidate
            }
        };
        console.log('ice candidate emit', message);
        this.socket.emit('message', message);
    }

    call = () => {
        this.pc = new RTCPeerConnection();
        this.pcs.push(new RTCPeerConnection());
        this.pc.onicecandidate = ({ candidate }) => {
            console.log(candidate, 'candidate');
            this.sendICECandidate(candidate);
        };
        this.pc.ontrack = (event) => {
            console.log(event, 't set srcObject again if it is already set.');
            if (this.remoteVideoRef.current.srcObject) return;
            this.remoteVideoRef.current.srcObject = event.streams[0];
        };
    }

    getVideoStream = async () => {
        return await navigator.mediaDevices.getUserMedia(constraints);
    }

    render() {
        return (
            this.state.isJoin ?
                // <Chat
                //     userName={this.state.userName}
                //     meetingId={this.props.location.state.meetingId}
                //     chats={this.state.chat}
                //     handleSendChat={this.handleSendChat}
                // />
                <>
                    <Video
                        ref={this.videoRef}
                        userName={this.state.userName}
                        handleCallRequest={this.handleCallRequest}
                    />
                    <video
                        ref={this.remoteVideoRef}
                        // autoPlay
                        playsInline
                    />
                    <PopUp
                        userName={this.state.userName}
                        handleCallResponse={this.handleCallResponse}
                    />
                </>
                :
                <Room
                    handleJoin={this.handleJoin}
                />
        );

    }
}
