import React from "react";
import axios from 'axios';

class Meeting extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            meetingname: '',
            // meetId: null,
        }
    }
    onCreateMeeting = async (event) => {
        event.preventDefault();
        const meetingname = this.state.meetingname
        if (this.state.meetingname != "") {
            try {
                const response = await axios.post(`http://127.0.0.1:4001/createmeeting`, { meetingname })
                const meetId = response.data._meeting_id; //take it from res.data
                console.log(meetId);
                this.props.history.push({
                    pathname: '/room',
                    state: {
                        meetId: meetId,
                        create: true,
                    }
                })
            } catch (err) {
                console.log(err, 'got error');
            }
        }
    }
    onJoinMeeting = async (event) => {
        event.preventDefault();
        const meetingname = this.state.meetingname
        if (this.state.meetingname != "") {
            try {
                const response = await axios.post(`http://127.0.0.1:4001/joinmeeting`, { meeting_id: meetingname })
                const meetId = meetingname;
                console.log(meetId, response.messege);
                this.props.history.push({
                    pathname: '/room',
                    state: {
                        meetId: meetId,
                        create: false,
                    }
                })
            } catch (err) {
                console.log(err, 'Unable to join meeting');
            }
        }
    }
    handleChange = event => {
        this.setState({ meetingname: event.target.value });
    }

    render() {
        return (
            <div className="d-flex justify-content-center align-items-center h-100">
                <form >
                    <label className="form-label" htmlFor="meeting">Meeting</label>
                    <div className="mb-3">
                        <input
                            className="form-control "
                            name="create"
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