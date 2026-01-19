import { initializeApp } from "firebase/app"
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore"
import { getAuth } from "firebase/auth"

const firebaseConfig = {
   apiKey: "AIzaSyBc47zd2s8kI9NZeXxSvrfYQ9w-MADHavk",
  authDomain: "geotopo-15352.firebaseapp.com",
  projectId: "geotopo-15352",
  storageBucket: "geotopo-15352.firebasestorage.app",
  messagingSenderId: "636979806489",
  appId: "1:636979806489:web:bf964afab37f8b65204588",
  measurementId: "G-65W4TCLQGT"
};
const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)

enableIndexedDbPersistence(db)
  .then(() => console.log("🔥 Offline activé"))
  .catch(() => console.log("Offline non supporté"))

  window.addEventListener("offline", ()=> alert("Mode hors ligne activé"))
window.addEventListener("online", ()=> alert("Connexion rétablie"))
/*
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{doc=**} {
      allow read, write: if request.auth != null;
    }
  }
}
*/