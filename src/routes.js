import React from 'react';
import { BrowserRouter, Switch, Route } from "react-router-dom";
import Meeting from './Components/Meeting';
import Room from './Components/Room';
// import Chat from './Components/Chat'

const Routes = () => (
    <BrowserRouter>
        <Switch>
            <Route path="/" exact={true} component={Meeting} />
            <Route path="/room" component={Room} />
            {/* <Route path="/chat" component={Chat} /> */}

        </Switch>
    </BrowserRouter>
);

export default Routes;