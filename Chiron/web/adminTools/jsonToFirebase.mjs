// requires npm install firebase-admin --save-dev and have a private key file

// How to use: node jsonToFirebase.mjs [ FIRESTORE_PATH ] [ ID_KEY ] [ DATA_PATH ]  // still needs work
/// <reference types="vite/client" />
import { getApp, getApps, initializeApp } from 'firebase/app'
import { getFirestore, setDoc, doc} from 'firebase/firestore'
import admin from 'firebase-admin'
import admin from 'firebase-admin'

var serviceAccount = require("path/to/serviceAccountKey.json");
const firebaseConfig = {
    apiKey: VITE_FIREBASE_API_KEY,
    authDomain: VITE_FIREBASE_AUTH_DOMAIN,
    projectId:VITE_FIREBASE_PROJECT_ID,
    storageBucket: VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId:VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: VITE_FIREBASE_APP_ID,
    measurementId:VITE_FIREBASE_MEASUREMENT_ID
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// NOTE: This file loads the controls JSON and writes it to Firestore using admin credentials.

// Load controls JSON into a variable. Works in both browser (fetch) and Node (fs).
async function loadControlsJson() {
    try {
        // In environments with `fetch` (browser / node >=18), prefer fetch
        if (typeof fetch !== 'undefined') {
            const url = new URL('./cmmc-l2.controls.json', import.meta.url);
            const resp = await fetch(url.toString());
            if (!resp.ok) throw new Error(`Failed to fetch ${url}: ${resp.status}`);
            return await resp.json();
        }
    } catch (err) {
        console.warn('fetch failed, falling back to fs:', err?.message ?? err);
    }

    // Node local file read (dynamic import to avoid bundler/type issues)
    const path = new URL('./cmmc-l2.controls.json', import.meta.url);
    const { readFile } = await import('fs/promises');
    const text = await readFile(path, 'utf-8');
    return JSON.parse(text);
}

function loadServiceAccount() {
    // If GOOGLE_APPLICATION_CREDENTIALS is set, the Admin SDK will pick it up automatically.
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        console.log('Using GOOGLE_APPLICATION_CREDENTIALS from environment');
        return null;
    }

    // Otherwise, try SERVICE_ACCOUNT_JSON (raw JSON string stored in env)
    if (process.env.SERVICE_ACCOUNT_JSON) {
        try {
            const svc = JSON.parse(process.env.SERVICE_ACCOUNT_JSON);
            console.log('Loaded service account from SERVICE_ACCOUNT_JSON env var');
            return svc;
        } catch (err) {
            console.error('Failed to parse SERVICE_ACCOUNT_JSON:', err);
            throw err;
        }
    }

    throw new Error('No service account credentials found. Set GOOGLE_APPLICATION_CREDENTIALS or SERVICE_ACCOUNT_JSON.');
}

async function main() {
    try {
        const data = await loadControlsJson();
        const timestamp = Date.now();
        const certData = {
            name: 'CMMC-L2',
            createdAt: timestamp,
            updated: timestamp,
            controls: data,
        };

        const serviceAccount = loadServiceAccount();

        if (serviceAccount) {
            admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
        } else {
            // Let the Admin SDK use Application Default Credentials (GOOGLE_APPLICATION_CREDENTIALS)
            admin.initializeApp();
        }

        const db = admin.firestore();

        console.log('Writing cert data to Firestore...');
        // Write to a document - change collection/doc id as desired
        await db.doc('businesses/CMMC-L2').set(certData);
        console.log('Document successfully written via firebase-admin');
    } catch (err) {
        console.error('Error in jsonToFirebase script:', err);
        process.exitCode = 1;
    }
}

// Run main when executed
await main();
