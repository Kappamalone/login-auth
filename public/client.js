function login(){
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

function signUp(){
    let email = document.getElementById('loginEmail').value;
    let pass = document.getElementById('loginPass').value;
    console.log(email,pass)
    
    //send email and pass to server for verification
    fetch('/signUp', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({email: email, pass: pass})
    })
}