import { useState } from "react";
import "./CreateTeam.css";
import API from "../../services/api";


function CreateTeam(){

    const [name,setName] = useState("");
    const [message,setMessage] = useState("");


    const handleCreate = async(e)=>{

        e.preventDefault();


        try{

            const res = await API.post("/team/create",{
                name
            });


            setMessage(
                `Team Created! Code: ${res.data.team.teamCode}`
            );


            setName("");


        }
        catch(error){

            setMessage(
                error.response?.data?.message ||
                "Error creating team"
            );

        }

    };


    return(

        <div className="page-container">


            <div className="form-card">


                <h1>Create Team 🚀</h1>


                <form onSubmit={handleCreate}>


                    <input

                    type="text"

                    placeholder="Enter Team Name"

                    value={name}

                    onChange={(e)=>setName(e.target.value)}

                    />


                    <button>
                        Create Team
                    </button>


                </form>


                {
                    message &&
                    <p>{message}</p>
                }


            </div>


        </div>

    );

}


export default CreateTeam;