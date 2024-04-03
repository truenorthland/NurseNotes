// This script manages the dynamic functionality of the Nurse Notes application.

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
    // Dropdown management for nurse names
    document.getElementById('addNurseName').addEventListener('click', function() { addOption('nurseNameDropdown', 'nurseNameInput'); });
    document.getElementById('removeNurseName').addEventListener('click', function() { removeOption('nurseNameDropdown'); });

    // Dropdown management for patient names
    document.getElementById('addPatientName').addEventListener('click', function() { addOption('patientNameDropdown', 'patientNameInput'); });
    document.getElementById('removePatientName').addEventListener('click', function() { removeOption('patientNameDropdown'); });

    // Dropdown management for activities
    document.getElementById('addActivity').addEventListener('click', function() { addOption('activityDropdown', 'activityInput'); });
    document.getElementById('removeActivity').addEventListener('click', function() { removeOption('activityDropdown'); });

    // Dropdown management for observations
    document.getElementById('addObservation').addEventListener('click', function() { addOption('observationDropdown', 'observationInput'); });
    document.getElementById('removeObservation').addEventListener('click', function() { removeOption('observationDropdown'); });

    // Form submission handling for saving notes
    document.getElementById('notesForm').addEventListener('submit', handleFormSubmit);

    // Button actions for resetting form and clearing data
    document.getElementById('resetForm').addEventListener('click', resetFormAndClearData);
    document.getElementById('clearNotes').addEventListener('click', clearSavedNotes);

    // Button action for exporting notes as a text file
    document.getElementById('exportNotes').addEventListener('click', exportNotes);

    // New feature: Button actions for exporting and importing dropdown data
    document.getElementById('exportDropdownData').addEventListener('click', exportDropdownData);
    document.getElementById('importDropdownData').addEventListener('change', importDropdownData);
}

// Function to add a new option to a dropdown.
function addOption(dropdownId, inputId) {
    const dropdown = document.getElementById(dropdownId);
    const input = document.getElementById(inputId);
    const optionValue = input.value.trim();
    // Only add the option if it is not already present and it is not empty.
    if (optionValue && ![...dropdown.options].map(option => option.value).includes(optionValue)) {
        // Create a new option element and add it to the dropdown.
        const newOption = new Option(optionValue, optionValue);
        dropdown.add(newOption);
        // Clear the input field after adding the new option.
        input.value = '';
        // Save the updated dropdown state to localStorage.
        saveDropdownToLocalStorage(dropdownId);
    }
}

