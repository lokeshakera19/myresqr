// Script to handle multi-step form navigation
function nextStep(currentStep) {
    document.getElementById(`step${currentStep}`).style.display = 'none';
    document.getElementById(`step${currentStep + 1}`).style.display = 'block';
}

function generateQRCode() {
    const username = document.getElementById('username').value;

    fetch('/generateQRCode', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username })
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('qrCodeImage').src = data.qrCodeDataUrl;
        document.getElementById('qrCodeContainer').style.display = 'block'; // Show QR code container
    })
    .catch(error => {
        console.error('Error:', error);
    });
}
async function generateQRCode() {
        try {
            const response = await fetch('/submitForm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    // Include required form data, for example:
                    username: document.getElementById('username').value,
                    passkey: document.getElementById('passkey').value,
                    // Additional fields as necessary
                })
            });
            const result = await response.json();
            if (result.success) {
                document.getElementById('qrCodeContainer').innerHTML = `<img src="${result.qrCodePath}" alt="QR Code">`;
            } else {
                alert("QR Code generation failed.");
            }
        } catch (error) {
            console.error('Error generating QR Code:', error);
        }
    }
    
// Function to preview image before upload
function previewImage(event) {
    const reader = new FileReader();
    reader.onload = function () {
        const output = document.getElementById('profile-image');
        output.src = reader.result;
    };
    reader.readAsDataURL(event.target.files[0]);
}
