import { useState } from "react";
import "./CreateQuiz.css";
import API from "../../services/api";


function CreateQuiz(){


const [quiz,setQuiz] = useState({

title:"",
description:"",
category:"General",
difficulty:"Easy",
timer:30,
teamCode:"",

});


const [questions,setQuestions] = useState([

{
question:"",
options:["","","",""],
correctAnswer:0
}

]);



const [message,setMessage] = useState("");




const handleChange=(e)=>{

setQuiz({

...quiz,

[e.target.name]:e.target.value

});

};





const addQuestion=()=>{


setQuestions([

...questions,

{
question:"",
options:["","","",""],
correctAnswer:0
}

]);


};





const updateQuestion=(index,value)=>{


let data=[...questions];

data[index].question=value;


setQuestions(data);


};





const updateOption=(qIndex,oIndex,value)=>{


let data=[...questions];


data[qIndex].options[oIndex]=value;


setQuestions(data);


};





const updateAnswer=(index,value)=>{


let data=[...questions];


data[index].correctAnswer=Number(value);


setQuestions(data);


};






const submitQuiz=async(e)=>{


e.preventDefault();


try{


const res=await API.post("/quiz/create",{

...quiz,

questions

});


setMessage("Quiz Created Successfully 🎉");


console.log(res.data);



}
catch(error){


setMessage(

error.response?.data?.message ||

"Error creating quiz"

);


}


};






return(


<div className="quiz-page">


<div className="quiz-card">


<h1>
Create Quiz 📝
</h1>



<form onSubmit={submitQuiz}>


<input

name="title"

placeholder="Quiz Title"

onChange={handleChange}

/>



<textarea

name="description"

placeholder="Description"

onChange={handleChange}

/>



<input

name="category"

placeholder="Category"

onChange={handleChange}

/>




<select

name="difficulty"

onChange={handleChange}

>


<option>Easy</option>

<option>Medium</option>

<option>Hard</option>


</select>




<input

name="timer"

type="number"

placeholder="Timer"

onChange={handleChange}

/>



<input

name="teamCode"

placeholder="Team Code"

onChange={handleChange}

/>





<h2>
Questions
</h2>




{
questions.map((q,index)=>(


<div className="question-box" key={index}>


<h3>
Question {index+1}
</h3>



<input

placeholder="Question"

onChange={(e)=>
updateQuestion(index,e.target.value)
}

/>



{
q.options.map((op,i)=>(


<input

key={i}

placeholder={`Option ${i+1}`}

onChange={(e)=>
updateOption(index,i,e.target.value)
}

/>


))

}





<select

onChange={(e)=>
updateAnswer(index,e.target.value)
}

>


<option value="0">
Correct Option 1
</option>

<option value="1">
Correct Option 2
</option>

<option value="2">
Correct Option 3
</option>

<option value="3">
Correct Option 4
</option>


</select>



</div>



))

}





<button

type="button"

onClick={addQuestion}

>

+ Add Question

</button>




<button type="submit">

Create Quiz

</button>



</form>



<p>
{message}
</p>


</div>


</div>


);


}


export default CreateQuiz;