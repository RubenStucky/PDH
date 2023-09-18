// Import the functions you need from the SDKs you need
import {initializeApp} from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";
import {
    collection,
    doc,
    getDocs,
    getFirestore,
    updateDoc,
    addDoc
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

let setWeekNum = getWeekNumber(new Date());

if (setWeekNum === 37) {
    document.querySelector('.prevWeek').classList.add('red');
}

document.querySelector('.prevWeek').addEventListener('click', () => {
    if (setWeekNum !== 37){
        setWeekNum--;
        document.querySelector('.title').innerHTML = 'Takenlijst voor week ' + setWeekNum;

        if (setWeekNum === getWeekNumber(new Date())) {
            document.querySelector('.this-week').innerHTML = 'Huidige week'
        }
        else {
            document.querySelector('.this-week').innerHTML = '<button class="button-18">Terug naar huidige week</button>'
        }

        if (setWeekNum - getWeekNumber(new Date()) === 3) {
            document.querySelector('.nextWeek').classList.add('red');
        }
        else {
            document.querySelector('.nextWeek').classList.remove('red');
        }

        getSavedWeeks();
    }

    if (setWeekNum === 37) {
        document.querySelector('.prevWeek').classList.add('red');
    }
});

document.querySelector('.this-week').addEventListener('click', () => {
    setWeekNum = getWeekNumber(new Date());

    if (setWeekNum === 37) {
        document.querySelector('.prevWeek').classList.add('red');
    }
    document.querySelector('.nextWeek').classList.remove('red');

    document.querySelector('.title').innerHTML = 'Takenlijst voor week ' + setWeekNum;
    document.querySelector('.this-week').innerHTML = 'Huidige week'

    getSavedWeeks();
});

document.querySelector('.nextWeek').addEventListener('click', () => {
    if (setWeekNum - getWeekNumber(new Date()) < 3) {
        document.querySelector('.prevWeek').classList.remove('red');
        setWeekNum++;
        document.querySelector('.title').innerHTML = 'Takenlijst voor week ' + setWeekNum;

        if (setWeekNum === getWeekNumber(new Date())) {
            document.querySelector('.this-week').innerHTML = 'Huidige week'
        }
        else {
            document.querySelector('.this-week').innerHTML = '<button class="button-18">Terug naar huidige week</button>'
        }

        getSavedWeeks();
    }

    if (setWeekNum - getWeekNumber(new Date()) === 3) {
        document.querySelector('.nextWeek').classList.add('red');
    }
    else {
        document.querySelector('.nextWeek').classList.remove('red');
    }
});

document.querySelector('.title').innerHTML = 'Takenlijst voor week ' + setWeekNum;

document.querySelector('.this-week').innerHTML = 'Huidige week'

const db = getFirestore();

const colRef = collection(db, 'savedWeeks')

const colRefChores = collection(db, 'chores')

let chores = [];

getDocs(colRefChores)
    .then((snapshot) => {

        const doc = snapshot.docs;

        doc.forEach((doc) => {
            chores.push({ ...doc.data(), id: doc.id })
        })
    })
    .catch ((error) => {
        console.log(error);
    });

function getSavedWeeks() {
    getDocs(colRef)
        .then((snapshot) => {
            let savedWeeks = [];

            const doc = snapshot.docs;

            doc.forEach((doc) => {
                savedWeeks.push({ ...doc.data(), id: doc.id })
            })
            checkIfNewWeek(savedWeeks);
        })
        .catch ((error) => {
            console.log(error);
        });
}

function checkIfNewWeek(savedWeeks) {
    let newWeek = true;
    savedWeeks.forEach((savedWeek) => {
        if (savedWeek.weekNum === setWeekNum) {
            inputThisWeek(savedWeek, chores);
            newWeek = false;
        }
    });

    if (newWeek) {
        distributeChores(chores);
        getSavedWeeks();
    }
}

async function inputHTML(personChores, weekId, chores) {
    if (await checkPreviousWeek() > 0) {
        document.querySelector('.warning-message').classList.remove('hide');
        document.querySelector('.warning-message').innerHTML = ` ${await checkPreviousWeek()} taakjes van vorige week zijn niet gedaan!`;
    }
    else {
        document.querySelector('.warning-message').classList.add('hide');
    }

    const people = ["Julia", "Annabel", "Ruben"];

    const scheduleContainer = document.getElementById("schedule");
    scheduleContainer.innerHTML = '';
    // Create cards for each person and display their chores
    for (const person of people) {
        const personChoreList = personChores[person];

        if (personChoreList.length > 0) {
            // Create a card for the person
            const personCard = document.createElement("div");
            personCard.classList.add("person-card");
            if (checkIfAllDone(personChoreList)) {
                personCard.innerHTML = `
                <h2>${person} <i class="fas fa-check-circle done-icon" style="color: green; font-size: 24px; cursor: pointer;"></i></h2> 
                <div class="chore-list"></div>
            `;
            } else {
                personCard.innerHTML = `
                <h2 class="personName">${person}</h2> 
                <div class="chore-list"></div>
            `;
            }

            // Append the person's chores to the card
            const choreListContainer = personCard.querySelector(".chore-list");
            personChoreList.forEach((chore) => {
                const choreElement = document.createElement("div");
                choreElement.classList.add("chore");

                if (chore.done) {
                    choreElement.innerHTML = `
                    <h3>${chore.chore} <p style="font-size: small; color: gray">Voltooid</p></h3>
                    <p class="statusClass">${'Gedaan op:' + ' ' + chore.dateDone}</p>
                    <div class="icons">
                        <div class="icons">
                        <i class="fas fa-check-circle done-icon" style="color: green; font-size: 24px; cursor: pointer;"></i> <!-- Green checkmark icon -->
                        <i class="fas fa-stop-circle not-done-icon" style="color: lightgray; font-size: 24px; cursor: pointer;"></i> <!-- Red stop button icon -->
                    </div>
                    </div>
                `;
                } else {
                    let lastDone = '';
                    chores.forEach((chorelist) => {
                        if (chorelist.chore === chore.chore) {
                            lastDone = chorelist.lastDone;

                            if (lastDone === '') {
                                lastDone = 'Nog nooit'
                            }
                        }
                    });
                    choreElement.innerHTML = `
                    
                    <h3>${chore.chore} <p style="font-size: small; color: gray">Laatst gedaan: ${lastDone}</p></h3>
                    <p class="statusClass">Niet gedaan</p>
                    <div class="icons">
                        <div class="icons">
                        <i class="fas fa-check-circle done-icon" style="color: lightgray; font-size: 24px; cursor: pointer;"></i> <!-- Green checkmark icon -->
                        <i class="fas fa-stop-circle not-done-icon" style="color: red; font-size: 24px; cursor: pointer;"></i> <!-- Red stop button icon -->
                    </div>
                    </div>
                `;
                }

                const doneIcon = choreElement.querySelector(".done-icon");
                const notDoneIcon = choreElement.querySelector(".not-done-icon");
                const statusClass = choreElement.querySelector(".statusClass");

                const currentdate = new Date();
                const datetime = "Gedaan op: " + new Date().toLocaleDateString();

                doneIcon.addEventListener("click", async () => {
                    // Handle the "done" action (e.g., mark the chore as done)
                    // You can add your logic here
                    doneIcon.style.color = "green"; // Change the icon color to green
                    notDoneIcon.style.color = "lightgray"; // Reset the other icon color
                    statusClass.innerHTML = datetime;
                    console.log(chore)
                    await updateState(weekId, chore.chore, new Date().toLocaleDateString(), true, person, chore.id, chore.frequency);

                    getSavedWeeks();
                });

                notDoneIcon.addEventListener("click", async () => {
                    // Handle the "not done" action (e.g., mark the chore as not done)
                    // You can add your logic here
                    notDoneIcon.style.color = "red"; // Change the icon color to red
                    doneIcon.style.color = "lightgray"; // Reset the other icon color
                    statusClass.innerHTML = "Niet gedaan";


                    await updateState(weekId, chore.chore, '', false, person, chore.id, chore.frequency);

                    getSavedWeeks();
                });
                choreListContainer.appendChild(choreElement);
            });

            // Append the person's card to the schedule container
            scheduleContainer.appendChild(personCard);
        }
    }
}

function distributeChores(chores) {
    const people = ["Julia", "Annabel", "Ruben"];
    const shuffledPeople = shuffleArray(people);
    const shuffledChores = shuffleArray(chores);

    const filteredChores = shuffledChores.filter((chore) => {
        if (chore.frequency === '1' || chore.frequency === undefined) {
            return true;
        }
        if (chore.frequency === '2') {
            if (chore.week === 1) {
                return setWeekNum % 2 === 0;

            }
            if (chore.week === 2) {
                return setWeekNum % 2 !== 0;
            }
        }
        if (chore.frequency === '4') {
            if (chore.week === 1) {
                return setWeekNum % 4 === 0;

            }
            if (chore.week === 2) {
                return (setWeekNum % 4 !== 0) && (setWeekNum % 2 === 0);
            }
        }

        return false;
    });

    // Create an object to store chores for each person
    let personChores = {
        "Julia": [],
        "Annabel": [],
        "Ruben": [],
    };

    let assiggnedChores = [];

    // Distribute shuffled chores among people
    for (let i = 0; i < filteredChores.length; i++) {
        const personIndex = i % 3; // Distribute to Person 1, 2, 3 in a loop
        const chore = filteredChores[i];
        // Store the chore in the respective person's array

        assiggnedChores[chore.chore] = {
            assignedTo: shuffledPeople[personIndex],
            done: false,
            chore: chore.chore,
            id: chore.id,
            frequency: chore.frequency,
            dateDone: ''
        };
    }

    addDoc(colRef, {
        ...assiggnedChores,
        weekNum: setWeekNum
    });
}

function inputThisWeek(savedWeek, chores) {
    let personChores = {
        "Julia": [],
        "Annabel": [],
        "Ruben": [],
    };

    chores.forEach((chore) => {
        if (savedWeek[chore.chore]){
            personChores[savedWeek[chore.chore].assignedTo].push(savedWeek[chore.chore]);
        }
    });

    inputHTML(personChores, savedWeek.id, chores);
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

async function updateState(weekId, taskName, dateDone, done, assignedTo, choreId, frequency) {
    const docRef = doc(db, 'savedWeeks', weekId);

    await updateDoc(docRef, {
        [taskName]: {
            assignedTo: assignedTo,
            done: done,
            dateDone: dateDone,
            chore: taskName,
            frequency: frequency,
            id: choreId
        },
    });

    const docRefChores = doc(db, 'chores', choreId);
    await updateDoc(docRefChores, {
        chore: taskName,
        frequency: frequency,
        lastDone: dateDone,
    });
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

async function checkPreviousWeek() {
    let notAllDone = 0;
    let savedWeeks = [];

    const colRef = collection(db, 'savedWeeks')

    await getDocs(colRef)
        .then((snapshot) => {
            const doc = snapshot.docs;
            doc.forEach((doc) => {
                savedWeeks.push({...doc.data(), id: doc.id})
            })


        })
        .catch((error) => {
            console.log(error);
        });

    savedWeeks.forEach((savedWeek) => {
        if (savedWeek.weekNum === getWeekNumber(new Date()) - 1) {
            for (const key in savedWeek) {
                if (savedWeek[key].done === false) {
                    notAllDone++;
                }
            }
        }
    });

    return notAllDone;
}

function checkIfAllDone(list) {
    let allDone = true;

    list.forEach((item) => {
        if (!item.done) {
            allDone = false;
        }
    });

    return allDone;
}

getSavedWeeks();
