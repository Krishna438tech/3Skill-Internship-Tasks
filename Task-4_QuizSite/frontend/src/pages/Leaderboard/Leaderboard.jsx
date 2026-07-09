import { useEffect, useState } from "react";
import API from "../../services/api";
import "./Leaderboard.css";


function Leaderboard(){

const [results,setResults] = useState([]);


useEffect(()=>{

getLeaderboard();

},[]);



const getLeaderboard = async()=>{

try{

const res = await API.get("/result/leaderboard");

setResults(res.data.results);

}
catch(error){

console.log(error);

}

};



return(

<div className="leader-page">


<h1>
🏆 Leaderboard
</h1>


<div className="leader-container">


{
results.length===0 ?

<h2>No Results Available</h2>


:

results.map((item,index)=>(


<div className="leader-card" key={item._id}>


<div className="rank">

#{index+1}

</div>


<div>

<h2>
{item.user?.name}
</h2>


<p>
Quiz: {item.quiz?.title}
</p>

</div>



<div className="score">

{item.score}

</div>



</div>


))

}



</div>


</div>


)

}


export default Leaderboard;