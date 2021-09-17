import React, { Component } from "react";
import { io } from "socket.io-client";
import { Modal } from "bootstrap";
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
            userName: this.props.location.state.userName,
            isJoin: false,
            chat: [],
            userId: null,
            callerId: null
        }
    }
    componentDidMount() {
        this.handleJoin(this.state.userName);
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
                    console.log('on _call_request', message);
                    let myModal = new Modal(document.getElementById('exampleModal'));
                    myModal.show();
                    break;

                case '_CALL_RESPONSE':
                    console.log('_call_response on', message);
                    if (message.callStatus == 1) {
                        this.initWebRTC(true);
                        this.attachSelfStreamToPC();
                    }
                    else {
                        alert('User not accept the call');
                        this.stop();
                    }
                    break;

                case '_SDP_OFFER':
                    console.log('sdp offer on', message);
                    this.pc.setRemoteDescription(message.sdpOffer);
                    this.attachSelfStreamToPC();
                    this.pc.createAnswer().then(sdpAnswer => {
                        console.log("SDP answer created");
                        this.pc.setLocalDescription(sdpAnswer).then(() => {
                            this.sendSDPAnswer(sdpAnswer, this.state.userName);
                        });
                    });
                    break;
                case '_SDP_ANSWER':
                    console.log('sdp answer on', message);
                    this.pc.setRemoteDescription(message.sdpAnswer);
                    break;
                case '_ICE_CANDIDATE':
                    console.log('ice candidate on', message);
                    this.pc.addIceCandidate(message.iceCandidate);
                    break;
                case '_CALL_ENDED':
                    this.stop(true);
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
            // userId,
        });
        if (this.props.location.state.create) {
            navigator.clipboard.writeText(this.props.location.state.meetingId);
            alert(`Meeting ID: ${this.props.location.state.meetingId}` + `\n` + `ID copied to clipboard, share with friend.`);
        }
        this.handleSocketMessages();
    };

    handleSendChat = (data) => {
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
        if (iceCandidate != null)
            this.socket.emit('message', message);
    }
    sendEndCallResponse = () => {
        let message = {
            type: 'CALL_ENDED',
            data: {
                meetingId: this.props.location.state.meetingId,
                userId: this.socket.id,
            }
        };
        console.log('call ended', message);
        this.socket.emit('message', message);
    }
    initWebRTC = (addNegotiationListener) => {
        this.pc = new RTCPeerConnection({ iceServers: [{ "urls": "stun:stun.l.google.com:19302" }] });
        // listener for self iceCancidates
        this.pc.onicecandidate = ({ candidate }) => {
            console.log(candidate, 'candidate');
            this.sendICECandidate(candidate, this.state.userName);
        };

        // listener for remote stream
        this.pc.ontrack = (event) => {
            console.log(event, 'Stream In PC.onTrack', this.remoteVideoRef.current.srcObject, event.streams[0]);
            if (this.remoteVideoRef.current.srcObject !== event.streams[0]) {
                this.remoteVideoRef.current.style.display = "inline";
                document.getElementById("remoteVideo").srcObject = event.streams[0];
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
                        this.sendSDPOffer(sdpOffer, this.state.userName);
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
        this.videoRef.current.style.display = "inline";
        let stream = await navigator.mediaDevices.getUserMedia(constraints) // Use getDisplayMedia for screenshare
        console.log('Got stream with constraints:', constraints, this.videoRef.current);
        this.videoRef.current.srcObject = stream;
    }

    stop = (isPeer) => {
        this.videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        this.videoRef.current.style.display = "none";
        this.remoteVideoRef.current.style.display = "none";
        if (this.pc) {
            this.pc.close();
            this.pc = null;
            if (!isPeer)
                this.sendEndCallResponse();
            console.log("ON STOP");
        }
    }

    handleEndCall = () => {
        this.stop();
    }
    render() {
        return (
            // this.state.isJoin ?
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
                    handleEndCall={this.handleEndCall}
                />
                <PopUp
                    userName={this.state.userName}
                    handleCallResponse={this.handleCallResponse}
                />
            </>
            // :
            // <Room
            //     handleJoin={this.handleJoin}
            // />
        );

    }
}
