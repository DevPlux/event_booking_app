// src/config/env.ts

import Constants from "expo-constants";

// Get your computer's LAN IP from the Expo dev server.
const debuggerHost = Constants.expoConfig?.hostUri;

const autoIp = debuggerHost ? debuggerHost.split(":")[0] : "localhost";

// Local backend running on port 5000
export const API_BASE_URL = `http://${autoIp}:5000/api`;
