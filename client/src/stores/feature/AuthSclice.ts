import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'


export interface TokenState {
    accesstoken: string
}
const initialState: TokenState = {
    accesstoken: localStorage.getItem("accessToken") || "",
}

const authSclice = createSlice({
    name: "token",
    initialState,
    reducers: {
        setToken: (state, action: PayloadAction<string>) => {
            state.accesstoken = action.payload;
            localStorage.setItem("accessToken", action.payload);
        },
        clearToke: (state) => {
            state.accesstoken = "";
            localStorage.removeItem("accessToken");
        }
    }

})


export const { setToken, clearToke } = authSclice.actions;

export default authSclice.reducer;