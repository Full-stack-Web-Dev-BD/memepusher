import React from 'react';
import { Route, Navigate ,Outlet} from "react-router-dom";

const GuardedRoute = ({ component: Component, auth, ...rest }) => (
    <Route {...rest} render={(props) => (
        auth === true
            ? <Outlet {...props} />
            : <Navigate to='/' />
    )} />
)

export default GuardedRoute;