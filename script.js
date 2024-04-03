// script.js: Handles all the interactive functionality for the Nurse Notes application.

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application once the DOM is fully loaded.
    initializeApp();
});

function initializeApp() {
    autofillDateTime();
    attachEventListeners();
    loadDropdownsFromLocalStorage();
    loadNotesFromLocalStorage();
}

function autofillDateTime() {
    const now = new Date();
    document.getElementById('noteDate').value = now.toISOString().split('T')[0];
    document.getElementById('noteTime').value = now.toTimeString().split(' ')[0].substring(0, 8);
}

function attachEventListeners() {
    document.getElementById('addNurseName').addEventListener('click', () => addOption('nurseNameDropdown', 'nurseNameInput'));
    document.getElementById('removeNurseName').addEventListener('click', () => removeOption('nurseNameDropdown'));
    document.getElementById('addPatientName').addEventListener('click', () => addOption('patientNameDropdown', 'patientNameInput'));
    document.getElementById('removePatientName').addEventListener('click', () => removeOption('patientNameDropdown'));
    document.getElementById('addActivity').addEventListener('click', () => addOption('activityDropdown', 'activityInput'));
    document.getElementById('removeActivity').addEventListener('click', () => removeOption('activityDropdown'));
    document.getElementById('addObservation').addEventListener('click', () => addOption('observationDropdown', 'observationInput'));
    document.getElementById('removeObservation').addEventListener('click', () => removeOption('observationDropdown'));
    document.getElementById('notesForm').addEventListener('submit', handleFormSubmit);
    document.getElementById('resetForm').addEventListener('click', resetFormAndClearData);
    document.getElementById('clearNotes').addEventListener('click', clearSavedNotes);
    document.getElementById('exportNotes').addEventListener('click', exportNotes);
    document.getElementById('exportDropdownData').addEventListener('click', exportDropdownData);
    document.getElementById('importDropdownData').addEventListener('change', importDropdownData);
}

function addOption(dropdownId, inputId) {
    const dropdown = document.getElementById(dropdownId);
    const input = document.getElementById(inputId);
    const optionValue = input.value.trim();
    if (optionValue && ![...dropdown.options].map(o => o.value).includes(optionValue)) {
        dropdown.add(new Option(optionValue, optionValue));
        input.value = '';
        saveDropdownToLocalStorage(dropdownId);
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
    this.reset();
    autofillDateTime();
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
        additionalNotes: document.getElementById('details').value
    };
}

function displayNote(note) {
    const notesOutput = document.getElementById('notesOutput');
    const noteElement = document.createElement('div');
    noteElement.className = 'note';
    noteElement.textContent = formatNoteContent(note);
    notesOutput.appendChild(noteElement);
}

function formatNoteContent(note) {
    return `${note.date} ${note.time} - Nurse: ${note.nurseName} (${note.nurseDetails}), ` +
           `Patient: ${note.patientName} (${note.patientDetails}), ` +
           `Activity: ${note.activity} (${note.activityDetails}), ` +
           `Observation: ${note.observation} (${note.observationDetails}), ` +
           `Additional Notes: ${note.additionalNotes}`;
}

function saveNoteToLocalStorage(note) {
    const notes = JSON.parse(localStorage.getItem('nurseNotes') || '[]');
    notes.push(note);
    localStorage.setItem('nurseNotes', JSON.stringify(notes));
}

function loadDropdownsFromLocalStorage() {
    const dropdownIds = ['nurseNameDropdown', 'patientNameDropdown', 'activityDropdown', 'observationDropdown'];
    dropdownIds.forEach(dropdownId => {
        const dropdown = document.getElementById(dropdownId);
        dropdown.innerHTML = '';
        const savedOptions = JSON.parse(localStorage.getItem(dropdownId) || '[]');
        savedOptions.forEach(optValue => {
            dropdown.add(new Option(optValue, optValue));
        });
    });
}

function loadNotesFromLocalStorage() {
    const notes = JSON.parse(localStorage.getItem('nurseNotes') || '[]');
    notes.forEach(displayNote);
}

function exportNotes() {
    const notes = JSON.parse(localStorage.getItem('nurseNotes') || '[]');
    const notesText = notes.map(formatNoteContent).join('\n');
    downloadToFile(notesText, 'nurse_notes.txt', 'text/plain');
}

function saveDropdownToLocalStorage(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    const options = [...dropdown.options].map(option => option.value);
    localStorage.setItem(dropdownId, JSON.stringify(options));
}

function exportDropdownData() {
    const dropdownIds = ['nurseNameDropdown', 'patientNameDropdown', 'activityDropdown', 'observationDropdown'];
    const dataToExport = dropdownIds.reduce((acc, id) => {
        acc[id] = JSON.parse(localStorage.getItem(id) || '[]');
        return acc;
    }, {});
    const dataStr = JSON.stringify(dataToExport);
    downloadToFile(dataStr, 'dropdown_data.json', 'application/json');
}

function importDropdownData(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const data = JSON.parse(e.target.result);
            Object.keys(data).forEach(key => {
                localStorage.setItem(key, JSON.stringify(data[key]));
            });
            loadDropdownsFromLocalStorage();
        };
        reader.readAsText(file);
    }
}

function resetFormAndClearData() {
    if (confirm('Are you sure you want to reset the form and clear all data?')) {
        localStorage.clear();
        document.getElementById('notesForm').reset();
        document.getElementById('notesOutput').innerHTML = '';
        loadDropdownsFromLocalStorage();
    }
}

function clearSavedNotes() {
    if (confirm('Are you sure you want to clear all saved notes?')) {
        localStorage.removeItem('nurseNotes');
        document.getElementById('notesOutput').innerHTML = '';
    }
}

function downloadToFile(content, filename, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = filename;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
}
