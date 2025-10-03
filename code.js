var title = document.querySelector("h1");
title.innerHTML = "This is the title from code.js";

// fetch the button from the DOM
var button = document.querySelector("#CV");

// attach an event when user clicks it 
button.addEventListener("click", myfunction);

 
function myfunction() {
    
    alert("let me tell you more about me");
}


var mynode = document.createElement("div");
mynode.id = "work1_intro";
mynode.innerHTML = "The work is an exhibition";
mynode.style.color = "blue";

mynode.addEventListener("click", welcomeToWork1);
document.querySelector("#my_work1").appendChild(mynode);





function welcomeToWork1() {
   mynode.innerHTML="Thank you for your interest in my work!"
}
