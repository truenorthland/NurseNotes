// This script manages the dynamic functionality of the Nurse Notes application.

// Wait for the DOM to fully load before initializing the application.
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initializes the application by setting up the initial state and event listeners.
function initializeApp() {
    autofillDateTime(); // Automatically fills the date and time fields with the current date and time.
    attachEventListeners(); // Sets up event listeners for all interactive elements in the app.
    loadDropdownsFromLocalStorage(); // Loads saved dropdown values from localStorage to populate the dropdowns.
    loadNotesFromLocalStorage(); // Loads saved notes from localStorage to display them on the page.
}

// Autofills the date and time fields with the current date and time.
function autofillDateTime() {
    const now = new Date();
    document.getElementById('noteDate').value = now.toISOString().split('T')[0];
    document.getElementById('noteTime').value = now.toTimeString().split(' ')[0].substring(0, 8);
}

// Sets up event listeners for the application's interactive elements.
function attachEventListeners() {
    // Event listeners for adding and removing options from dropdowns.
    document.getElementById('addNurseName').addEventListener('click', function() { addOption('nurseNameDropdown', 'nurseNameInput'); });
    document.getElementById('removeNurseName').addEventListener('click', function() { removeOption('nurseNameDropdown'); });
    document.getElementById('addPatientName').addEventListener('click', function() { addOption('patientNameDropdown', 'patientNameInput'); });
    document.getElementById('removePatientName').addEventListener('click', function() { removeOption('patientNameDropdown'); });
    document.getElementById('addActivity').addEventListener('click', function() { addOption('activityDropdown', 'activityInput'); });
    document.getElementById('removeActivity').addEventListener('click', function() { removeOption('activityDropdown'); });
    document.getElementById('addObservation').addEventListener('click', function() { addOption('observationDropdown', 'observationInput'); });
    document.getElementById('removeObservation').addEventListener('click', function() { removeOption('observationDropdown'); });
    
    // Event listener for the form submission to save a new note.
    document.getElementById('notesForm').addEventListener('submit', handleFormSubmit);
    
    // Event listeners for the buttons to reset the form, clear saved notes, and export notes.
    document.getElementById('exportNotes').addEventListener('click', exportNotes);
    document.getElementById('resetForm').addEventListener('click', resetFormAndClearData);
    document.getElementById('clearNotes').addEventListener('click', clearSavedNotes);
    
    // New event listeners for exporting and importing dropdown data.
    document.getElementById('exportDropdownData').addEventListener('click', exportDropdownData);
    document.getElementById('importDropdownData').addEventListener('change', importDropdownData);
}

// Adds a new option to a dropdown and saves the updated dropdown to localStorage.
function addOption(dropdownId, inputId) {
    const dropdown = document.getElementById(dropdownId);
    const input = document.getElementById(inputId);
    const optionValue = input.value.trim();
    if (optionValue && ![...dropdown.options].map(option => option.value).includes(optionValue)) {
        const newOption = new Option(optionValue, optionValue);
        dropdown.add(newOption);
        input.value = ''; // Clears the input field after adding the option.
        saveDropdownToLocalStorage(dropdownId); // Saves the updated dropdown to localStorage.
    }
}

// Removes the selected option from a dropdown and updates localStorage.
function removeOption(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    if (dropdown.selectedIndex > -1) {
        dropdown.remove(dropdown.selectedIndex);
        saveDropdownToLocalStorage(dropdownId); // Updates localStorage after removing the option.
    }
}

// Handles the form submission, saves the new note, and updates the display.
function handleFormSubmit(event) {
    event.preventDefault(); // Prevents the default form submission action.
    const note = collectFormData(); // Collects data from the form fields.
    displayNote(note); // Displays the collected note on the page.
    saveNoteToLocalStorage(note); // Saves the new note to localStorage.
    event.target.reset(); // Resets the form fields after saving the note.
    autofillDateTime(); // Re-autofills the date and time.
}

// Collects data from the form inputs and dropdowns into an object.
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

// Displays a saved note in the notes output section.
function displayNote(note) {
    const notesOutput = document.getElementById('notesOutput');
    const noteElement = document.createElement('div');
    noteElement.className = "note";
    noteElement.textContent = `${note.date} ${note.time} - Nurse: ${note.nurseName} (${note.nurseDetails}), Patient: ${note.patientName} (${note.patientDetails}), Activity: ${note.activity} (${note.activityDetails}), Observation: ${note.observation} (${note.observationDetails}), Additional Notes: ${note.additionalNotes}`;
    notesOutput.appendChild(noteElement);
}

