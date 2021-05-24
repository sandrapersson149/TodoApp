// // arrayer av objekt
// const myForm = document.forms[0];
// const myInput = myForm.elements[0];
// const myList = document.querySelector('ul.todo-list');
// let todoArr = [];
 
 
// let nextID = 0; // räknare som räknar upp med 1 för varje objekt som skapas
 
// // skriv en funktion som tar in ett ID och returnerar todoArr minus det objektet som har samma ID som vi fick in som argument
 
 
// function removeTodo(id) {
//     console.log(id)
//     return todoArr.filter(function (todo) { return todo.id !== id })
// }
 
// myList.addEventListener('click', function (evt) {
//     //console.log(evt.target);
//     let clickedLI = evt.target.closest('li');
//     if (!clickedLI) {
//         return;
//     }
//     var clickedID = clickedLI.getAttribute('data-id');
//     todoArr = removeTodo(Number(clickedID))
//     clickedLI.remove()
// })
 
// myForm.addEventListener('submit', function (evt) {
//     evt.preventDefault();
//     //console.log(myInput.value);
//     let newTodo = addTodo(myInput.value);
//     let newListItem = createListItem(newTodo);
//     myList.appendChild(newListItem)
//     todoArr.push(newTodo);
//     //console.log(todoArr);
//     myForm.reset();
// });
 
 
// // skriv en funktion som genererar ett nytt todo-objekt som returneras
// // OBS: ID:t måste vara unikt.
 
// function addTodo(text) {
//     let myObj = {
//         id: Date.now(),
//         text: text,
//     }
//     return myObj;
// }
 
 
// // skriv en funktion som tar in (som argument) ett todo-objekt
// // och returnerar ett li-element, innehållandes ett span-element innehållandes texten från objektet.
 
// function createListItem(todoObj) {
//     let newLI = document.createElement('li');
//     newLI.setAttribute("data-id", todoObj.id);
 
//     newLI.classList.add('todo-item');
//     newLI.innerHTML = `<span>${todoObj.text}</span>`;
//     //newLI.innerHTML = '<span>' + todoObj.text + '</span>'
//     //console.log(newLI);
//     return newLI;
// }



// ____________________________  TEST ___________________________________

const createNoteButton = document.querySelector('.button');
const noteList = document.querySelector('.note-list');
const content = document.querySelector('#content');
const editor = document.querySelector('#editor');
const CLS = document.querySelector('.localStorage');
const search = document.querySelector('.search-field');
const favBtn = document.querySelector('.favSecBtn');
let notesArr = [];
let activeNoteID;
 
/* ========== QUILL ================== */
 
document.addEventListener('DOMContentLoaded', initialize);
 
