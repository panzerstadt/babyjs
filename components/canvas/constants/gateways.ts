export interface GatewayType {
  label: string;
  deviceType: "gateway";
  ip: string;
  url: string;
  healthcheck?: string; // if no healthcheck, we ping
  metadata: {
    connections: {
      lan: string;
      wifi: string;
    };
    speed: string;
  };
}

export const mainRouter: GatewayType = {
  label: "Home Router",
  deviceType: "gateway",
  ip: "192.168.0.1",
  url: "http://192.168.0.1",
  metadata: {
    connections: {
      lan: "",
      wifi: "",
    },
    speed: "",
  },
};
export const subnetRouter: GatewayType = {
  label: "Slate AX",
  deviceType: "gateway",
  ip: "192.168.8.1",
  url: "http://192.168.8.1",
  metadata: {
    connections: {
      lan: "",
      wifi: "",
    },
    speed: "",
  },
};