// Saves a new note to localStorage.
function saveNoteToLocalStorage(note) {
    const notes = JSON.parse(localStorage.getItem('nurseNotes') || '[]');
    notes.push(note);
    localStorage.setItem('nurseNotes', JSON.stringify(notes));
}
// Saves the current state of a dropdown to localStorage.
function saveDropdownToLocalStorage(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    const options = Array.from(dropdown.options).map(option => option.value);
    localStorage.setItem(dropdownId, JSON.stringify(options));
}

// Load saved dropdown options from localStorage and repopulate the dropdowns.
function loadDropdownsFromLocalStorage() {
    const dropdownIds = ['nurseNameDropdown', 'patientNameDropdown', 'activityDropdown', 'observationDropdown'];
    dropdownIds.forEach(dropdownId => {
        const savedOptions = JSON.parse(localStorage.getItem(dropdownId) || '[]');
        const dropdown = document.getElementById(dropdownId);
        dropdown.innerHTML = ''; // Clears existing options before repopulating.
        savedOptions.forEach(optionValue => {
            const option = new Option(optionValue, optionValue);
            dropdown.add(option);
        });
    });
}

// Function to export dropdown data to a downloadable text file.
function exportDropdownData() {
    const dataToExport = {};
    // Specify the dropdowns to export.
    const dropdownIds = ['nurseNameDropdown', 'patientNameDropdown', 'activityDropdown', 'observationDropdown'];
    // For each dropdown, retrieve its data from localStorage and add it to the export object.
    dropdownIds.forEach(dropdownId => {
        dataToExport[dropdownId] = JSON.parse(localStorage.getItem(dropdownId) || '[]');
    });
    // Convert the data object to a string for export.
    const dataStr = JSON.stringify(dataToExport);
    // Create a blob with the data string.
    const blob = new Blob([dataStr], {type: 'text/plain'});
    // Create a URL for the blob.
    const url = URL.createObjectURL(blob);
    // Create a temporary anchor element and trigger the download.
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = 'dropdown_data.txt';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

// Function to import dropdown data from a selected text file.
function importDropdownData(event) {
    const file = event.target.files[0]; // Get the selected file from the file input.
    if (!file) {
        return;
    }
    const reader = new FileReader();
    // When the file is read successfully, parse its content and update localStorage.
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            Object.keys(importedData).forEach(dropdownId => {
                localStorage.setItem(dropdownId, JSON.stringify(importedData[dropdownId]));
            });
            loadDropdownsFromLocalStorage(); // Reload dropdowns with imported data.
        } catch (error) {
            console.error('Error parsing imported file:', error);
            alert('Failed to import data. Please ensure the file is correctly formatted.');
        }
    };
    reader.readAsText(file); // Read the content of the file.
}

// Function to clear saved notes from both the display and localStorage.
function clearSavedNotes() {
    if (confirm('Are you sure you want to clear all saved notes?')) {
        localStorage.removeItem('nurseNotes');
        document.getElementById('notesOutput').innerHTML = '';
    }
}

// Function to reset the form and clear all data, including dropdown selections and notes.
function resetFormAndClearData() {
    if (confirm('Are you sure you want to reset the form and clear all stored data?')) {
        localStorage.clear(); // Clear all data stored in localStorage.
        document.getElementById('notesForm').reset(); // Reset the form fields.
        document.getElementById('notesOutput').innerHTML = ''; // Clear the notes display.
        loadDropdownsFromLocalStorage(); // Reinitialize dropdowns (will be empty due to localStorage clear).
    }
}

// Function to export entered notes as a text file.
function exportNotes() {
    const notes = JSON.parse(localStorage.getItem('nurseNotes') || '[]');
    const notesText = notes.map(note => {
        return `${note.date} ${note.time} - Nurse: ${note.nurseName} (${note.nurseDetails}), Patient: ${note.patientName} (${note.patientDetails}), Activity: ${note.activity} (${note.activityDetails}), Observation: ${note.observation} (${note.observationDetails}), Additional Notes: ${note.additionalNotes}`;
    }).join('\n');
    const blob = new Blob([notesText], {type: 'text/plain'});
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = 'nurse_notes.txt';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}
