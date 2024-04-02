// Wait for the entire DOM to be loaded before initializing the app.
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize the application by setting up necessary states and event listeners.
function initializeApp() {
    autofillDateTime(); // Set current date and time on the form.
    attachEventListeners(); // Setup event listeners for all interactive elements.
    loadDropdownsFromLocalStorage(); // Load saved dropdown values from localStorage.
    loadNotesFromLocalStorage(); // Load saved notes from localStorage.
}

// Autofill the date and time fields with the current date and time.
function autofillDateTime() {
    const now = new Date();
    document.getElementById('noteDate').value = now.toISOString().split('T')[0];
    document.getElementById('noteTime').value = now.toTimeString().split(' ')[0].substring(0, 8);
}

// Attach event listeners to various elements in the DOM.
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

// Function to add a new option to a dropdown.
function addOption(dropdownId, inputId) {
    const dropdown = document.getElementById(dropdownId);
    const input = document.getElementById(inputId);
    const optionValue = input.value.trim();
    if (optionValue && ![...dropdown.options].map(option => option.value).includes(optionValue)) {
        const newOption = new Option(optionValue, optionValue);
        dropdown.add(newOption);
        input.value = ''; // Clear input field after adding.
        saveDropdownToLocalStorage(dropdownId); // Save the updated dropdown to localStorage.
    }
}

// Function to remove a selected option from a dropdown.
function removeOption(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    if (dropdown.selectedIndex > -1) {
        dropdown.remove(dropdown.selectedIndex);
        saveDropdownToLocalStorage(dropdownId); // Update localStorage after removal.
    }
}

// Handle form submission to save a new note.
function handleFormSubmit(event) {
    event.preventDefault(); // Prevent the default form submission behavior.
    const note = collectFormData(); // Collect data from the form.
    displayNote(note); // Display the collected note.
    saveNoteToLocalStorage(note); // Save the note to localStorage.
    event.target.reset(); // Optionally reset the form after saving.
    autofillDateTime(); // Re-autofill the date and time.
}

// Collect data from the form inputs and dropdowns.
function collectFormData() {
    // Collect and return all form data as an object.
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

// Display a saved note in the notes output section.
function displayNote(note) {
    const notesOutput = document.getElementById('notesOutput');
    const noteElement = document.createElement('div');
    noteElement.className = "note";
    noteElement.textContent = `${note.date} ${note.time} - Nurse: ${note.nurseName} (${note.nurseDetails}), Patient: ${note.patientName} (${note.patientDetails}), Activity: ${note.activity} (${note.activityDetails}), Observation: ${note.observation} (${note.observationDetails}), Additional Notes: ${note.additionalNotes}`;
    notesOutput.appendChild(noteElement);
}

// Save a new note to localStorage.
function saveNoteToLocalStorage(note) {
    const notes = JSON.parse(localStorage.getItem('nurseNotes') || '[]');
    notes.push(note);
    localStorage.setItem('nurseNotes', JSON.stringify(notes));
}

// Load saved dropdown options from localStorage and repopulate the dropdowns.
function loadDropdownsFromLocalStorage() {
    ['nurseNameDropdown', 'patientNameDropdown', 'activityDropdown', 'observationDropdown'].forEach(dropdownId => {
        const savedOptions = JSON.parse(localStorage.getItem(dropdownId) || '[]');
        const dropdown = document.getElementById(dropdownId);
        dropdown.innerHTML = ''; // Clear existing options.
        savedOptions.forEach(optionValue => {
            const option = new Option(optionValue, optionValue);
            dropdown.add(option);
        });
    });
}

// Load saved notes from localStorage and display them.
function loadNotesFromLocalStorage() {
    const notes = JSON.parse(localStorage.getItem('nurseNotes') || '[]');
    notes.forEach(displayNote);
}

// Export the displayed notes as a text file.
function exportNotes() {
    const notesText = Array.from(document.getElementsByClassName('note')).map(noteDiv => noteDiv.textContent).join('\n');
    const blob = new Blob([notesText], {type: 'text/plain'});
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = 'nurse_notes.txt';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

// Reset the form and clear all data, both in the DOM and in localStorage.
function resetFormAndClearData() {
    if (confirm('Are you sure you want to reset the form and clear all stored data?')) {
        localStorage.clear();
        document.getElementById('notesForm').reset();
        document.getElementById('notesOutput').innerHTML = '';
        loadDropdownsFromLocalStorage(); // Reinitialize dropdowns after resetting.
    }
}

// Clear only the saved notes, both from localStorage and the display.
function clearSavedNotes() {
    if (confirm('Are you sure you want to clear all saved notes?')) {
        localStorage.removeItem('nurseNotes');
        document.getElementById('notesOutput').innerHTML = '';
    }
}
