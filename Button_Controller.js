value_arr = [10,50,100,200,500,1000];
button_val = [-1,-1,-1,-1,-1,-1,-1,-1,-1];
active_button=0;
button_div = ["d1","d2","d3","d4","d5","d6","d7","d8","d9"];
points = [0,0,0,0,0,0,0,0,0]


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

const p5 = document.getElementById("p5");
p5.addEventListener('click', option_Button);
p5.myParam = "p5";

const p6 = document.getElementById("p6");
p6.addEventListener('click', option_Button);
p6.myParam = "p6";

const p7 = document.getElementById("p7");
p7.addEventListener('click', option_Button);
p7.myParam = "p7";

const p8 = document.getElementById("p8");
p8.addEventListener('click', option_Button);
p8.myParam = "p8";

const p9 = document.getElementById("p9");
p9.addEventListener('click', option_Button);
p9.myParam = "p9";

const x1 = document.getElementById("x1");
x1.addEventListener('click', delete_Button);
x1.myParam = "x1";

const x2 = document.getElementById("x2");
x2.addEventListener('click', delete_Button);
x2.myParam = "x2";

const x3 = document.getElementById("x3");
x3.addEventListener('click', delete_Button);
x3.myParam = "x3";

const x4 = document.getElementById("x4");
x4.addEventListener('click', delete_Button);
x4.myParam = "x4";

const x5 = document.getElementById("x5");
x5.addEventListener('click', delete_Button);
x5.myParam = "x5";

const x6 = document.getElementById("x6");
x6.addEventListener('click', delete_Button);
x6.myParam = "x6";

const x7 = document.getElementById("x7");
x7.addEventListener('click', delete_Button);
x7.myParam = "x7";

const x8 = document.getElementById("x8");
x8.addEventListener('click', delete_Button);
x8.myParam = "x8";

const x9 = document.getElementById("x9");
x9.addEventListener('click', delete_Button);
x9.myParam = "x9";


function option_Button(button_param){

    button_id = button_param.currentTarget.myParam;
    Option_id = document.getElementById(button_id);
    idx = parseInt(Option_id.id.charAt(1));
    idx-=1;
    
    active_button++;
        
    console.log("p"+idx+" is selected");
    button_val[idx] = (button_val[idx]+1)%(value_arr.length)
    points[idx]=value_arr[button_val[idx]];
    console.log(points);
    
    displayLabel(idx, value_arr[button_val[idx]]);
}

function displayLabel(idx, val){
    const lb_div = document.getElementById(button_div[idx]);
    const lb = document.createElement("div");
    lb.setAttribute('class',"Label_div");

    lb.setAttribute('id',button_div[idx]);
    lb_div.innerHTML=``;
    lb.innerHTML=`<label id="${"l"+button_div[idx]}">${val}</label>`;
    lb_div.appendChild(lb);
}

function delete_Button(button_param){
    button_id = button_param.currentTarget.myParam;
    Option_id = document.getElementById(button_id);
    idx = parseInt(Option_id.id.charAt(1));
    idx-=1;
    const lb_div = document.getElementById(button_div[idx]);
    lb_div.innerHTML=``;
    points[idx]=0;
}
