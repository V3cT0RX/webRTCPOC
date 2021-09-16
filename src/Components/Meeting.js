import React from "react";
import axios from 'axios';
import Logo from '../Assets/SCTLogo.jpg';
import KmsRoomContainer from "./KmsRoomContainer";
import RoomContainer from "./RoomContainer";
class Meeting extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            meetingName: '',
            userName: '',
            isKmsCall: false,
            // meetId: null,
        }
    }
    onCreateMeeting = async (event) => {
        event.preventDefault();
        const meetingName = this.state.meetingName;
        const isKmsCall = this.state.isKmsCall;

        if (meetingName !== "") {
            try {
                const response = await axios.post(`http://127.0.0.1:4001/createmeeting`, { meetingName })
                const meetingId = response.data.meetingId;
                const userName = this.state.userName; //take it from res.data
                console.log(meetingId);
                isKmsCall ?
                    this.props.history.push({
                        pathname: '/kmsroom',
                        state: {
                            meetingId,
                            userName,
                            create: true,
                        }
                    })
                    : this.props.history.push({
                        pathname: '/room',
                        state: {
                            meetingId,
                            userName,
                            create: true,
                        }
                    });
            } catch (err) {
                console.log(err, 'got error');
            }
        }
    }
    onJoinMeeting = async (event) => {
        event.preventDefault();
        const meetingId = this.state.meetingName;
        const userName = this.state.userName;
        const isKmsCall = this.state.isKmsCall;

        if (meetingId !== "") {
            try {
                console.log(meetingId);
                const response = await axios.post(`http://127.0.0.1:4001/joinmeeting`, { meeting_id: meetingId })
                isKmsCall ?
                    this.props.history.push({
                        pathname: '/kmsroom',
                        state: {
                            meetingId,
                            userName,
                            create: false,
                        }
                    })
                    : this.props.history.push({
                        pathname: '/room',
                        state: {
                            meetingId,
                            userName,
                            create: false,
                        }
                    })
            } catch (err) {
                console.log(err, 'Unable to join meeting');
            }
        }
    }
    handleChange = event => {
        this.setState({ [event.target.name]: event.target.value });
    }
    handleCheck = () => {
        this.setState({
            isKmsCall: !this.state.isKmsCall
        })
    }
    render() {
        return (
            <div className="d-flex justify-content-center align-items-center h-100">
                <form >
                    <div className="form-label mb-5" htmlFor="meeting">
                        <img src={Logo} alt="" />
                        <h3> WEBRTC SAMPLE APP</h3>
                    </div>
                    <div style={{ border: "1px solid grey", borderRadius: "15px", padding: "2rem", boxShadow: "1px 1px 5px grey" }}>
                        <div className="mb-3">
                            <input
                                className="form-control "
                                placeholder="Enter Meeting Name or Id"
                                name="meetingName"
                                value={this.state.meetingName}
                                onChange={this.handleChange}
                            />
                        </div>
                        <div className="mb-3">
                            <input
                                className="form-control "
                                placeholder="Enter User Name"
                                name="userName"
                                onChange={this.handleChange}
                            />
                        </div>
                        <div className="mb-3" style={{ textAlign: "left", display: "flex", alignItems: "center" }}>
                            <input className="form-check-input" style={{ width: "1.5em", height: "1.5em" }} type="checkbox" value="true" id="flexCheckIndeterminate" onChange={this.handleCheck} />
                            <label className="form-check-label" style={{ paddingLeft: "7px" }} htmlFor="flexCheckIndeterminate">
                                Check if you want to make KMS call
                            </label>
                        </div>
                        <div>
                            <button
                                className="btn btn-primary mx-5"
                                type="submit"
                                onClick={this.onCreateMeeting}
                            >
                                create
                            </button>
                            <button
                                className="btn btn-primary mx-5"
                                type="submit"
                                onClick={this.onJoinMeeting}
                            >
                                join
                            </button>
                        </div>
                    </div>
                </form>
                {/* {this.state.isKmsCall ? <KmsRoomContainer /> : <RoomContainer />} */}
            </div >
        );
    }
}



export default Meeting;