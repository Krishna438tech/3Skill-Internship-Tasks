import { useEffect,useState } from "react";
import API from "../../services/api";
import "./Profile.css";


function Profile(){


const [user,setUser]=useState(null);



useEffect(()=>{

getProfile();

},[]);



const getProfile=async()=>{

try{

const res=await API.get("/auth/profile");

setUser(res.data.user);


}
catch(error){

console.log(error);

}

};



if(!user){

return <h2>Loading...</h2>

}



return(

<div className="profile-page">


<div className="profile-card">


<h1>
👤 Profile
</h1>


<div className="info">

<h2>
{user.name}
</h2>


<p>
📧 {user.email}
</p>


<p>
🆔 User ID:
{user._id}
</p>


</div>


</div>


</div>

)

}


export default Profile;