import React from 'react';
import { BrowserRouter, Switch, Route } from "react-router-dom";
import Meeting from './Components/Meeting';
import RoomContainer from './Components/RoomContainer';

const Routes = () => (
    <BrowserRouter>
        <Switch>
            <Route path="/" exact={true} component={Meeting} />
            <Route path="/room" component={RoomContainer} />
            {/* <Route path="/chat" component={Chat} /> */}

        </Switch>
    </BrowserRouter>
);

export default Routes;