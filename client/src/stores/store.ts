import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./feature/AuthSclice";

export const store = configureStore({
    reducer: {
        token: authReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;