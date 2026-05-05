import webpush from "web-push";

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY!;
const vapidSubject = process.env.VAPID_SUBJECT || "mailto:admin@trayekin.app";

let initialized = false;

function ensureVapid() {
  if (!initialized) {
    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
    initialized = true;
  }
}

export { webpush, vapidPublicKey, ensureVapid };
