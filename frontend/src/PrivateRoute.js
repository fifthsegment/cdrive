import { useKeycloak } from "@react-keycloak/web";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const { keycloak } = useKeycloak();
  const navigate = useNavigate();

  const isLoggedIn = keycloak.authenticated;

  useEffect(() => {
    if (isLoggedIn === false) {
      navigate("/");
    }
  }, [isLoggedIn, navigate])

  return isLoggedIn ? (
    <div>{children}</div>
  ) : (
    <>
      <div>
        {!keycloak.authenticated && (
          <button
            type="button"
            className="text-blue-800"
            onClick={() => keycloak.login()}
          >
            Login
          </button>
        )}


      </div>
    </>
  );
};

export default PrivateRoute;
