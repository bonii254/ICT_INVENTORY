interface ApiConfig {
  API_URL: string;
}

const config: { api: ApiConfig } = {
  api: {
    API_URL: "http://localhost:5000",
  },
};

export default config;
