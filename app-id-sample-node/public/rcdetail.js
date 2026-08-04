const vehicleDatabase = {

    "RJ14AB1234":{
        owner:"Ashutosh Singh",
        vehicle:"Hyundai Creta",
        color:"White",
        fuel:"Petrol",
        registration:"15-Jan-2023",
        insurance:"Valid till Jan-2028"
    },

    "DL01CD5678":{
        owner:"Rahul Sharma",
        vehicle:"Honda City",
        color:"Black",
        fuel:"Diesel",
        registration:"12-Mar-2022",
        insurance:"Valid till Mar-2027"
    },

    "UP32XY9999":{
        owner:"Anjali Verma",
        vehicle:"Maruti Swift",
        color:"Blue",
        fuel:"Petrol",
        registration:"22-Jul-2021",
        insurance:"Valid till Jul-2026"
    }

};

function searchVehicle(){

    let number=document.getElementById("vehicleNumber").value.trim().toUpperCase();

    let result=document.getElementById("result");

    if(number===""){
        result.className="result error";
        result.innerHTML="<h3>Please enter a vehicle number.</h3>";
        return;
    }

    if(vehicleDatabase[number]){

        let data=vehicleDatabase[number];

        result.className="result success";

        result.innerHTML=`

        <h2>Vehicle Details</h2>
        <p><strong>Vehicle Number:</strong> ${number}</p>
        <p><strong>Owner Name:</strong> ${data.owner}</p>
        <p><strong>Vehicle:</strong> ${data.vehicle}</p>
        <p><strong>Color:</strong> ${data.color}</p>
        <p><strong>Fuel Type:</strong> ${data.fuel}</p>
        <p><strong>Registration Date:</strong> ${data.registration}</p>
        <p><strong>Insurance:</strong> ${data.insurance}</p>

        `;

    }

    else{

        result.className="result error";

        result.innerHTML=`
        <h2>Vehicle Not Found</h2>
        <p>No record available for <strong>${number}</strong></p>
        `;
    }

}
const challanDatabase = {

    "RJ14AB1234":[

        {
            id:"CH2025001",
            offence:"Over Speeding",
            fine:"₹1000",
            status:"Pending"
        },

        {
            id:"CH2025002",
            offence:"No Seat Belt",
            fine:"₹500",
            status:"Paid"
        }

    ],

    "DL01CD5678":[

        {
            id:"CH2025003",
            offence:"Wrong Parking",
            fine:"₹750",
            status:"Pending"
        }

    ],

    "UP32XY9999":[]
};

function checkChallan(){

    let number = document
        .getElementById("challanVehicle")
        .value
        .trim()
        .toUpperCase();

    let result = document.getElementById("challanResult");

    if(number==""){

        result.innerHTML="<h3>Please enter a vehicle number.</h3>";
        return;

    }

    let records = challanDatabase[number];

    if(records===undefined){

        result.innerHTML="<h3>Vehicle not found.</h3>";
        return;

    }

    if(records.length===0){

        result.innerHTML=`
        <div class="no-challan">
        ✅ Congratulations! No challans found.
        </div>
        `;

        return;

    }

    let table=`

    <table class="challan-table">

        <tr>

            <th>Challan ID</th>
            <th>Violation</th>
            <th>Fine</th>
            <th>Status</th>

        </tr>

    `;

    records.forEach(c=>{

        table+=`

        <tr>

            <td>${c.id}</td>
            <td>${c.offence}</td>
            <td>${c.fine}</td>
            <td>${c.status}</td>

        </tr>

        `;

    });

    table+="</table>";

    result.innerHTML=table;

}