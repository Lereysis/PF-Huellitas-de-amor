import { createSlice } from "@reduxjs/toolkit"
import ErrorManager from "../../resources/ErrorManager"
import { getAuth } from "firebase/auth";
import api from "../../services/api"
import FirebaseApp from "../../services/firebaseApp";
import { async } from "@firebase/util";

export const userSlice = createSlice({
    name: 'users',
    initialState: {
        currentUser: null,
        loginType: null,
        error: null,
        message: null,
        isBusy: false,
        forgot: null,
        resetLink: null,
    },
    reducers: {
        setCurrentUser(state, action) {
            state.currentUser = action.payload;
            sessionStorage.setItem("user-id", action.payload.id);
        },
        resetCurrentUser: (state) => {
            state.currentUser = null;
        },
        signOut: (state) => {
            state.currentUser = null;
            sessionStorage.removeItem("user-id");

            const auth = getAuth(FirebaseApp);
            if (auth.currentUser) {
                auth.signOut();
            }
        },
        setForgotPassword: (state, action) => {
            state.forgot = action.payload;
            sessionStorage.setItem("forgot-password", action.payload.email);
        },
        setResetPassword: (state, action) => {
            state.resetLink = action.payload;
            sessionStorage.setItem("resetpassword", action.payload.reset)
        },
        setUserError: (state, action) => {
            state.error = action.payload;
        },
        resetUserError: (state) => {
            state.error = null
        },
        setUserMessage: (state, action) => {
            state.message = action.payload;
        },
        resetUserMessage: (state) => {
            state.message = null
        },
        setUserBusyMode: (state, action) => {
            state.isBusy = action.payload;
        },
        setLoginType: (state, action) => {
            state.loginType = action.payload;
        }

    },
})
export const { setUserError, resetUserError, resetCurrentUser, setCurrentUser, signOut, setUserMessage, resetUserMessage, setUserBusyMode, setForgotPassword, setResetPassword, setLoginType } = userSlice.actions;

export default userSlice.reducer;

export const postUser = (obj) => async (dispatch) => {
    try {
        dispatch(setUserBusyMode(true));
        const response = await api.post(`/users`, obj);
        dispatch(setUserBusyMode(false));
        dispatch(setCurrentUser(response.data));
        dispatch(setLoginType("withEmailAndPassword"));
    } catch (error) {
        dispatch(setUserBusyMode(false));
        if (error.response.data.code) {
            const signup_error_code = error.response.data.code;
            switch (signup_error_code) {
                case "EmailAlreadyExist":
                    dispatch(setUserError(ErrorManager.CreateErrorInfoObject({
                        name: "SignUpError",
                        code: signup_error_code
                    }, [])));
                    break;
                default:
                    dispatch(setUserError(ErrorManager.CreateErrorInfoObject(error, [
                        { code: error.code },
                        { request: "POST: http://localhost:3001/auth/login" }
                    ])));
                    break;
            }
        } else {
            dispatch(setUserError(ErrorManager.CreateErrorInfoObject(error, [
                { code: error.code },
                { request: "POST: http://localhost:3001/users" }
            ])));
        }
    }
}

export const loginWithEmailAndPassword = (email, password) => async (dispatch) => {
    try {
        dispatch(setUserBusyMode(true));
        const response = await api.post(`/auth/login`, { email, password });
        dispatch(setUserBusyMode(false));
        dispatch(setCurrentUser(response.data));
        dispatch(setLoginType("withEmailAndPassword"));
    } catch (error) {
        dispatch(setUserBusyMode(false));
        if (error.response.data.code) {
            const login_error_code = error.response.data.code;
            switch (login_error_code) {
                case "UserNotFound":
                case "InvalidPassword":
                    dispatch(setUserError(ErrorManager.CreateErrorInfoObject({
                        name: "LoginError",
                        code: login_error_code
                    }, [])));
                    break;
                default:
                    dispatch(setUserError(ErrorManager.CreateErrorInfoObject(error, [
                        { code: error.code },
                        { request: "POST: http://localhost:3001/auth/login" }
                    ])));
                    break;
            }
        } else {
            dispatch(setUserError(ErrorManager.CreateErrorInfoObject(error, [
                { code: error.code },
                { request: "POST: http://localhost:3001/auth/login" }
            ])));
        }
    }
}

