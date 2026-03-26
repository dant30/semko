import { useDispatch, useSelector, type TypedUseSelectorHook } from "react-redux";

import type { AppDispatch } from "./index";
import type { RootState } from "./root-reducer";

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
