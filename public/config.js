// Import the functions you need from the SDKs you need
import {initializeApp} from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";
import {
    collection,
    doc,
    getDocs,
    getFirestore,
    updateDoc,
    addDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBAWYaUBnIkbCOWKeY0oDLT4Mku1tq31Xo",
    authDomain: "pdh27-df467.firebaseapp.com",
    databaseURL: "https://pdh27-df467-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "pdh27-df467",
    storageBucket: "pdh27-df467.appspot.com",
    messagingSenderId: "986246796079",
    appId: "1:986246796079:web:2658cdc8b1195b8dd247da"
};

initializeApp(firebaseConfig);

const db = getFirestore();

const colRefChores = collection(db, 'chores')

function showNotification() {
    const notification = document.querySelector(".check");
    notification.innerHTML = "Task added!";
    notification.classList.remove("hide");
    setTimeout(() => {
        notification.classList.add("hide");
    }, 2000);
}

function getAllItems() {
    let tasks = [];

    getDocs(colRefChores)
        .then((snapshot) => {

            const doc = snapshot.docs;

            doc.forEach((doc) => {
                tasks.push({ ...doc.data(), id: doc.id })
            })
            displayTasks(tasks);
        })
        .catch ((error) => {
            console.log(error);
        });


}

async function deleteTask(id) {
    const deleteDocRef = doc(db, 'chores', id);

    await deleteDoc(deleteDocRef)

    location.reload();
}

function displayTasks(tasks) {
    const taskList = document.getElementById("task-list");
    taskList.innerHTML = '';

    tasks.forEach((task) => {
        const taskItem = document.createElement("div");
        taskItem.classList.add("task-item");

        const taskName = document.createElement("div");
        taskName.classList.add("task-name");
        taskName.textContent = task.chore;

        const taskFrequency = document.createElement("div");
        taskFrequency.classList.add("task-frequency");

        if (task.frequency === '1') {
            taskFrequency.textContent = 'Weekelijkse taak';
        }
        else if (task.frequency === '2') {
            taskFrequency.textContent = 'Twee wekelijkse taak';
        }
        else if (task.frequency === '4') {
            taskFrequency.textContent = 'Maandelijkse taak';
        }
        else {
            taskFrequency.textContent = 'Weekelijkse taak';
        }

        const taskActions = document.createElement("div");
        taskActions.classList.add("task-actions");

        const deleteButton = document.createElement("button");
        deleteButton.classList.add("delete-btn");
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", () => deleteTask(task.id));

        taskActions.appendChild(deleteButton);

        taskItem.appendChild(taskName);
        taskItem.appendChild(taskFrequency);
        taskItem.appendChild(taskActions);

        taskList.appendChild(taskItem);
    });
}

document.querySelector(".add-task-btn").addEventListener("click", async () => {
    const newItem = document.querySelector("#edit-task-name").value
    const newFrequency = document.querySelector("#frequency").value

    await addDoc(colRefChores, {
        chore: newItem,
        frequency: newFrequency,
        lastDone: ''
    })

    await getSavedWeeks(newItem);
});

// Get the input field
const input = document.querySelector("#edit-task-name");

// Execute a function when the user presses a key on the keyboard
input.addEventListener("keypress", async function (event) {
    // If the user presses the "Enter" key on the keyboard
    if (event.key === "Enter") {
        // Cancel the default action, if needed
        event.preventDefault();
        // Trigger the button element with a click
        const newItem = document.querySelector("#edit-task-name").value
        const newFrequency = document.querySelector("#frequency").value

        await addDoc(colRefChores, {
            chore: newItem,
            frequency: newFrequency,
            lastDone: ''
        })

        await getSavedWeeks(newItem);
    }
});

function addTaskToRenderedWeeks(savedWeeks, newItem) {
    savedWeeks.forEach((savedWeek) => {
        if (savedWeek.weekNum >= getWeekNumber(new Date())) {
            let countRuben = 0;
            let countJulia = 0;
            let countAnnabel = 0;

            const names = ["Ruben", "Julia", "Annabel"];

            for (const key in savedWeek) {
                if (savedWeek[key].assignedTo === "Ruben") {
                    countRuben++;
                }
                if (savedWeek[key].assignedTo === "Julia") {
                    countJulia++;
                }
                if (savedWeek[key].assignedTo === "Annabel") {
                    countAnnabel++;
                }
            }

            console.log(countJulia, countAnnabel, countRuben);

            if (countRuben === countJulia && countJulia === countAnnabel) {
                const randomName = names[getRandomInt(0, 3)];

                updateDatabase(randomName, newItem, savedWeek.id);
            }
            else if (countRuben === countAnnabel && countRuben < countJulia) {
                const names = ["Ruben", "Annabel"];
                const randomName = names[getRandomInt(0, 2)];

                updateDatabase(randomName, newItem, savedWeek.id);
            }
            else if (countRuben === countJulia && countRuben < countAnnabel) {
                const names = ["Ruben", "Julia"];
                const randomName = names[getRandomInt(0, 2)];

                updateDatabase(randomName, newItem, savedWeek.id);
            }
            else if (countAnnabel === countJulia && countAnnabel < countRuben) {
                const names = ["Annabel", "Julia"];
                const randomName = names[getRandomInt(0, 2)];

                updateDatabase(randomName, newItem, savedWeek.id);
            }
            else {
                const smallestCount = Math.min(countRuben, countJulia, countAnnabel);

                if (smallestCount === countJulia) {
                    updateDatabase('Julia', newItem, savedWeek.id);
                }
                else if (smallestCount === countAnnabel) {
                    updateDatabase('Annabel', newItem, savedWeek.id);
                }
                else if (smallestCount === countRuben) {
                    updateDatabase('Ruben', newItem, savedWeek.id);
                }
            }
        }
    });
}

async function updateDatabase(name, item, weekId) {
    const updateDocRef = doc(db, 'savedWeeks', weekId);

    await updateDoc(updateDocRef, {
        [item]: {
            assignedTo: name,
            done: false,
            dateDone: '',
            chore: item
        },
    });
    location.reload();
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}

function getWeekNumber(d) {
    // Copy date so don't modify original
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    // Set to nearest Thursday: current date + 4 - current day number
    // Make Sunday's day number 7
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
    // Get first day of year
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    // Calculate full weeks to nearest Thursday
    var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
    // Return array of year and week number
    return weekNo;
}

function getSavedWeeks(newItem) {
    const colRef = collection(db, 'savedWeeks')

    getDocs(colRef)
        .then((snapshot) => {
            let savedWeeks = [];

            const doc = snapshot.docs;

            doc.forEach((doc) => {
                savedWeeks.push({ ...doc.data(), id: doc.id })
            })
            addTaskToRenderedWeeks(savedWeeks, newItem);
        })
        .catch ((error) => {
            console.log(error);
        });
}

getAllItems();