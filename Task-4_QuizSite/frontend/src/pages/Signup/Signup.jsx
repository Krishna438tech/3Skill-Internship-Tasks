import { useState } from "react";
import "./Signup.css";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../../services/authService";

const Signup = () => {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: ""
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);


    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

    };


    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");

        if(
            !formData.name ||
            !formData.email ||
            !formData.password
        ){
            return setError("Please fill all fields");
        }


        try{

            setLoading(true);

            await registerUser(formData);

            alert("Account Created Successfully");

            navigate("/login");


        }catch(err){

            setError(
                err.response?.data?.message ||
                "Registration Failed"
            );

        }
        finally{

            setLoading(false);

        }

    };


    return (

        <div className="signup-container">


            <div className="signup-card">


                <h1>
                    QuizHub
                </h1>

                <p>
                    Create your account 🚀
                </p>


                <form onSubmit={handleSubmit}>


                    <input

                        type="text"

                        placeholder="Full Name"

                        name="name"

                        value={formData.name}

                        onChange={handleChange}

                    />



                    <input

                        type="email"

                        placeholder="Email"

                        name="email"

                        value={formData.email}

                        onChange={handleChange}

                    />



                    <div className="password-box">


                        <input

                            type={
                                showPassword
                                ? "text"
                                : "password"
                            }

                            placeholder="Password"

                            name="password"

                            value={formData.password}

                            onChange={handleChange}

                        />


                        <button

                            type="button"

                            className="show-btn"

                            onClick={()=>
                                setShowPassword(!showPassword)
                            }

                        >

                            {
                                showPassword
                                ? "Hide"
                                : "Show"
                            }


                        </button>


                    </div>



                    {
                        error &&
                        <p className="error">
                            {error}
                        </p>
                    }



                    <button
                        className="signup-btn"
                        disabled={loading}
                    >

                        {
                            loading
                            ? "Creating..."
                            : "Create Account"
                        }

                    </button>


                </form>



                <p className="bottom-text">

                    Already have account?

                    <Link to="/login">
                        Login
                    </Link>

                </p>


            </div>


        </div>

    );

};


export default Signup;