// Function to remove the selected option from a dropdown.
function removeOption(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    // Only proceed if an option is actually selected.
    if (dropdown.selectedIndex > -1) {
        // Remove the selected option from the dropdown.
        dropdown.remove(dropdown.selectedIndex);
        // Update the localStorage to reflect the change.
        saveDropdownToLocalStorage(dropdownId);
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
    // Create a new div element to contain the note.
    const noteElement = document.createElement('div');
    // Assign a class for styling.
    noteElement.className = "note";
    // Populate the div with the note content.
    noteElement.textContent = formatNoteContent(note);
    // Add the note element to the page.
    notesOutput.appendChild(noteElement);
}

// Format the content of a note for display.
function formatNoteContent(note) {
    return `${note.date} ${note.time} - Nurse: ${note.nurseName} (${note.nurseDetails}), Patient: ${note.patientName} (${note.patientDetails}), Activity: ${note.activity} (${note.activityDetails}), Observation: ${note.observation} (${note.observationDetails}), Additional Notes: ${note.additionalNotes}`;
}

// Save a new note to localStorage.
function saveNoteToLocalStorage(note) {
    // Retrieve the existing notes from localStorage or initialize an empty array if none exist.
    const notes = JSON.parse(localStorage.getItem('nurseNotes') || '[]');
    // Add the new note to the array.
    notes.push(note);
    // Save the updated notes array back to localStorage.
    localStorage.setItem('nurseNotes', JSON.stringify(notes));
}

// Load saved dropdown options from localStorage and repopulate the dropdowns.
function loadDropdownsFromLocalStorage() {
    // Define an array of dropdown element IDs.
    const dropdownIds = ['nurseNameDropdown', 'patientNameDropdown', 'activityDropdown', 'observationDropdown'];
    // Iterate through the array, loading saved options for each dropdown.
    dropdownIds.forEach(dropdownId => {
        // Retrieve the saved options for the dropdown from localStorage.
        const savedOptions = JSON.parse(localStorage.getItem(dropdownId) || '[]');
        const dropdown = document.getElementById(dropdownId);
        // Clear existing options.
        dropdown.innerHTML = '';
        // Add the saved options back to the dropdown.
        savedOptions.forEach(optionValue => {
            const option = new Option(optionValue, optionValue);
            dropdown.add(option);
        });
    });
}

// Load saved notes from localStorage and display them.
function loadNotesFromLocalStorage() {
    // Retrieve saved notes from localStorage.
    const notes = JSON.parse(localStorage.getItem('nurseNotes') || '[]');
    // Iterate through the saved notes and display each one.
    notes.forEach(displayNote);
}

// Export the displayed notes as a text file.
function exportNotes() {
    // Retrieve saved notes from localStorage.
    const notes = JSON.parse(localStorage.getItem('nurseNotes') || '[]');
    // Convert the notes to a string, with each note on a new line.
    const notesText = notes.map(note => formatNoteContent(note)).join('\n');
    // Create a Blob with the notes text.
    const blob = new Blob([notesText], {type: 'text/plain'});
    // Generate a URL for the Blob.
    const url = URL.createObjectURL(blob);
    // Create a temporary anchor element and trigger the download.
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = 'nurse_notes.txt';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    // Clean up by removing the temporary anchor element.
    document.body.removeChild(downloadLink);
}

// Export dropdown data as a text file.
function exportDropdownData() {
    // Collect data for all dropdowns to export.
    const dataToExport = collectAllDropdownData();
    // Convert the data to a string.
    const dataStr = JSON.stringify(dataToExport);
    // Proceed with the export process as with exporting notes.
}

// Collect data from all dropdowns to export.
function collectAllDropdownData() {
    const data = {};
    const dropdownIds = ['nurseNameDropdown', 'patientNameDropdown', 'activityDropdown', 'observationDropdown'];
    dropdownIds.forEach(dropdownId => {
        data[dropdownId] = JSON.parse(localStorage.getItem(dropdownId) || '[]');
    });
    return data;
}

// Import dropdown data from a file selected by the user.
function importDropdownData(event) {
    // Retrieve the file from the file input event.
    const file = event.target.files[0];
    if (!file) {
        return; // If no file is selected, do nothing.
    }
    // Use FileReader to read the file's contents.
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            // Parse the file contents as JSON.
            const data = JSON.parse(e.target.result);
            // Update localStorage with the imported data.
            updateLocalStorageWithImportedData(data);
            // Update the dropdowns to reflect the new data.
            loadDropdownsFromLocalStorage();
        } catch (error) {
            // If there's an error, log it and alert the user.
            console.error('Error reading imported file:', error);
            alert('There was an error importing the file. Please check the file format.');
        }
    };
    reader.readAsText(file); // Start reading the file as text.
}

// Update localStorage with imported dropdown data.
function updateLocalStorageWithImportedData(data) {
    Object.keys(data).forEach(key => {
        localStorage.setItem(key, JSON.stringify(data[key]));
    });
}

// Reset the form and clear all saved data in localStorage and on the page.
function resetFormAndClearData() {
    if (confirm('Are you sure you want to reset the form and clear all data?')) {
        // Clear all localStorage data.
        localStorage.clear();
        // Reset the form fields to their default values.
        document.getElementById('notesForm').reset();
        // Clear the notes display area.
        document.getElementById('notesOutput').innerHTML = '';
        // Reinitialize the dropdowns (now empty because localStorage is cleared).
        loadDropdownsFromLocalStorage();
    }
}

// Clear saved notes from localStorage and the page.
function clearSavedNotes() {
    if (confirm('Are you sure you want to clear all saved notes?')) {
        // Remove just the notes data from localStorage.
        localStorage.removeItem('nurseNotes');
        // Clear the notes display area.
        document.getElementById('notesOutput').innerHTML = '';
    }
}
