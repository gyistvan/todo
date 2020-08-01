

let serverUrl = "http://localhost:3000/";
let message = document.querySelector("#message");
let loginKeys = ["id", "username", "password", "email"]
let loginform = document.querySelector("#loginform");
let logOutBtn = document.querySelector("#logOutBtn");
let regBtn = document.querySelector("#regbtn");
let regBtnNew = document.querySelector("#regbtn2");
let isLogged =  localStorage.getItem("loggedin");
let mainCol = document.querySelector("#maincol");
let userId;let name;let pass;let usernameIcon; let availableName;let regdata = {};
let btnid = 0;


let myFetch = {
    "READ" : function(url, callFunction, cid) {
                let fetchOptions = {
                    method: "GET",
                    mode: "cors",
                    cache: "no-cache"
                }

                fetch(url, fetchOptions).then(
                    response => response.json(),
                    err => console.error(err)
                ).then(
                    data => callFunction(data, cid))

    },
    "WRITE" : function(data, url, callFunction){
            let fetchOptions = {
                method: "POST",
                mode: "cors",
                cache: "no-cache",
                headers: {
                    "content-type" : "application/json"
                },
                body: JSON.stringify(data)
            }

            fetch(url, fetchOptions).then(
                resp => resp.json(),
                err => consolse.error(err)
            ).then(
                callFunction(data)
            )
    },
    "DEL" : function (url, callFunction){
        let fetchOptions = {
            method: "DELETE",
            mode: "cors",
            cache: "no-cache"
        }
            fetch(url, fetchOptions).then(
                resp => resp.json(),
                err => console.error(err)
            ).then(
                data => callFunction(data)
            )
    },
    "OVERWRITE": function (data, url, callFunction){
        let fetchOptions = {
            method: "PUT",
            mode: "cors",
            cache: "no-cache",
            headers: {
                "content-type":"application/json"
            },
            body: JSON.stringify(data)
        }
        console.log(url+data.id);
        fetch(url+data.id, fetchOptions).then(
            resp => resp.json(),
            err => console.error(err)
        ).then(
            data => callFunction(data)
        )
    }

};

document.querySelector("#logOutBtn").addEventListener("click", logOut);
document.querySelector("#logInBtn").addEventListener("click", checkUsers);
document.querySelector("#reglink").addEventListener("click", makeRegForm);
document.querySelector("#username").addEventListener("keyup", checkUserNames());
regBtnNew.addEventListener("click", tryToReg);
window.addEventListener("load", isLoggedin());

function isLoggedin(){
    isLogged = localStorage.getItem("loggedin");
    if (isLogged=="false"){
        loginform.style.display = "block";
        logOutBtn.style.display = 'none';
        
    }
    else if (isLogged=="true") {
        loginform.style.display = 'none';
        logOutBtn.style.display = 'block';
        readLists();
    }  
}
function makeRegForm(){
   loginBtn = document.querySelector("#logInBtn");
   reglink = document.querySelector("#reglink");
   reglink.style.display = "none";
   loginBtn.style.display = "none";
   regBtnNew.style.display = "block";
}
function giveBack(data){
    return data;
}
function checkUserNames(data){
    name = document.querySelector("#username");
    usernameIcon = document.querySelector("#usernameIcon");
    for (row of data){
        if (row["username"] == name.value){
            usernameIcon.innerHTML = '<i class="fa fa-times" aria-hidden="true"></i>';
            regBtnNew.disabled = "true";
            regBtnNew.style.background = "#5f5f5f"
            break;
        }
        else {
            usernameIcon.innerHTML = '<i class="fa fa-check-circle" aria-hidden="true"></i>';
            return availableName = true;
        }
    }
}
function tryToReg(){
    name = document.querySelector("#username");
    pass = document.querySelector("#password");
    myFetch.READ(serverUrl+"users", checkUserNames);
    if (availableName){
        regdata = {"username" : `${name.value}`, "password" : `${pass.value}`}
        myFetch.WRITE(regdata,serverUrl+"users");
    }
    
}

function checkUsers(){
    myFetch.READ(serverUrl+"users", searchUser);
    /*let fetchOptions = {
        method: "GET",
        mode: "cors",
        cache: "no-cache"
    }

    fetch(serverUrl+"users", fetchOptions).then(
        response => response.json(),
        err => console.error(err)
    ).then(
        data => searchUser(data)
    );*/
} 

function searchUser(data){
    userName = document.querySelector("#username").value;
    passWord = document.querySelector("#password").value;
    for (let row of data){
        if (row["username"] == userName){
            if (row["password"] == passWord){
                message.innerHTML = "Sikeres bejelentkezés";
                message.removeAttribute("class", "alert-danger");
                message.setAttribute("class", "alert alert-success");
                localStorage.setItem("username",row["username"]);
                localStorage.setItem("loggedin", true);
                localStorage.setItem("userid", row["id"]);
                isLoggedin();
                break;
            }
            else {
                message.style.display = "block";
                message.removeAttribute("class", "alert-success");
                message.setAttribute("class", "alert alert-danger");
                message.innerHTML = "Hibás jelszó";
            }
            break;
        }
        else {
            message.style.display = "block";
            message.removeAttribute("class", "alert-success");
            message.setAttribute("class", "alert alert-danger")
            message.innerHTML = "Nincs ilyen felhasználó";            
        }
    }
}

