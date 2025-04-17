document.getElementById("closePopup").addEventListener("click", function() //popup closes when Start Training button is pressed
{document.getElementById("Popup").style.display="none"});


//declaring variables
const Button = document.getElementById("Clicker");
const Counter = document.getElementById("Counter");

let points =  0
//skill points display

Button.addEventListener("click", function() {
    points++;
    Counter.innerText = "Battle Points : " + points;
})







