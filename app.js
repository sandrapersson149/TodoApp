const noteInput = document.querySelector('.js-note-input');
const nameInput = document.querySelector('.js-name-input');
const list = document.querySelector('.js-note-list');
const form = document.querySelector('.js-form');

let noteItems = [];

function addNote(name, noteText) {
  const note = {
    name,
    noteText,
    id: Date.now(),
  };

  noteItems.push(note);
  renderNote(note);
}


function handleClick(node) {
  console.log('hej');
  remove()
}

function renderNote(note) {
  localStorage.setItem('noteItems', JSON.stringify(noteItems));

  const item = document.querySelector(`[data-key='${note.id}']`);

  const node = document.createElement("li");
  node.setAttribute('class', `note-item`);
  node.setAttribute('data-key', note.id);
  node.innerHTML = `
  <div onclick="handleClick(node)"><i class="fa fa-times" aria-hidden="true"></i></div>
  <span><i>written by: ${note.name}</i>
  <p>${note.noteText}</p>
  `;

  if (item) {
    list.replaceChild(node, item);
  } else {
    list.append(node);
  }
}


form.addEventListener('submit', event => {
  event.preventDefault();
  const name = nameInput.value.trim();
  const noteText = noteInput.value.trim();
  if (name || noteText !== '') {
    addNote(name, noteText);
    nameInput.value = '';
    noteInput.value = '';
    noteInput.focus();
    nameInput.focus();
    console.log(name + ' ' + noteText)
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const ref = localStorage.getItem('noteItems');
  if (ref) {
    noteItems = JSON.parse(ref);
    noteItems.forEach(item => {
      renderNote(item);
    });
  }
});