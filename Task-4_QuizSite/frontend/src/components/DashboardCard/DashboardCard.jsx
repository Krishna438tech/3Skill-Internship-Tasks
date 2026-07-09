import "./DashboardCard.css";

function DashboardCard({title, icon, onClick}){

    return(

        <div 
            className="card"
            onClick={onClick}
        >

            <h1>{icon}</h1>

            <h3>{title}</h3>

        </div>

    )

}

export default DashboardCard;