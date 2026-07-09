import { useEffect, useState } from "react";
import API from "../../services/api";
import "./MyQuizzes.css";


function MyQuizzes(){

const [quizzes,setQuizzes]=useState([]);
const [loading,setLoading]=useState(true);



useEffect(()=>{

fetchQuizzes();

},[]);



const fetchQuizzes=async()=>{

try{

const res=await API.get("/quiz/myquizzes");

setQuizzes(res.data.quizzes);

}
catch(error){

console.log(error);

}
finally{

setLoading(false);

}

};



if(loading){

return <h2 className="loading">Loading...</h2>

}



return(

<div className="myquiz-page">


<h1>
My Quizzes 📚
</h1>



<div className="quiz-container">


{
quizzes.length===0 ?

<h2>
No Quiz Created Yet
</h2>


:

quizzes.map((quiz)=>(


<div className="quiz-card" key={quiz._id}>


<h2>
{quiz.title}
</h2>


<p>
{quiz.description}
</p>


<div className="details">

<span>
📂 {quiz.category}
</span>

<span>
🔥 {quiz.difficulty}
</span>

<span>
⏱ {quiz.timer}s
</span>


</div>


<p>
Questions: {quiz.questions.length}
</p>



</div>


))

}


</div>


</div>


)

}


export default MyQuizzes;