import { useState } from "react";
import "./JoinTeam.css";
import API from "../../services/api";


function JoinTeam(){


    const [teamCode,setTeamCode] = useState("");

    const [message,setMessage] = useState("");



    const handleJoin = async(e)=>{

        e.preventDefault();


        try{


            const res = await API.post(
                "/team/join",
                {
                    teamCode
                }
            );


            setMessage(
                "Joined Team Successfully 🎉"
            );


            setTeamCode("");


        }
        catch(error){


            setMessage(
                error.response?.data?.message ||
                "Unable to join team"
            );


        }


    };



    return(


        <div className="page-container">


            <div className="form-card">


                <h1>
                    Join Team 🤝
                </h1>


                <form onSubmit={handleJoin}>


                    <input

                    type="text"

                    placeholder="Enter Team Code"

                    value={teamCode}

                    onChange={
                        (e)=>setTeamCode(e.target.value)
                    }

                    />


                    <button>
                        Join Team
                    </button>


                </form>



                {
                    message &&
                    <p className="message">
                        {message}
                    </p>
                }


            </div>


        </div>


    );

}


export default JoinTeam;