value_arr = [10,50,100,200,500,1000];
button_val = [-1,-1,-1,-1,-1,-1,-1,-1,-1];
active_button=0;
button_div = ["d1","d2","d3","d4","d5","d6","d7","d8","d9"];
points = [0,0,0,0,0,0,0,0,0];

let res1=[];
let res2=[];
let queue = [];
let spincount=30;


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

// event listener for delete button

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
        
    //console.log("p"+idx+" is selected");
    button_val[idx] = (button_val[idx]+1)%(value_arr.length)
    points[idx]=value_arr[button_val[idx]];
    //console.log(points);
    
    displayLabel(idx, value_arr[button_val[idx]]);
}

function displayLabel(idx, val){
    const lb_div = document.getElementById(button_div[idx]);
    const lb = document.createElement("div");
    lb.setAttribute('class',"Label_div");

    lb.setAttribute('id',button_div[idx]+"i");
    lb_div.innerHTML=``;
    lb.innerHTML=`<div id="${"l"+button_div[idx]}" class="labelelement">${val}</div>`;
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
    button_val[idx]=-1;
}

let clientID=null;
let ws = new WebSocket("ws://localhost:9999");
ws.onopen = () => ws.send(JSON.stringify("Hello server"));
ws.onclose = () => ws.send(JSON.stringify({"clientID" : clientID}));
ws.onmessage = message => {                             //wiring of the event with server. so when server send
  const response = JSON.parse(message.data);          // some message this message function will be called
  //const response = message.data8;
  const countdown = document.getElementById("count");
  console.log(response);
                
  if(response.method == "connect"){
    clientId = response.clientId;
    console.log("This is your clientId "+clientId);
  }

  if(response.method == "newticket"){
    printTicket(response);
    console.log("received ticket! ")
  }

  if(response.method == "countdown"){
    countdown.innerHTML = response.count;
  }

  if(response.method == "result"){      //spin the slots
    res1 = response.res1;
    res2 = response.res2;
    spincount = response.spin;
    console.log(spincount);
    init();
    spin();
    //setInterval(1000*60,init());
  }
  if(response.method == "init"){
    console.log("In init");
    clientID = response.clientID;
    init();
  }
  if(response.method == "displayQueue"){
    queue = response.Queue;
    console.log(queue);
    renderQueue(queue);
  }

  if(response.method == "AccessDenied"){
    alert("Can not add");
  }
}

// function RequestQueuePayload(){
//   const payload = {
//     "method" : "request_queue_payload"
//   }
//   ws.send(JSON.stringify(payload));
// }

function renderQueue(queue){
  let i = queue.length;
    for(q of queue){
      console.log(queue);
      let timediv = document.getElementById("tq"+i);
      let tmpdiv = document.getElementById("q"+i);
      let digdiv = document.getElementById("dq"+i);
      let rewdiv = document.getElementById("rq"+i);
      tmpdiv.innerHTML = items[q.firstTile];
      digdiv.innerHTML = q.firstTile+1;
      rewdiv.innerHTML = "X"+(q.secondTile+1);
      timediv.innerHTML = q.timestamp;
      //console.log(q.firstTile+1);
      //digdiv.innerHTML = 'Hello';
      i--;
    }
}

// adding ticket to the server
const ba1 = document.getElementById("ba1");   
ba1.addEventListener("click", e=>{
  const payload ={ 
    "method" : "AddData",
    "dataArr": points,
    "clientID": clientID
  }

  for(let i=0;i<9;i++){
    let lb_div = document.getElementById(button_div[i]);
    lb_div.innerHTML=``;
    button_val[i]=-1;
  }
  ws.send(JSON.stringify(payload));
  for(let i=0;i<9;i++){
    points[i]=0;
  }  
});

const ba2 = document.getElementById("ba2");   
ba2.addEventListener("click", e=>{
  window.location.replace("http://localhost:9998/report");
});




