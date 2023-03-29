import React, { createContext, useEffect, useState } from "react";
import { SERVER_BASE_URL } from "./contants";

const InfoContext = createContext(null);

function InfoProvider({ children }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(SERVER_BASE_URL + "/api/info");
      const data = await response.json();
      setData(data);
      setLoading(false);
    } catch (error) {
      setError(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <InfoContext.Provider value={{ data, loading, error }}>
      {children}
    </InfoContext.Provider>
  );
}

export { InfoContext, InfoProvider };
