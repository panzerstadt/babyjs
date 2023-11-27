export interface DeviceType {
  label: string;
  deviceType: string;
  url: string;
  ip?: string;
  healthcheck?: string; // if no healthcheck, we ping
}

export interface VirtualDeviceType extends DeviceType {
  deviceType: "virtual";
}

export interface PhysicalDeviceType extends DeviceType {
  deviceType: "physical";
  ip: string;
}

export const edgev: PhysicalDeviceType = {
  label: "Khadas Edge-V",
  deviceType: "physical",
  ip: "100.90.167.99",
  url: "http://edgev:9090",
};

export const zimaboard: PhysicalDeviceType = {
  label: "ZimaBoard (homelab-jp1)",
  deviceType: "physical",
  ip: "100.72.65.114",
  url: "https://homelab-jp1:8006",
};

export const reserver: PhysicalDeviceType = {
  label: "ReServer (homelab-jp2)",
  deviceType: "physical",
  ip: "100.100.163.40",
  url: "https://homelab-jp2:8006",
};

export const liva: PhysicalDeviceType = {
  label: "ECS Liva (homelab-jp3)",
  deviceType: "physical",
  ip: "100.117.151.145",
  url: "https://homelab-jp3:8006",
};

export const rp48g: PhysicalDeviceType = {
  label: "Raspberry Pi 4 8GB (MQTT)",
  deviceType: "physical",
  ip: "100.74.119.120",
  url: "http://rp4-8g:1880", // node-red, TODO: should have a dashboard of some sort
};

export const npir5s: PhysicalDeviceType = {
  label: "NanoPi R5S (homelab-nas)",
  deviceType: "physical",
  ip: "100.123.42.136",
  url: "https://homelab-nas",
};

export const ceph: VirtualDeviceType = {
  label: "Ceph",
  deviceType: "virtual",
  url: "https://homelab-jp2:8443",
};
