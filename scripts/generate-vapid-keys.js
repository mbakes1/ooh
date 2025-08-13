const webpush = require("web-push");

const vapidKeys = webpush.generateVAPIDKeys();

console.log("VAPID Keys generated:");
console.log("");
console.log("Add these to your .env file:");
console.log("");
console.log(`VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log("");
console.log("Add this to your .env.local file:");
console.log("");
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