function logOut(){
    localStorage.removeItem("username");
    localStorage.removeItem("loggedin");
    localStorage.setItem("loggedin", false);
    clearMain();
}

function clearMain(){
    mainCol.innerHTML="";
    isLoggedin();
}

function readLists(){
    userid = localStorage.getItem("userid");
    myFetch.READ("http://localhost:3000/lists", displayLists)
    mainCol.innerHTML = "asdf" + userid;
}

function displayLists(data){
    let i = 0;
    createElem("table", "#maincol", "", {class: "table", id:"maintable"})
    for (let row of data){
        if (row["userid"] == userid){
            if (i==0){
                createElem("tr","#maintable");
                createElem("th","tr", "Listáim:");
                i++;       
            }
            hiddenInfo = "<input type='hidden' value='"+row["id"]+"' name='id'><input type='hidden' value='"+row["id"]+"' name='listid'>";
            createElem("tr", "#maintable");
            createElem("td", "tr:last-child", row["body"], {id:"lista"+row["id"]});
            createElem("td", "tr:last-child", hiddenInfo, {id: "td"+row["id"]});
            createElem("button", "#td"+row["id"], "Új listaelem", {class: "btn btn-success", onclick: "newListNode(this)"})
            createElem("table", "td#lista"+row["id"], "",  {id:"sub-table"+row["id"]} );
            myFetch.READ("http://localhost:3000/list-comments/", displayListNodes, row["id"]);
        }
    }
}

function displayListNodes(data, cid){
    console.log(data);
    console.log(cid);
    
    for (let row of data){
        if (row["listid"] == cid){
            hidden = "<input value='"+row["id"]+"' name='id' type='hidden'><input value='"+row["listid"]+"' name='listid' type='hidden'>";
            createElem("tr", "#sub-table"+cid);
            createElem("td", "#sub-table"+cid+" tr:last-child", "<input value='"+row["commentbody"]+"' name='commentbody' disabled=true>"+hidden);
            createElem("td", "#sub-table"+cid+" tr:last-child");
            createElem("div","#sub-table"+cid+" tr:last-child td:last-child", "", {class: "btn btn-group", id: "btn-grp"+btnid});
            createElem("button", "#btn-grp"+btnid, "szerkesztés", {class:"btn btn-primary", onclick: "oWrite(this)"});
            createElem("button", "#btn-grp"+btnid, "törlés", {class: "btn btn-danger", onclick: "delNode(this)"});         
            btnid++;
        }
    }
}

function createElem(el, parent, content, attr){
    newelement = document.createElement(el);
    
    if (content) {  newelement.innerHTML = content;   }

    if (attr){
        for (k in attr){
             newelement.setAttribute(k, attr[k])
        }
    }

    parentEl = document.querySelector(parent);
    parentEl.appendChild(newelement);

}

function delNode(el){
    parentRow = el.parentElement.parentElement.parentElement;
    delId = parentRow.querySelector("td:first-child input[type='hidden'").value;
    console.log(delId);
    myFetch.DEL("http://localhost:3000/list-comments/"+delId, readLists)
}

function oWrite(el){
    parentRow = el.parentElement.parentElement.parentElement;
    edit = parentRow.querySelector("td:first-child input");
    edit.removeAttribute("disabled");
    buttondiv = el.parentElement;
    console.log(buttondiv);
    hidebuttons = buttondiv.querySelectorAll(".btn");
    hidebuttons[0].style.display = "none";
    hidebuttons[1].style.display = "none";
    createElem("button", "#"+buttondiv.id, "Mentés", {class:"btn btn-success", onclick:"writeItOver(this)"})
}

function writeItOver(el){
    parentRow = el.parentElement.parentElement.parentElement;
    getNewInfo = parentRow.querySelector("td:first-child input");
    let data = {};
    inputs = parentRow.querySelectorAll("input");
    for (let i=0; i<inputs.length; i++){
        data[inputs[i].name] = inputs[i].value;
    }


    getId = parentRow.querySelector("td:First-child input[type='hidden'");
    myFetch.OVERWRITE(data, "http://localhost:3000/list-comments/", readLists)
}

function newListNode(el){
    parent = el.parentElement;
    hiddenInfo = parent.querySelector("input[type='hidden']");
    createElem("input", "#td"+hiddenInfo.value, "", {type: "text", name: "commentbody"})
    parent.querySelector("button").style.display = "none";
    createElem("button", "#td"+hiddenInfo.value, "Mentés", {class: "btn btn-success", onclick: "addListNode(this)"});
    
}

function addListNode(el){
    parent = el.parentElement;
    console.log(parent)
    inputs = parent.querySelectorAll("input");
    data = {};
    for (let i = 0; i < inputs.length; i++){
        data[inputs[i].name] = inputs[i].value;
    }
    delete data.id;
    myFetch.WRITE(data, "http://localhost:3000/list-comments/", readLists)

}