export const federatedLogin = (token, userData) => async (dispatch) => {
    try {
        dispatch(setUserBusyMode(true));
        const response = await api.post(`/auth/federated_login`, { userData }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        dispatch(setUserBusyMode(false));
        dispatch(setCurrentUser(response.data));
        dispatch(setLoginType("withFederatedProvider"));
    } catch (error) {
        dispatch(setUserBusyMode(false));
        dispatch(setUserError(ErrorManager.CreateErrorInfoObject(error, [
            { code: error.code },
            { request: "POST: http://localhost:3001/auth/federated_login" }
        ])));
    }
}

export const updateUserInfo = (newData) => async (dispatch) => {
    try {
        dispatch(setUserBusyMode(true));
        const response = await api.put(`/users/user_info/${newData.id}`, newData);
        dispatch(setUserBusyMode(false));
        dispatch(setCurrentUser(response.data));
        dispatch(setUserMessage({
            title: "Actualizacion completada",
            message: "Se han actualizado tus datos de usuario correctamente",
            details: []
        }))

    } catch (error) {
        dispatch(setUserBusyMode(false));
        dispatch(setUserError(ErrorManager.CreateErrorInfoObject(error, [
            { code: error.code },
            { request: "POST: http://localhost:3001/users//user_info/:user_id" }
        ])));
    }
}

export const postForgotPassword = (obj) => async (dispatch) => {
    try {
        dispatch(setUserBusyMode(true));

        const response = await api.post(`/users/forgot-password`, { email: obj });
        console.log(response.data + " respuesta servidor");
        dispatch(setUserBusyMode(false));
        dispatch(setForgotPassword(response.data));
    } catch (error) {
        dispatch(setUserBusyMode(false));
        dispatch(setUserError(ErrorManager.CreateErrorInfoObject(error, [
            { code: error.code },
            { request: "POST: http://localhost:3001/users/forgot-password" }
        ])));
    }
}

export const PutresetPassword = (newData, password) => async (dispatch) => {
    console.log(newData, password + " slice")
    try {
        dispatch(setUserBusyMode(true));
        const response = await api.put(`/users/resetpassword/${newData}`, { newPassword: password });
        dispatch(setUserBusyMode(false));
        dispatch(setResetPassword(response.data));
        console.log(response.data)
        dispatch(setUserMessage({
            title: "Contraseña Cambiada",
            message: "Se ha cambiado tu contraseña de usuario correctamente",
            details: []
        }))

    } catch (error) {
        dispatch(setUserBusyMode(false));
        dispatch(setUserError(ErrorManager.CreateErrorInfoObject(error, [
            { code: error.code },
            { request: "PUT: http://localhost:3001/users/resetpassword/:id" }
        ])));
    }
}

export const createAdoptionRequest = (newData) => async (dispatch) => {
    try {
        dispatch(setUserBusyMode(true));
        const response = await api.post(`/adoption_request/`, { adoption_request_data: newData });
        dispatch(setUserBusyMode(false));
        dispatch(setUserMessage({
            title: "Solicitud de adopcion completada",
            message: "Se han enviado tu solicitud de adopcion, en poco tiempo estaremos respondiendote",
            details: []
        }))

    } catch (error) {
        dispatch(setUserBusyMode(false));
        dispatch(setUserError(ErrorManager.CreateErrorInfoObject(error, [
            { code: error.code },
            { request: "POST: http://localhost:3001/adoption_request/" }
        ])));
    }
}