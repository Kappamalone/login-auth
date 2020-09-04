function sendLogin(){
    let email = document.getElementById('loginEmail').value;
    let pass = document.getElementById('loginPass').value;
    console.log(email,pass)
    
    //send email and pass to server for verification
    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({email: email, pass: pass})
    })
}