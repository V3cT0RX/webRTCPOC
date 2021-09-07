import React from "react";
import axios from 'axios';

class Meeting extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            meetingName: '',
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
                const meetingId = response.data.meetingId; //take it from res.data
                console.log(meetingId);
                isKmsCall ?
                    this.props.history.push({
                        pathname: '/kmsroom',
                        state: {
                            meetingId,
                            create: true,
                        }
                    })
                    : this.props.history.push({
                        pathname: '/room',
                        state: {
                            meetingId,
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
                            create: false,
                        }
                    })
                    : this.props.history.push({
                        pathname: '/room',
                        state: {
                            meetingId,
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
                    <label className="form-label" htmlFor="meeting">Meeting...
                        <div>
                            <input className="form-check-input" type="checkbox" value="true" id="flexCheckIndeterminate" onChange={this.handleCheck} />
                            <label className="form-check-label" htmlFor="flexCheckIndeterminate">
                                KMS Call
                            </label>
                        </div>
                    </label>
                    <div className="mb-3">
                        <input
                            className="form-control "
                            name="meetingName"
                            value={this.state.meetingName}
                            onChange={this.handleChange}
                        />

                    </div>
                    <div className="mb-3 ">
                        <button
                            className="btn btn-primary mx-5"
                            type="submit"
                            onClick={this.onCreateMeeting}
                        >
                            create
                        </button>
                        {/* </div> */}
                        {/* <div className="mb-3"> */}
                        <button
                            className="btn btn-primary mx-5"
                            type="submit"
                            onClick={this.onJoinMeeting}
                        >
                            join
                        </button>
                    </div>
                </form>
            </div >
        );
    }
}



export default Meeting;