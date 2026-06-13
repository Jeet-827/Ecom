import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../stores/store";

interface ProtectRouteProps {
    children: ReactNode;
}

const ProtectRoute = ({ children }: ProtectRouteProps) => {
    const token = useSelector((state: RootState) => state.token.accesstoken);

    if (!token) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default ProtectRoute;