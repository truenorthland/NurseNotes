// This script handles event listeners, form submissions, dynamic content manipulation,
// local storage interaction, and the export functionality.

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    autofillDateTime();
    attachEventListeners();
    loadNotesFromLocalStorage();
}

function autofillDateTime() {
    const now = new Date();
    document.getElementById('noteDate').value = now.toISOString().split('T')[0];
    document.getElementById('noteTime').value = now.toTimeString().split(' ')[0].substring(0, 8);
}

function attachEventListeners() {
    document.getElementById('addNurseName').addEventListener('click', function() { addOption('nurseNameDropdown', 'nurseNameInput'); });
    document.getElementById('removeNurseName').addEventListener('click', function() { removeOption('nurseNameDropdown'); });
    document.getElementById('addPatientName').addEventListener('click', function() { addOption('patientNameDropdown', 'patientNameInput'); });
    document.getElementById('removePatientName').addEventListener('click', function() { removeOption('patientNameDropdown'); });
    document.getElementById('addActivity').addEventListener('click', function() { addOption('activityDropdown', 'activityInput'); });
    document.getElementById('removeActivity').addEventListener('click', function() { removeOption('activityDropdown'); });
    document.getElementById('addObservation').addEventListener('click', function() { addOption('observationDropdown', 'observationInput'); });
    document.getElementById('removeObservation').addEventListener('click', function() { removeOption('observationDropdown'); });
    document.getElementById('notesForm').addEventListener('submit', handleFormSubmit);
    document.getElementById('exportNotes').addEventListener('click', exportNotes);
    document.getElementById('resetForm').addEventListener('click', resetFormAndClearData);
    document.getElementById('clearNotes').addEventListener('click', clearSavedNotes);
}

function addOption(dropdownId, inputId) {
    const dropdown = document.getElementById(dropdownId);
    const input = document.getElementById(inputId);
    const optionValue = input.value.trim();
    if (optionValue) {
        const newOption = new Option(optionValue, optionValue);
        dropdown.add(newOption);
        input.value = ''; // Clear input field
        saveDropdownToLocalStorage(dropdownId, newOption.value);
    }
}

function removeOption(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    if (dropdown.selectedIndex > -1) {
        dropdown.remove(dropdown.selectedIndex);
        saveDropdownToLocalStorage(dropdownId);
    }
}

function handleFormSubmit(event) {
    event.preventDefault();
    const note = collectFormData();
    displayNote(note);
    saveNoteToLocalStorage(note);
    event.target.reset(); // Reset the form
}

function collectFormData() {
    return {
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
}

function displayNote(note) {
    const noteElement = document.createElement('div');
    noteElement.textContent = `${note.date} ${note.time} - Nurse: ${note.nurseName}, Patient: ${note.patientName}, Activities: ${note.activity}, Observations: ${note.observation}, Additional: ${note.additionalNotes}`;
    document.getElementById('notesOutput').appendChild(noteElement);
}

function saveNoteToLocalStorage(note) {
    const notes = JSON.parse(localStorage.getItem('nurseNotes') || '[]');
    notes.push(note);
    localStorage.setItem('nurseNotes', JSON.stringify(notes));
}

function loadNotesFromLocalStorage() {
    const notes = JSON.parse(localStorage.getItem('nurseNotes') || '[]');
    notes.forEach(displayNote);
}

function exportNotes() {
    const notes = document.getElementById('notesOutput').innerText;
    const blob = new Blob([notes], {type: 'text/plain'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nurse_notes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function resetFormAndClearData() {
    if (confirm('Are you sure you want to reset the form and clear all data?')) {
        localStorage.clear();
        document.getElementById('notesForm').reset();
        document.getElementById('notesOutput').innerHTML = '';
    }
}

function clearSavedNotes() {
    if (confirm('Are you sure you want to clear all saved notes?')) {
        localStorage.removeItem('nurseNotes');
        document.getElementById('notesOutput').innerHTML = '';
    }
}

function saveDropdownToLocalStorage(dropdownId, newOptionValue) {
    // Additional logic to handle updating local storage for dropdown options
}
