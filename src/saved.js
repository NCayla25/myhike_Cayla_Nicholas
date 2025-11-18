import { onAuthReady } from "./authentication";
import { db } from "./firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

function initSavedPage() {
    onAuthReady(async (user) => {
        if (!user) {
            location.href = "/login.html";
            return;
        }

        const userId = user.uid;
        await insertNameFromFirestore(userId);
        await renderSavedHikes(userId);
    });
}

async function insertNameFromFirestore(userId) {
    try {
        const userRef = doc(db, "user", userId);
        const userDocSnap = await getDoc(userRef);

        if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            const userName = data.name || "Hiker";
            document.getElementById("name-goes-here").innerText = userName;
        }
    } catch (e) {
        console.error("Error reading user document:", e);
    }
}

async function renderSavedHikes(userId) {
    const userRef = doc(db, "user", userId);
    const userDocSnap = await getDoc(userRef);
    const userData = userDocSnap.exists() ? userDocSnap.data() : {};
    const bookmarks = userData.bookmarks || [];

    const newcardTemplate = document.getElementById("savedCardTemplate");
    const hikeCardGroup = document.getElementById("hikeCardGroup");

    for (const hikeId of bookmarks) {
        const hikeRef = doc(db, "hikes", hikeId);
        const hikeDocSnap = await getDoc(hikeRef);

        if (!hikeDocSnap.exists()) {
            console.log("No hike document for ID", hikeId);

            continue;
        }

        const hikeData = hikeDocSnap.data();
        const newCard = newcardTemplate.content.cloneNode(true);

        newCard.querySelector(".card-title").innerText = hikeData.name;
        newCard.querySelector(".card-text").textContent = hikeData.details || `Located in ${hikeData.city}.`;
        newCard.querySelector(".card-length").innerText = hikeData.length;
        newCard.querySelector(".card-image").src = `./images/${hikeData.code}.jpg`;
        newCard.querySelector("a").href = "eachHike.html?docId=" + hikeId;
        hikeCardGroup.appendChild(newCard);
    }
}

initSavedPage();