value_arr = [10,50,100,200,500,1000]
button_val = [-1,-1,-1,-1,-1,-1,-1,-1,-1];
active_button=0;


//const Option_button = document.querySelector(".Option_button");
const p1 = document.getElementById("p1");
p1.addEventListener('click', option_Button);
p1.myParam = "p1";
const p2 = document.getElementById("p2");
p2.addEventListener('click', option_Button);
p2.myParam = "p2";
const p3 = document.getElementById("p3");
p3.addEventListener('click', option_Button);
p3.myParam = "p3";
const p4 = document.getElementById("p4");
p4.addEventListener('click', option_Button);
p4.myParam = "p4";
//console.log(document.getElementById("p1"));
function option_Button(button_param){
    button_id = button_param.currentTarget.myParam;
    Option_id = document.getElementById(button_id);
    idx = parseInt(Option_id.id.charAt(1));
    idx-=1;
    console.log("p"+idx+" is selected");
    button_val[idx] = (button_val[idx]+1)%(value_arr.length)
    console.log(value_arr[button_val[idx]]);
    active_button++;
}
// console.log(Option_button);
// Option_id = document.getElementById(Option_button.id);
// Option_id.addEventListener('click', event=>{
//     idx = parseInt(Option_button.id.charAt(1));
//     idx-=1;
//     console.log("p"+idx+" is selected");
//     button_val[idx] = (button_val[idx]+1)%(value_arr.length)
//     console.log(value_arr[button_val[idx]]);
//     active_button++;
// })