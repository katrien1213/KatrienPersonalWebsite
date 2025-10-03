    var title= document.querySelector("h1");
    title.innerHTML="This is the title from code.js";

    //fetch the button from the DOM
    var button= document.querySelector("button")

    //attch and event when user clicks it 
    button.addEventListener("click", myfunction);

    //create the function that will be called when the button is pressed 
    function myfunction()
    {
        //this shows a popup window
        alert("let me tell you more about me");
        
    }