let toolbarOptions = [
    ['bold', 'italic'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    ['image']
];
 
let Delta = Quill.import('delta');
 
let quill = new Quill('#editor', {
    modules: {
        toolbar: toolbarOptions
    },
    scrollingContainer: '#scrolling-container',
    placeholder: 'Write your note here...',
    theme: 'bubble'
});

 
function initialize() {
    document.querySelector('.favSecBtn').addEventListener('click', function (evt) {
        renderNotesList(searchNotes('', favNotes));
    });
 
    search.addEventListener('input', function (evt) {
 
        evt.preventDefault();
        let searchStr = evt.target.value;
        console.log(searchStr);
        if (searchStr.length >= 1) {
            // anävndare har sökt något
            let foundNotes = searchNotes(searchStr);
            renderNotesList(foundNotes);
        } else {
            // anv har tömt sökrutan
            renderNotesList(notesArr)
        }
    })
 
    CLS.addEventListener('click', function () {
        clearLS()
    });
    document.querySelector('.button').addEventListener('click', function () {
        console.log("cNB func ran");
        createNote();
        renderNotesList(notesArr);
    })
    noteList.addEventListener('click', function (evt) {
        let clickedLI = evt.target.closest('li');
        let clickedID = clickedLI.getAttribute('data-id');
        setEditor(readNote(clickedID));
    })
    let change = new Delta();
    quill.on('text-change', function (delta) {
        change = change.compose(delta);
    });
 
    // Save periodically
    setInterval(function () {
        if (change.length() > 0) {
            console.log('Saving changes', change);
            // Save the entire updated text to localStorage
            //const data = JSON.stringify(quill.getContents())
            //localStorage.setItem('storedText', data);
            // finns det en aktiv note? om inte, gör ingenting
            if (activeNoteID) {
                updateNote(activeNoteID)
            }
            change = new Delta();
        }
    }, 2 * 1000);
 
    getNotes();
    renderNotesList(notesArr);
}
// CRUD
 
function createNote() {
    let noteObj = {
        id: Date.now(),
        title: '',
        content: quill.getContents(),
        text: quill.getText(),
        favourite: false
    }
    notesArr.push(noteObj);
    saveNotes();
    setActiveNoteID(noteObj.id);
    renderNotesList(notesArr);
}
 
function readNote(id) {
    // hitta ett noteobjekt vars id matchar med argumentet id
    return notesArr.find(note => note.id == id);
}
function setEditor(note) {
    // uppdatera innehållet i edtiron
    // sätt activenoteID
    quill.setContents(note.content);
    setActiveNoteID(note.id);
 
}
function updateNote(id) {
    // skapa INGEN ny note, istället uppdatera en befintlig note
    let noteObj = notesArr.find(note => note.id == id);
    noteObj.content = quill.getContents();
    noteObj.text = quill.getText();
    saveNotes();
    renderNotesList(notesArr);
 
}
function getNotes() {
    let notesArrStr = localStorage.getItem('notesArr');
    if (!notesArrStr) {
        return;
    }
    notesArr = JSON.parse(notesArrStr);
}
 
function saveNotes() {
    localStorage.setItem('notesArr', JSON.stringify(notesArr))
}
 
function noteObjToHTML(noteObj) {
    // givet ett noteObj IN, returnera HTML
    let LI = document.createElement('li');
    LI.setAttribute('data-id', noteObj.id);
    LI.innerHTML = `
    <span>${noteObj.favourite ? '★' : '☆'}</span> 
        <p>${noteObj.text}</p>`
    return LI
}
 
function renderNotesList(arr) {
    noteList.innerHTML = '';
    arr.forEach(function (note) {
        noteList.appendChild(noteObjToHTML(note));
    })
}
 
function favNotes(note) {
    return note.favourite;
}
function searchNotes(str, func = function (note) { return note.text.toLowerCase().includes(str.toLowerCase()) }) {
    // filtrera och returnera samtliga notes som innehåller str
    return notesArr.filter(func)
}
 
function toggleFav(id) {
    let noteObj = notesArr.find(note => note.id == id);
    noteObj.favourite = !noteObj.favourite;
    saveNotes();
}
function clearLS() {
    localStorage.clear();
}
 
function clearEditor() {
    quill.setText('');
}
 
function setActiveNoteID(id) {
    activeNoteID = id;
}

// ----------------------------------------------------------------------------------------------------------------------





let quill = new Quill('#editor', {
    modules: {
        toolbar: [
            [{ header: [1, 2, 3, false] }],
            ['bold', 'italic', 'underline'],
            ['link'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['clean']
        ]
    },
    placeholder: 'Write your note here...',
    theme: 'bubble'  // or 'bubble'
});

let noteList = [];
const inputTitle = document.querySelector("#inputTitle") //det som skrivs in i input rutan sparas i konstanten inputTitle
const saveBtn = document.querySelector("#saveBtn") //vi tilldelar knappen en konstant för att kunna göra det nedre steget
const noteListUL = document.querySelector('#savedNotesList')

//let noteTitle = inputTitle.value; //det som skrivs in i vår "titelruta", dess värde, tilldelas variabeln noteTitle
let delta = quill.getContents();



//EVENTLISTENER
saveBtn.addEventListener('click', addNote) //sidan "lyssnar"/läser av när vi klickar på knappen och vi vill skicka det vi sparar till localSave

//FUNKTIONER
function addNote(text) {
    const note = {
        title: inputTitle.value,
        text: quill.getText(),
        content: quill.getContents(),
        id: Date.now(),
    };

    noteList.push(note);
    // console.log('NoteList: ', noteList);

    localStorage.setItem('noteObjects', JSON.stringify(noteList));//variabeln och dens "key name" sätts in i localstorage när funktionen kör
    createLiElement();

    function displayNote() { //[note, note2, note3] 
        let item = noteList;
        let ul = document.querySelector('ul');
        let li = document.querySelector('li');

        li.appendChild(document.createTextNode(item));
        let span = document.createElement('span');
        span.innerText = note.id;
    }

}
const notesListUl = document.querySelector("#savedNotesList");
// begin saxxat från KJ
noteListUL.addEventListener('click', function (evt) {
    let clickedLI = evt.target.closest('li');
    let clickedID = clickedLI.getAttribute('data-id');
    setEditor(readNote(clickedID));
});
function readNote(id) {
    // hitta ett noteobjekt vars id matchar med argumentet id
    return noteList.find(note => note.id == id);
}
function setEditor(note) {
    // uppdatera innehållet i edtiron
    // sätt activenoteID
    quill.setContents(note.content);
    inputTitle.value = note.title;
    //setActiveNoteID(note.id);

}
document.addEventListener('DOMContentLoaded', function () {
    //todo: lägg allt som ska köras EN gång vid sidans laddning här

    getNotes(); // hämtar fårn LS
    renderNotesList(noteList) // visar alla notes
})
function noteObjToHTML(noteObj) {
    // givet ett noteObj IN, returnera HTML
    let LI = document.createElement('li');
    LI.setAttribute('data-id', noteObj.id);
    LI.innerHTML = `<span>${noteObj.favourite ? '★' : '☆'
        }</span > <span>${noteObj.text}</span>`
    return LI
}
function renderNotesList(arr) {
    noteListUL.innerHTML = '';
    arr.forEach(function (note) {
        noteListUL.appendChild(noteObjToHTML(note));
    })
}
function getNotes() {
    let notesArrStr = localStorage.getItem('noteObjects');
    console.log(notesArrStr)
    if (!notesArrStr) {
        return;
    }
    noteList = JSON.parse(notesArrStr);
}
// end saxat från kj

function createLiElement() {
    let newLiElement = document.createElement("li")
    newLiElement.classList.add("noteLi");
    let x = localStorage.getItem('noteObjects');
    newLiElement.innerText = x;
    //newLiElement.innerHTML(`<p>${note.text}</p>`);

    notesListUl.appendChild(newLiElement);
}

