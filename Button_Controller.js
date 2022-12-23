value_arr = [10,50,100,200,500,1000]
button_val =-1;
active_button=0;


const Option_button = document.querySelector(".Option_button");
console.log(Option_button);
Option_id = document.getElementById(Option_button.id);
Option_id.addEventListener('click', event=>{
    console.log("p1 is selected");
    val_p1 = (val_p1+1)%(value_arr.length)
    console.log(value_arr[val_p1]);
    active_button++;
})