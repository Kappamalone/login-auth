//used for little email warning
document.insertWarning;

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
        body: JSON.stringify({email: email, pass: pass}),
        redirect: 'follow'
    }).then(res => {
        //res.ok indicates if the login was successful, and if the refresh and 
        //access token have been issued
        if (res.redirected){
            //go to protected page
            console.log('should be a redirect')
            window.location.href = res.url;
        } else {
            alert('incorrect login')
        }
    })
    .catch(err => console.log(err));
}

function signUp(){
    let email = document.getElementById('loginEmail').value;
    let pass = document.getElementById('loginPass').value;
    
    //send email and pass to server for authentication :o
    if (email && pass){
        fetch('/signUp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({email: email, pass: pass}),
            redirect: 'follow'
        }).then((res) => {
            console.log(res)
            if (res.status == 400){
                //insert a small warning that email exists for the user
                if (!document.insertWarning){$('.insertWarning').append("<p class = 'text-center'>Email Exists</p>")}
                document.insertWarning = true
            } else if (res.redirected){
                document.location.href = res.url
            }
        }).catch(err => console.log(err))
    }
}