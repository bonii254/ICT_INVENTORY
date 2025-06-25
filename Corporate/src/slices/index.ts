import { combineReducers } from "redux";

// Front
import LayoutReducer from "./layouts/reducer";

// Authentication

import AccountReducer from "./auth/register/reducer";
import ForgetPasswordReducer from "./auth/forgetpwd/reducer";
import ProfileReducer from "./auth/profile/reducer";


const rootReducer = combineReducers({
    Layout: LayoutReducer,
    Account: AccountReducer,
    ForgetPassword: ForgetPasswordReducer,
    Profile: ProfileReducer,
});

export default rootReducer;
