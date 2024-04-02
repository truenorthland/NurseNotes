// This script is designed to manage dropdown selections, form submissions, local storage interactions, and more.

document.addEventListener('DOMContentLoaded', function() {
    // Initialize application by loading saved dropdown options and notes.
    loadDropdownsFromLocalStorage();
    loadNotesFromLocalStorage();
    attachEventListeners();
});

// Autofills the date and time inputs with the current date and time.
function autofillDateTime() {
    const now = new Date();
    document.getElementById('noteDate').value = now.toISOString().split('T')[0];
    document.getElementById('noteTime').value = now.toTimeString().split(' ')[0].substring(0, 8);
}

// Attaches event listeners to form elements and buttons.
function attachEventListeners() {
    // Attach listeners for adding and removing dropdown options.
    document.getElementById('addNurseName').addEventListener('click', () => addOption('nurseNameDropdown', 'nurseNameInput'));
    document.getElementById('removeNurseName').addEventListener('click', () => removeOption('nurseNameDropdown'));
    // Repeat for other dropdowns...
    document.getElementById('notesForm').addEventListener('submit', handleFormSubmit);
    document.getElementById('exportNotes').addEventListener('click', exportNotes);
    document.getElementById('resetForm').addEventListener('click', resetFormAndClearData);
    document.getElementById('clearNotes').addEventListener('click', clearSavedNotes);

    // Ensure date and time are autofilled on page load.
    autofillDateTime();
}

// Adds a new option to a dropdown and saves the updated list to localStorage.
function addOption(dropdownId, inputId) {
    const dropdown = document.getElementById(dropdownId);
    const input = document.getElementById(inputId);
    const optionValue = input.value.trim();
    if (optionValue) {
        const newOption = new Option(optionValue, optionValue);
        dropdown.add(newOption);
        input.value = ''; // Clear input field after adding.
        saveDropdownToLocalStorage(dropdownId); // Save the updated dropdown to localStorage.
    }
}

// Removes the selected option from a dropdown and updates localStorage.
function removeOption(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    if (dropdown.selectedIndex > -1) {
        dropdown.remove(dropdown.selectedIndex);
        saveDropdownToLocalStorage(dropdownId); // Update localStorage after removal.
    }
}

// Saves the current state of all dropdowns to localStorage to persist data across sessions.
function saveDropdownToLocalStorage(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    const options = Array.from(dropdown.options).map(option => option.value);
    localStorage.setItem(dropdownId, JSON.stringify(options)); // Serialize and save the options array.
}

// Loads and repopulates dropdown options from localStorage on page load.
function loadDropdownsFromLocalStorage() {
    const dropdownIds = ['nurseNameDropdown', 'patientNameDropdown', 'activityDropdown', 'observationDropdown'];
    dropdownIds.forEach(dropdownId => {
        const savedOptions = JSON.parse(localStorage.getItem(dropdownId) || '[]'); // Deserialize the options array.
        const dropdown = document.getElementById(dropdownId);
        dropdown.innerHTML = ''; // Clear existing options.
        savedOptions.forEach(optionValue => {
            const option = new Option(optionValue, optionValue);
            dropdown.add(option); // Add each saved option back to the dropdown.
        });
    });
}

// Handles the submission of the form, saves the note, and resets the form.
function handleFormSubmit(event) {
    event.preventDefault(); // Prevent the default form submission behavior.
    const note = collectFormData();
    displayNote(note);
    saveNoteToLocalStorage(note);
    event.target.reset(); // Optionally reset the form fields after submission.
    autofillDateTime(); // Re-autofill date and time after form reset.
}

// Collects data from the form fields to create a note object.
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

// Displays a single note in the 'notesOutput' section.
function displayNote(note) {
    const noteElement = document.createElement('div');
    noteElement.textContent = `${note.date} ${note.time} - Nurse: ${note.nurseName}, Patient: ${note.patientName}, Activities: ${note.activity}, Observations: ${note.observation}, Additional: ${note.additionalNotes}`;
    document.getElementById('notesOutput').appendChild(noteElement);
}

// Saves the note to localStorage.
function saveNoteToLocalStorage(note) {
    const notes = JSON.parse(localStorage.getItem('nurseNotes') || '[]');
    notes.push(note);
    localStorage.setItem('nurseNotes', JSON.stringify(notes)); // Serialize and save the updated notes array.
}

// Loads and displays all saved notes from localStorage on page load.
function loadNotesFromLocalStorage() {
    const notes = JSON.parse(localStorage.getItem('nurseNotes') || '[]');
    notes.forEach(displayNote); // Display each saved note.
}

// Exports all displayed notes to a text file for download.
function exportNotes() {
    const notes = Array.from(document.getElementById('notesOutput').children).map(noteDiv => noteDiv.textContent).join('\n');
    const blob = new Blob([notes], {type: 'text/plain'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nurse_notes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// Clears all data, both from the form and localStorage.
function resetFormAndClearData() {
    if (confirm('Are you sure you want to reset the form and clear all data?')) {
        localStorage.clear(); // Clear all data stored in localStorage.
        document.getElementById('notesForm').reset(); // Reset the form fields.
        document.getElementById('notesOutput').innerHTML = ''; // Clear displayed notes.
        // Reinitialize dropdowns to ensure they are in sync with the cleared localStorage.
        loadDropdownsFromLocalStorage();
    }
}

// Clears only the saved notes from localStorage and the display.
function clearSavedNotes() {
    if (confirm('Are you sure you want to clear all saved notes?')) {
        localStorage.removeItem('nurseNotes'); // Remove only the saved notes from localStorage.
        document.getElementById('notesOutput').innerHTML = ''; // Clear the notes display.
    }
}
