document.addEventListener('DOMContentLoaded', function() {
    autofillDateTime(); // Set the date and time inputs to the current date and time
    attachEventListeners(); // Attach event listeners to buttons and form
    loadDropdownsFromLocalStorage(); // Load dropdown options from localStorage
    loadNotesFromLocalStorage(); // Load saved notes from localStorage
});

function autofillDateTime() {
    const now = new Date();
    document.getElementById('noteDate').value = now.toISOString().split('T')[0];
    document.getElementById('noteTime').value = now.toTimeString().split(' ')[0].substring(0, 5);
}

function attachEventListeners() {
    // Dropdown addition and removal event listeners
    document.getElementById('addNurseName').addEventListener('click', () => addOption('nurseNameDropdown', 'nurseNameInput'));
    document.getElementById('removeNurseName').addEventListener('click', () => removeOption('nurseNameDropdown'));
    // Repeat for other dropdowns...
    document.getElementById('notesForm').addEventListener('submit', handleFormSubmit);
    document.getElementById('exportNotes').addEventListener('click', exportNotes);
    document.getElementById('resetForm').addEventListener('click', resetFormAndClearData);
    document.getElementById('clearNotes').addEventListener('click', clearSavedNotes);
}

function addOption(dropdownId, inputId) {
    const dropdown = document.getElementById(dropdownId);
    const input = document.getElementById(inputId);
    const optionValue = input.value.trim();
    if (optionValue && !Array.from(dropdown.options).some(option => option.value === optionValue)) {
        const newOption = new Option(optionValue, optionValue);
        dropdown.add(newOption);
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

function saveDropdownToLocalStorage(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    const options = Array.from(dropdown.options).map(option => option.value);
    localStorage.setItem(dropdownId, JSON.stringify(options));
}

function loadDropdownsFromLocalStorage() {
    const dropdownIds = ['nurseNameDropdown', 'patientNameDropdown', 'activityDropdown', 'observationDropdown'];
    dropdownIds.forEach(dropdownId => {
        const savedOptions = JSON.parse(localStorage.getItem(dropdownId) || '[]');
        const dropdown = document.getElementById(dropdownId);
        dropdown.innerHTML = '';
        savedOptions.forEach(optionValue => {
            const option = new Option(optionValue, optionValue);
            dropdown.add(option);
        });
    });
}

function handleFormSubmit(event) {
    event.preventDefault();
    const note = collectFormData();
    displayNote(note);
    saveNoteToLocalStorage(note);
    event.target.reset();
    autofillDateTime();
}

function collectFormData() {
    // Your existing logic to collect data from form fields
}

function displayNote(note) {
    // Your existing logic to display a note in the UI
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
    // Your existing logic for exporting notes to a text file
}

function resetFormAndClearData() {
    if (confirm('Are you sure you want to reset the form and clear all data?')) {
        localStorage.clear();
        document.getElementById('notesForm').reset();
        document.getElementById('notesOutput').innerHTML = '';
        loadDropdownsFromLocalStorage(); // This call is not needed if you're clearing localStorage
    }
}

function clearSavedNotes() {
    if (confirm('Are you sure you want to clear all saved notes?')) {
        localStorage.removeItem('nurseNotes');
        document.getElementById('notesOutput').innerHTML = '';
    }
}