const items = [
    '🍉',
    '🍗',
    '🍭',
    '🍊',
    '⚔️',
    '🍹',
    '🍿',
    '🧨',
    '☀️',
  ];
  const doors = document.querySelectorAll('.door');
  
  //document.querySelector('#spinner').addEventListener('click', spin);
  //document.querySelector('#reseter').addEventListener('click', init);

  function init(firstInit = true, groups = 1, duration = 1) {
    let count=0;
    for (const door of doors) {
      if (firstInit) {
        door.dataset.spinned = '0';
      } else if (door.dataset.spinned === '1') {
        return;
      }

      const boxes = door.querySelector('.boxes');
      const boxesClone = boxes.cloneNode(false);
      const pool = ['❓'];

      if (!firstInit) {
        const arr = [];
        for (let n = 0; n < (groups > 0 ? groups : 1); n++) {
          arr.push(...items);
        }
        let tmp=[];
        if(count==0){                 //First tile
          for(let i=0;i<9*20;i++){
            tmp[i] = items[res1[i%9]];
          }
        }
        else if(count==1){          //Second tile
          for(let i=0;i<9*20;i++){
            tmp[i] = res1[i%9]+1;
          }
        }
        else{                       //Third tile
          for(let i=0;i<9*20;i++){
            tmp[i] = res2[i%3]+1;
          }
        }

        pool.push(...tmp);
        count++;
        boxesClone.addEventListener(
          'transitionstart',
          function () {
            door.dataset.spinned = '1';
            this.querySelectorAll('.box').forEach((box) => {
              box.style.filter = 'blur(1px)';
            });
          },
          { once: true }
        );

        boxesClone.addEventListener(
          'transitionend',
          function () {
            this.querySelectorAll('.box').forEach((box, index) => {
              box.style.filter = 'blur(0)';
              if (index > 0) this.removeChild(box);
            });
          },
          { once: true }
        );
      }

      for (let i = pool.length - 1; i >= 0; i--) {
        const box = document.createElement('div');
        box.classList.add('box');
        box.style.width = door.clientWidth + 'px';
        box.style.height = door.clientHeight + 'px';
        box.textContent = pool[i];
        boxesClone.appendChild(box);
      }
      boxesClone.style.transitionDuration = `${duration > 0 ? duration : 1}s`;
      boxesClone.style.transform = `translateY(-${door.clientHeight * (pool.length - 1)}px)`;
      door.replaceChild(boxesClone, boxes);
    }
    
  }

  async function spin() {
    init(false, 1, spincount)
    
    for (const door of doors) {
      const boxes = door.querySelector('.boxes');
      const duration = parseInt(boxes.style.transitionDuration);
      boxes.style.transform = 'translateY(0)';
      await new Promise((resolve) => setTimeout(resolve, duration * 100));
    }
    
  }

  function shuffle([...arr]) {
    let m = arr.length;
    while (m) {
      const i = Math.floor(Math.random() * m--);
      [arr[m], arr[i]] = [arr[i], arr[m]];
    }
    return arr;
  }

  //init();
//print command
  function printTicket(ticket) {
    //console.log(ticket.ticketID);
    let str = "ticketID"+" "+ticket.ticketID+"\n";
    for(var i=0;i<ticket.ticketdata.length;i++){
      if(ticket.ticketdata[i]!=null && ticket.ticketdata[i]!=0){
        str+= i+" : "+ticket.ticketdata[i]+"\n";
      }
    }

    try{
      fetch('http://127.0.0.1:5000/', {
          mode: 'no-cors',
          method: 'POST',
          headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
          },
          body: JSON.stringify({ "text": str })
          }).then(response => {console.log(response)}).then(data =>{console.log(data)});
  }
  catch(err){
      console.log(err);
  }

  //   fetch('http://192.168.1.9:7060/Print', {
  //   method: 'POST',
  //   headers: {
  //       'Accept': 'application/json',
  //       'Content-Type': 'application/json'
  //   },
  //   body: JSON.stringify(ticket)
  //   })
  //  .then(response => response.json())
  //  .then(response => console.log(JSON.stringify(response)))

    console.log(str);
   // var printWindow = window.open();
    // printWindow.document.open('text/plain')
    // printWindow.document.write(str);
    // printWindow.document.close();
    // printWindow.focus();
    // printWindow.print();
    //printWindow.close();
  }