import React, { Component } from "react";
import { io } from "socket.io-client";
import { Modal } from "bootstrap";
import Room from './Room';
import KmsVideo from "./KMS_Video";
import PopUp from "./PopUp";
// import Chat from './Chat';
const constraints = window.constraints = {
    audio: false,
    video: true
};
const offerOptions = {
    offerToReceiveAudio: 1,
    offerToReceiveVideo: 1
};
export default class KmsRoomContainer extends Component {
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

                case '_KMS_CALL_REQUEST':
                    console.log(" STEP : 5");
                    console.log('kms call req', message);
                    let myKmsModal = new Modal(document.getElementById('exampleModal'));
                    myKmsModal.show();
                    break;

                case '_KMS_CALL_RESPONSE':
                    console.log('_kms_call_response on', message);
                    alert('User not accept the call');
                    this.stop();
                    break;

                case '_KMS_SDP_ANSWER':
                    console.log(" STEP : 11");
                    console.log('sdp answer on', message);
                    this.pc.setRemoteDescription(message.sdpAnswer);
                    break;

                case '_KMS_ICE_CANDIDATE':
                    console.log(" STEP : 18,19");
                    console.log('ice candidate on', message);
                    this.pc.addIceCandidate(message.iceCandidate);
                    break;

                case '_KMS_CALL_ENDED':
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

    handleKmsCallRequest = (userName) => {
        //get media,stream,offer,iceCandidate
        let kmsUserRole = 'agent';
        this.initWebRTC(true, kmsUserRole);
        this.attachSelfStreamToPC();
        console.log(" STEP : 1 ");
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
        console.log(" STEP : 2");
        console.log('kmscallReq', message.data);
        this.socket.emit('message', message);
    }

    handleKmsCallResponse = async (userName, callStatus) => {
        console.log(" STEP : 6a");
        console.log(callStatus);
        if (callStatus == 1) {
            let kmsUserRole = 'user';
            await this.showSelfStream();
            this.initWebRTC(true, kmsUserRole, callStatus);
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
        console.log(" STEP : 6b");
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
        if (iceCandidate != null)
            this.socket.emit('message', message);
    }

    sendKmsEndCallResponse = () => {
        let message = {
            type: 'KMS_CALL_ENDED',
            data: {
                meetingId: this.props.location.state.meetingId,
                userId: this.socket.id,
            }
        };
        console.log('call ended', message);
        this.socket.emit('message', message);
    }

    initWebRTC = (addNegotiationListener, kmsUserRole, callStatus) => {
        this.pc = new RTCPeerConnection({ iceServers: [{ "urls": "stun:stun.l.google.com:19302" }] });
        // listener for self iceCancidates
        this.pc.onicecandidate = ({ candidate }) => {
            console.log(" STEP : 12/14");
            console.log(candidate, 'candidate');
            this.sendKmsICECandidate(candidate, this.state.userName);
        };

        // listener for remote stream
        this.pc.ontrack = (event) => {
            console.log(" STEP : 21/23");
            console.log(event, 'Hint In PC.onTrack', this.remoteVideoRef.current.srcObject, event.streams[0]);
            if (this.remoteVideoRef.current.srcObject !== event.streams[0]) {
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
                        if (kmsUserRole == 'agent') {
                            this.sendKmsCallRequest(this.state.userName, sdpOffer);
                        }
                        else if (kmsUserRole == 'user') {
                            console.log("this is kms call responce call", callStatus);
                            this.sendKmsCallResponse(this.state.userName, callStatus, sdpOffer);
                        }
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
            console.log(" STEP : 20/22");
            this.pc.addTrack(track, stream);
        });
        console.log("added self stream to PC", stream.getTracks(), stream);

    }

    showSelfStream = async () => {
        let stream = await navigator.mediaDevices.getUserMedia(constraints)
        console.log('Got stream with constraints:', constraints);
        this.videoRef.current.srcObject = stream;
    }

    stop = (isPeer) => {
        this.videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        this.videoRef.current.style.display = "none";
        if (this.pc) {
            this.pc.close();
            this.pc = null;
            if (!isPeer)
                this.sendKmsEndCallResponse();
            console.log("ON STOP");
        }
    }

    render() {
        return (
            this.state.isJoin ?
                <>
                    <KmsVideo
                        selfVideoRef={this.videoRef}
                        remoteVideoRef={this.remoteVideoRef}
                        userName={this.state.userName}
                        handleKmsCallRequest={this.handleKmsCallRequest}
                        showSelfStream={this.showSelfStream}
                        handleKmsEndCall={this.stop}
                    />
                    <PopUp
                        userName={this.state.userName}
                        handleCallResponse={this.handleKmsCallResponse}
                    />
                </>
                :
                <Room
                    handleJoin={this.handleJoin}
                />
        );

    }
}
