"use client";
import { useEffect, useState } from "react";
import TaskCompletionChart from "@/helper/TaskCalculationChart";
import { useParams } from "next/navigation";
import TaskCompletionLineChart from "@/helper/LineChartCalculation";

export default function ChartClientPage() {
    const {id}=useParams();
  const [chartData, setChartData] = useState(null);
  const [linechartdata,setlinechartdata]=useState([]);
  useEffect(() => {
    try {
      async function fetchStats() {
        const res = await fetch(`/api/project/myprojects/task-stats/${id}`);
        const data = await res.json();
        let linechart=[];
        for(let task of data.alltaskinfo){
          if(task.status==='completed'){
            const one={
              username:task.username,
              taskName:task.taskName,
              timeTaken:task.createdAt,
              completedAt:task.completedAt
             }
             linechart.push(one)
          }
     
        
        }
        setlinechartdata(linechart);
        console.log("here is your data",linechart)
        console.log(data)
        setChartData(data);
      }
      fetchStats();
    } catch (error) {
      console.log("error aa gyi",error)
    }
   
  }, []);

  return (
    <div className="p-10">
      <h1 className="text-3xl mb-4">Client-side Task Stats</h1>
      {chartData ? <TaskCompletionChart chartData={chartData} /> : <p>Loading...</p>}
   {linechartdata ? <TaskCompletionLineChart tasksData={linechartdata}/>:<p>Not found!:</p>}
      <div>
        <ul>
            <li>Blue: in-progress</li>
        <li>Green: completed</li>
        <li>Yellow: Pending</li></ul>
      </div>
    </div>
  );
}