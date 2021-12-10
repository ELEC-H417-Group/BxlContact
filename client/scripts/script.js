
    serverUrl = 'ws://localhost:9876/server'
    const websocket = new WebSocket(serverUrl)

    //Global variable
    var mainUser = {
        userId: "",
        userName: ""
    }
    
    const userName = document.getElementById('username')
    const password = document.getElementById('password')
    const button = document.getElementById('signin')
    
    button.addEventListener('click',signIn,false)
    
    //on websocket open
    websocket.onopen = function(event) {
       
    }; 

    //on message receive
    websocket.onmessage = function(event) {
        try{
            var data = JSON.parse(event.data)
            switch (data.type){
                case 'signin':
                  if(data.resp == 'true'){
                        mainUser.userId = data.userId
                        mainUser.userName = data.userName
                        localStorage.setItem('mainUser',mainUser)
                        window.location.href = 'chatroom.html'
                    }
                    break
                case 'signout':
                default:
                    console.log(`Wrong expression`)
         }
        }
        catch(error){
            console.log(error)
        }
        
    } 

    //on websocket close
    websocket.onclose = function(event) {
    };

    //on websocket error
    websocket.onerror = function(event) {
    };
    
    function signIn(){
        cred = {
            type: 'signin',
            username: userName.value,
            password: password.value
        }
        websocket.send(JSON.stringify(cred))
    }

  //exports.mainUser = mainUser
    