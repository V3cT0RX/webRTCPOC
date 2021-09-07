import React from 'react';
import { BrowserRouter, Switch, Route } from "react-router-dom";
import Meeting from './Components/Meeting';
import PopUp from './Components/PopUp';
import RoomContainer from './Components/RoomContainer';
import KmsRoomContainer from './Components/KmsRoomContainer';
import Video from './Components/Video';

const Routes = () => (
    <BrowserRouter>
        <Switch>
            <Route path="/" exact={true} component={Meeting} />
            <Route path="/room" component={RoomContainer} />
            <Route path="/kmsroom" component={KmsRoomContainer} />
            <Route path="/video" component={Video} />
            <Route path="/popup" component={PopUp} />
        </Switch>
    </BrowserRouter>
);

export default Routes;