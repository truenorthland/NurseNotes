// Wait for the entire DOM to be loaded before initializing the app.
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize the application by setting up necessary states and event listeners.
function initializeApp() {
    autofillDateTime(); // Set current date and time on the form.
    attachEventListeners(); // Setup event listeners for all interactive elements.
    loadNotesFromLocalStorage(); // Load saved notes from localStorage.
    loadDropdownsFromLocalStorage(); // Load saved dropdown values from localStorage.
}

// Autofill the date and time fields with the current date and time.
function autofillDateTime() {
    const now = new Date();
    document.getElementById('noteDate').value = now.toISOString().split('T')[0];
    document.getElementById('noteTime').value = now.toTimeString().split(' ')[0].substring(0, 8);
}

// Attach event listeners to various elements in the DOM.
function attachEventListeners() {
    // Add and remove options for dropdowns.
    document.getElementById('addNurseName').addEventListener('click', function() { addOption('nurseNameDropdown', 'nurseNameInput'); });
    document.getElementById('removeNurseName').addEventListener('click', function() { removeOption('nurseNameDropdown'); });
    document.getElementById('addPatientName').addEventListener('click', function() { addOption('patientNameDropdown', 'patientNameInput'); });
    document.getElementById('removePatientName').addEventListener('click', function() { removeOption('patientNameDropdown'); });
    document.getElementById('addActivity').addEventListener('click', function() { addOption('activityDropdown', 'activityInput'); });
    document.getElementById('removeActivity').addEventListener('click', function() { removeOption('activityDropdown'); });
    document.getElementById('addObservation').addEventListener('click', function() { addOption('observationDropdown', 'observationInput'); });
    document.getElementById('removeObservation').addEventListener('click', function() { removeOption('observationDropdown'); });

    // Handle form submission to save a note.
    document.getElementById('notesForm').addEventListener('submit', handleFormSubmit);
    // Export notes as a text file.
    document.getElementById('exportNotes').addEventListener('click', exportNotes);
    // Reset the form and clear all data.
    document.getElementById('resetForm').addEventListener('click', resetFormAndClearData);
    // Clear only the saved notes.
    document.getElementById('clearNotes').addEventListener('click', clearSavedNotes);
}

// Function to add a new option to a dropdown.
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
    noteElement.textContent = `${note.date} ${note.time} - Nurse: ${note.nurseName}, Patient: ${note.patientName}, Activities: ${note.activity}, Observations: ${note.observation}, Additional: ${note.additionalNotes}`;
    notesOutput.appendChild(noteElement); // Append the new note element to the notes output container.
}

// Save a new note to localStorage.
function saveNoteToLocalStorage(note) {
    const notes = JSON.parse(localStorage.getItem('nurseNotes') || '[]'); // Fetch existing notes or initialize an empty array.
    notes.push(note); // Add the new note to the array.
    localStorage.setItem('nurseNotes', JSON.stringify(notes)); // Save the updated array back to localStorage.
}

// Load saved notes from localStorage and display them.
function loadNotesFromLocalStorage() {
    const notes = JSON.parse(localStorage.getItem('nurseNotes') || '[]'); // Fetch existing notes.
    notes.forEach(displayNote); // Display each saved note.
}

// Export saved notes as a text file.
function exportNotes() {
    const notes = document.getElementById('notesOutput').innerText; // Collect all note text.
    const blob = new Blob([notes], {type: 'text/plain'}); // Create a new Blob containing the notes text.
    const url = URL.createObjectURL(blob); // Create a URL for the Blob.
    const a = document.createElement('a'); // Create a new <a> element for the download link.
    a.href = url;
    a.download = 'nurse_notes.txt'; // Set the download filename.
    document.body.appendChild(a); // Append the link to the body temporarily.
    a.click(); // Programmatically click the link to trigger the download.
    document.body.removeChild(a); // Remove the link from the body.
}

// Reset the form and clear all data, including localStorage.
function resetFormAndClearData() {
    if (confirm('Are you sure you want to reset the form and clear all data?')) {
        localStorage.clear(); // Clear all data from localStorage.
        document.getElementById('notesForm').reset(); // Reset the form fields.
        document.getElementById('notesOutput').innerHTML = ''; // Clear the notes display.
    }
}

// Clear only the saved notes from localStorage and the display.
function clearSavedNotes() {
    if (confirm('Are you sure you want to clear all saved notes?')) {
        localStorage.removeItem('nurseNotes'); // Remove the saved notes from localStorage.
        document.getElementById('notesOutput').innerHTML = ''; // Clear the notes display.
    }
}

// Save the current state of a dropdown to localStorage.
function saveDropdownToLocalStorage(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    const options = Array.from(dropdown.options).map(option => option.value); // Extract value from each option.
    localStorage.setItem(dropdownId, JSON.stringify(options)); // Save the array of option values to localStorage.
}

// Load saved dropdown options from localStorage and repopulate the dropdowns.
function loadDropdownsFromLocalStorage() {
    const dropdowns = ['nurseNameDropdown', 'patientNameDropdown', 'activityDropdown', 'observationDropdown'];
    dropdowns.forEach(dropdownId => {
        const savedOptions = JSON.parse(localStorage.getItem(dropdownId) || '[]');
        const dropdown = document.getElementById(dropdownId);
        dropdown.innerHTML = ''; // Clear current options.
        savedOptions.forEach(optionValue => {
            const option = new Option(optionValue, optionValue);
            dropdown.add(option);
        });
    });
}
