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
            chat: [],
            userId: null,
            callerId: null
        }
    }

    pcs = [];
    pc;

    handleSocketMessages = async () => {
        this.socket.on("message", msg => {
            console.log('received socket message:', msg);
            let message = msg.data;
            switch (msg.type) {
                case '_JOIN':
                    if (message.isRoomFull) {
                        this.socket.disconnect();
                    } else {
                        this.setState({
                            isJoin: true,
                            userId: this.socket.id
                        }, () => {

                            console.log("Room Joined:", this.socket.id, this.state);
                        });
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
                    this.setState({
                        callerId: message.userId
                    })
                    break;
                case '_CALL_RESPONSE':
                    console.log('_call_response on', message);
                    if (message.callStatus == 1) {
                        this.initWebRTC(true);
                        this.showSelfStream()
                            .then(stream => {
                                this.attachSelfStreamToPC(stream);
                            });
                    }
                    break;
                case '_SDP_OFFER':
                    console.log('sdp offer on', message);
                    this.pc.setRemoteDescription(message.sdpOffer);
                    this.showSelfStream().then(stream => {
                        // this.attachSelfStreamToPC(stream);
                        this.pc.createAnswer().then(sdpAnswer => {
                            console.log("SDP answer created");
                            this.pc.setLocalDescription(sdpAnswer).then(() => {
                                this.sendSDPAnswer(sdpAnswer);
                            });
                        });
                    });
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
        this.setState({
            userName,
        });
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
        this.setState({
            callerId: this.socket.id
        })
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
            this.initWebRTC(false);
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

    initWebRTC = (addNegotiationListener) => {
        this.pc = new RTCPeerConnection();
        this.pcs.push(new RTCPeerConnection());

        // listener for self iceCancidates
        this.pc.onicecandidate = ({ candidate }) => {
            console.log(candidate, 'candidate');
            this.sendICECandidate(candidate);
        };

        // listener for remote stream
        this.pc.ontrack = (event) => {
            console.log(event, 'Hint In PC.onTrack', this.remoteVideoRef.current.srcObject, event.streams[0]);
            // if (this.remoteVideoRef.current.srcObject) return;
            // this.remoteVideoRef.current.srcObject = event.streams[0];
            if (this.remoteVideoRef.current.srcObject !== event.streams[0]) {
                this.remoteVideoRef.current.srcObject = event.streams[0];
                this.attachSelfStreamToPC(event.streams[0]);
                console.log('pc2 received remote stream', event.streams);
            }
        };

        if (addNegotiationListener) {
            // listener for negotiation needed triggered after adding stream to pc
            this.pc.onnegotiationneeded = async () => {
                console.log("in onnegotiationneeded")
                this.pc.createOffer().then(sdpOffer => {
                    console.log("SDP offer created")
                    this.pc.setLocalDescription(sdpOffer).then(() => {
                        this.sendSDPOffer(sdpOffer);
                    })
                });
            };
        }
    }

    attachSelfStreamToPC(stream) {
        stream.getTracks().forEach(track => {
            console.log("added self track")
            this.pc.addTrack(track, stream);
        });
        console.log("added self stream to PC", stream.getTracks(), stream)
    };

    showSelfStream = () => {
        return navigator.mediaDevices.getUserMedia(constraints).then(stream => {
            console.log('Got stream with constraints:', constraints);
            this.videoRef.current.srcObject = stream;
            return stream;
        });
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
                        selfVideoRef={this.videoRef}
                        remoteVideoRef={this.remoteVideoRef}
                        userName={this.state.userName}
                        handleCallRequest={this.handleCallRequest}
                        showSelfStream={this.showSelfStream}
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
