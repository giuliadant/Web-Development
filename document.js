document.getElementById("closePopup").addEventListener("click", function() //popup closes when Start Training button is pressed
{document.getElementById("Popup").style.display="none"});


//declaring variables
const trainButton = document.getElementById("Clicker");
const skillDisplay = document.getElementById("Counter");

let points =  0

//skill points display
skillDisplay.innertext = "Skill Points:  " + points;

trainButton.addEventListener("click", function()
{points++;skillDisplay.innerText = "Skill Points: " + points;
})





