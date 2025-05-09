import { initializeApp, getApp, getApps, App } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import { SERVER_CONFIGS } from "./config";

let app: App;

const APP_NAME = 'SimpleClub.NextJs';
const initializedFirebaseApps = getApps();
if (!initializedFirebaseApps.some(app => app.name === APP_NAME)) {
    app = initializeApp(
        {},
        APP_NAME
    );
} else {
    app = getApp(APP_NAME);
}

// Initialize Firebase Storage
const storage = getStorage(app);

const getBucket = () => {
    return storage && storage.bucket(SERVER_CONFIGS.GCLOUD_STORAGE_BUCKET);
};

export {
    getBucket,
};
