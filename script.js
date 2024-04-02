// This script enhances the Nurse Notes web application with PWA features, handling dropdowns, local storage, and form submissions.

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    autofillDateTime();
    loadDropdownsAndNotes();
    setupEventListeners();
}

function autofillDateTime() {
    const now = new Date();
    document.getElementById('noteDate').value = now.toISOString().split('T')[0];
    document.getElementById('noteTime').value = now.toTimeString().split(' ')[0].substring(0, 5);
}

function setupEventListeners() {
    document.getElementById('addNurseName').addEventListener('click', () => addDropdownOption('nurseNameDropdown', 'nurseNameInput'));
    document.getElementById('removeNurseName').addEventListener('click', () => removeDropdownOption('nurseNameDropdown'));
    document.getElementById('addPatientName').addEventListener('click', () => addDropdownOption('patientNameDropdown', 'patientNameInput'));
    document.getElementById('removePatientName').addEventListener('click', () => removeDropdownOption('patientNameDropdown'));
    document.getElementById('addActivity').addEventListener('click', () => addDropdownOption('activityDropdown', 'activityInput'));
    document.getElementById('removeActivity').addEventListener('click', () => removeDropdownOption('activityDropdown'));
    document.getElementById('addObservation').addEventListener('click', () => addDropdownOption('observationDropdown', 'observationInput'));
    document.getElementById('removeObservation').addEventListener('click', () => removeDropdownOption('observationDropdown'));
    document.getElementById('notesForm').addEventListener('submit', saveNote);
    document.getElementById('exportNotes').addEventListener('click', exportNotesAsTextFile);
    document.getElementById('resetForm').addEventListener('click', confirmResetAndClearData);
    document.getElementById('clearNotes').addEventListener('click', clearSavedNotes);
}

function addDropdownOption(dropdownId, inputId) {
    const dropdown = document.getElementById(dropdownId);
    const input = document.getElementById(inputId);
    const value = input.value.trim();
    if (value && ![...dropdown.options].map(option => option.value).includes(value)) {
        dropdown.options.add(new Option(value, value));
        saveDropdownToLocalStorage(dropdownId, value);
        input.value = '';
    }
}

function removeDropdownOption(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    if (dropdown.selectedIndex > -1) {
        dropdown.options[dropdown.selectedIndex].remove();
        saveDropdownToLocalStorage(dropdownId);
    }
}

function saveDropdownToLocalStorage(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    const options = Array.from(dropdown.options).map(o => o.value);
    localStorage.setItem(dropdownId, JSON.stringify(options));
}

function loadDropdownsAndNotes() {
    ['nurseNameDropdown', 'patientNameDropdown', 'activityDropdown', 'observationDropdown'].forEach(dropdownId => {
        const options = JSON.parse(localStorage.getItem(dropdownId) || '[]');
        const dropdown = document.getElementById(dropdownId);
        options.forEach(optionValue => {
            dropdown.options.add(new Option(optionValue, optionValue));
        });
    });
    loadNotesFromLocalStorage();
}

function saveNote(event) {
    event.preventDefault();
    const note = {
        date: document.getElementById('noteDate').value,
        time: document.getElementById('noteTime').value,
        nurseName: document.getElementById('nurseNameDropdown').value,
        nurseDetails: document.getElementById('nurseNameDetails').value,
        patientName: document.getElementById('patientNameDropdown').value,
        patientDetails: document.getElementById('patientNameDetails').value,
        activity: document.getElementById('activityDropdown').value,
        activityDetails: document.getElementById('activityDetails').value,
        observation: document.getElementById('observationDropdown').value,
        observationDetails: document.getElementById('observationDetails').value,
        additionalNotes: document.getElementById('details').value,
    };
    displayNote(note);
    saveNotesToLocalStorage(note);
    document.getElementById('notesForm').reset();
    autofillDateTime();
}

function displayNote(note) {
    const notesOutput = document.getElementById('notesOutput');
    const noteElement = document.createElement('div');
    noteElement.textContent = `Date: ${note.date}, Time: ${note.time}, Nurse: ${note.nurseName} (${note.nurseDetails}), Patient: ${note.patientName} (${note.patientDetails}), Activity: ${note.activity} (${note.activityDetails}), Observation: ${note.observation} (${note.observationDetails}), Additional Notes: ${note.additionalNotes}`;
    notesOutput.appendChild(noteElement);
}

function saveNotesToLocalStorage(note) {
    const notes = JSON.parse(localStorage.getItem('nurseNotes') || '[]');
    notes.push(note);
    localStorage.setItem('nurseNotes', JSON.stringify(notes));
}

function loadNotesFromLocalStorage() {
    const notes = JSON.parse(localStorage.getItem('nurseNotes') || '[]');
    notes.forEach(displayNote);
}

function exportNotesAsTextFile() {
    const notes = document.getElementById('notesOutput').innerText;
    const blob = new Blob([notes], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'nurse_notes_' + new Date().toISOString().split('T')[0] + '.txt';
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function confirmResetAndClearData() {
    if (confirm("This will delete all saved data and reset the form. Are you sure?")) {
        localStorage.clear();
        document.getElementById('notesForm').reset();
        document.getElementById('notesOutput').innerHTML = '';
        ['nurseNameDropdown', 'patientNameDropdown', 'activityDropdown', 'observationDropdown'].forEach(dropdownId => {
            document.getElementById(dropdownId).innerHTML = '';
        });
    }
}

function clearSavedNotes() {
    if (confirm("Are you sure you want to clear all saved notes? This action cannot be undone.")) {
        localStorage.removeItem('nurseNotes');
        document.getElementById('notesOutput').innerHTML = '';
    }
}
