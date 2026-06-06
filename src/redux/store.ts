import { configureStore } from "@reduxjs/toolkit";
import userSlice from "./userSlice"
import cartSlice from "./cartSlice"
import searchSlice from "./searchSlice"

export const store = configureStore({
    reducer:{
        user:userSlice,
        cart:cartSlice,
        search:searchSlice
    }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch