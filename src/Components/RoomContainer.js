import React, { Component } from "react";
import { io } from "socket.io-client";
import { Modal } from "bootstrap";

import Room from './Room';
// import Chat from './Chat';
// import Video from "./Video";
import KmsVideo from "./KMS_Video";
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
                    break;
                case '_KMS_CALL_REQUEST':
                    console.log(message);
                    let myKmsModal = new Modal(document.getElementById('exampleModal'));
                    myKmsModal.show();
                    break;
                case '_CALL_RESPONSE':
                    console.log('_call_response on', message);
                    if (message.callStatus == 1) {
                        this.initWebRTC(true);
                        this.attachSelfStreamToPC();
                    }
                    break;
                case '_KMS_CALL_RESPONSE':
                    console.log('_kms_call_response on', message);
                    alert('User not accept the call');
                    break;
                case '_SDP_OFFER':
                    console.log('sdp offer on', message);
                    this.pc.setRemoteDescription(message.sdpOffer);
                    this.attachSelfStreamToPC();
                    this.pc.createAnswer().then(sdpAnswer => {
                        console.log("SDP answer created");
                        this.pc.setLocalDescription(sdpAnswer).then(() => {
                            this.sendSDPAnswer(sdpAnswer);
                        });
                    });
                    break;
                case '_SDP_ANSWER':
                case '_KMS_SDP_ANSWER':
                    console.log('sdp answer on', message);
                    this.pc.setRemoteDescription(message.sdpAnswer);
                    break;
                case '_ICE_CANDIDATE':
                case '_KMS_ICE_CANDIDATE':
                    console.log('ice candidate on', message);
                    this.pc.addIceCandidate(message.iceCandidate);
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
    }
    handleKmsCallRequest = (userName) => {
        //get media,stream,offer,iceCandidate
        let isKmsCall = 'agent';
        this.initWebRTC(true, isKmsCall);
        this.attachSelfStreamToPC();
    }

    sendKmsCallRequest = (userName, sdpOffer) => {
        let message = {
            type: 'KMS_CALL_REQUEST',
            data: {
                meetingId: this.props.location.state.meetingId,
                userName,
                userId: this.socket.id,
                sdpOffer,
            }
        };
        console.log('kmscallReq', message.data);
        this.socket.emit('message', message);
    }

    handleCallResponse = async (userName, callStatus) => {
        if (callStatus == 1) {
            await this.showSelfStream();
            this.initWebRTC(false);
        }
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
    }

    handleKmsCallResponse = async (userName, callStatus) => {
        if (callStatus == 1) {
            let isKmsCall = 'user';
            await this.showSelfStream();
            this.initWebRTC(true, isKmsCall);
            this.attachSelfStreamToPC();
        }
        else {
            this.sendKmsCallResponse = (userName, callStatus);
        }
    }

    sendKmsCallResponse = (userName, callStatus, sdpOffer) => {
        let message = {
            type: 'KMS_CALL_RESPONSE',
            data: {
                meetingId: this.props.location.state.meetingId,
                userId: this.socket.id,
                userName,
                callStatus,
                sdpOffer,
            }
        };
        console.log('call response emit', message.data);
        this.socket.emit('message', message);
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
    sendKmsICECandidate = (iceCandidate, userName) => {
        let message = {
            type: 'KMS_ICE_CANDIDATE',
            data: {
                meetingId: this.props.location.state.meetingId,
                userId: this.socket.id,
                userName,
                iceCandidate
            }
        };
        console.log('kms ice candidate emit', message);
        this.socket.emit('message', message);
    }

    initWebRTC = (addNegotiationListener, isKmsCall) => {
        this.pc = new RTCPeerConnection({ iceServers: [{ "urls": "stun:stun.l.google.com:19302" }] });
        // listener for self iceCancidates
        this.pc.onicecandidate = ({ candidate }) => {
            console.log(candidate, 'candidate');
            this.sendICECandidate(candidate);
        };

        // listener for remote stream
        this.pc.ontrack = (event) => {
            console.log(event, 'Hint In PC.onTrack', this.remoteVideoRef.current.srcObject, event.streams[0]);
            if (this.remoteVideoRef.current.srcObject !== event.streams[0]) {
                document.getElementById("remoteVideo").srcObject = event.streams[0];
                console.log('pc2 received remote stream', event.streams);
            }
        };
        console.log("INIT CALLs")

        if (addNegotiationListener) {
            // listener for negotiation needed triggered after adding stream to pc
            this.pc.onnegotiationneeded = async () => {
                console.log("in onnegotiationneeded")
                this.pc.createOffer().then(sdpOffer => {
                    console.log("SDP offer created")
                    this.pc.setLocalDescription(sdpOffer).then(() => {
                        if (isKmsCall == 'agent') {
                            this.sendKmsCallRequest(this.userName, sdpOffer);
                        } else
                            if (isKmsCall == 'user') {
                                this.sendKmsCallResponse(this.userName, this.callStatus, sdpOffer);
                            }
                        this.sendSDPOffer(sdpOffer);

                    })
                });
            };
        }
    }

    attachSelfStreamToPC() {
        let stream = null;
        let selfVideo = this.videoRef.current;
        const fps = 0;
        if (selfVideo.captureStream) {
            stream = selfVideo.captureStream(fps);
        } else if (selfVideo.mozCaptureStream) {
            stream = selfVideo.mozCaptureStream(fps);
        } else {
            console.error('Stream capture is not supported');
            stream = null;
        }

        stream.getTracks().forEach(track => {
            console.log("added self track")
            this.pc.addTrack(track, stream);
        });
        console.log("added self stream to PC", stream.getTracks(), stream);

    }

    showSelfStream = async () => {
        let stream = await navigator.mediaDevices.getUserMedia(constraints)
        console.log('Got stream with constraints:', constraints);
        this.videoRef.current.srcObject = stream;
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
                    <KmsVideo
                        selfVideoRef={this.videoRef}
                        remoteVideoRef={this.remoteVideoRef}
                        userName={this.state.userName}
                        handleKmsCallRequest={this.handleKmsCallRequest}
                        showSelfStream={this.showSelfStream}
                    />
                    <PopUp
                        userName={this.state.userName}
                        handleKmsCallResponse={this.handleKmsCallResponse}
                    />
                </>
                // <>
                //     <Video
                //         selfVideoRef={this.videoRef}
                //         remoteVideoRef={this.remoteVideoRef}
                //         userName={this.state.userName}
                //         handleCallRequest={this.handleCallRequest}
                //         showSelfStream={this.showSelfStream}
                //     />
                //     <PopUp
                //         userName={this.state.userName}
                //         handleCallResponse={this.handleCallResponse}
                //     />
                // </>
                :
                <Room
                    handleJoin={this.handleJoin}
                />
        );

    }
}
