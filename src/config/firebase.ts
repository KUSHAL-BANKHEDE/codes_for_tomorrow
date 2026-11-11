import { readFileSync } from "node:fs";
import {
  applicationDefault,
  cert,
  getApp,
  getApps,
  initializeApp,
  type AppOptions,
} from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { env } from "./env";

function getCredential() {
  if (env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return cert(JSON.parse(env.FIREBASE_SERVICE_ACCOUNT_JSON));
  }

  if (env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    const file = readFileSync(env.FIREBASE_SERVICE_ACCOUNT_PATH, "utf8");
    return cert(JSON.parse(file));
  }

  return applicationDefault();
}

const options: AppOptions = {
  projectId: env.FIREBASE_PROJECT_ID,
};

if (!env.FIRESTORE_EMULATOR_HOST) {
  options.credential = getCredential();
}

const app = getApps().length > 0 ? getApp() : initializeApp(options);

export const firestore = getFirestore(app);
