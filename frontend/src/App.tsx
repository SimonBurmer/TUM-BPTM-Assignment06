import React, { useEffect, useState } from 'react';
import './App.css';
import { Grid } from '@material-ui/core';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { LineChart } from '@mui/x-charts/LineChart';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);






interface MonitorMessages {
  Id: string;
  value: string;
  Name: string;
  Time: string;
}

// PUBLIC_URL=https://lehre.bpm.in.tum.de/ports/24209 npm run build

function App() {
  const [message, setMessage] = useState<MonitorMessages>();
  const [qualityData, setQualityData] = useState<number[]>([0]);
  const [qualityLabel, setQualityLabel] = useState<string[]>(["None"]);
  const [availabilityData, setAvailabilityData] = useState<number[]>([0]);
  const [availabilityLabel, setAvailabilityLabel] = useState<string[]>(["None"]);
  const [performanceData, setPerformanceData] = useState<number[]>([0]);
  const [performanceLabel, setPerformanceLabel] = useState<string[]>(["None"]);


  useEffect(() => {
    console.log("Try to connect to the server");
    const eventSource = new EventSource('./sse');

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessage(data);
      console.log("Received message from the server:", data);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  useEffect(() => {
    console.log("qualityData: ", qualityData)


    if (message) {
      if (message.Id === "a8"){
        setQualityData(prevData => [...prevData, parseInt(message.value)]);
        setQualityLabel(prevData => [...prevData, (qualityLabel.length).toString()]);
        console.log("Set quality data")
      }
      if (message.Id === "a6"){
        setAvailabilityData(prevData => [...prevData, parseInt(message.value)]);
        setAvailabilityLabel(prevData => [...prevData,(availabilityLabel.length).toString()]);
        console.log("Set availability data")
      }
      if (message.Id === "a7"){
        setPerformanceData(prevData => [...prevData, parseInt(message.value)]);
        setPerformanceLabel(prevData => [...prevData,(performanceLabel.length).toString()]);
        console.log("Set performance data")
      }
    }
  }, [message]);



  const data = {
    labels: qualityLabel,
    datasets: [
      {
        label: 'Sales',
        data: qualityData,
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'chartArea' as const,
      },
      title: {
        display: true,
        text: 'Chart.js Line Chart',
      },
    },
  };




  return (
    <div className="App">
      <AppBar position="static" color="primary" enableColorOnDark>
        {<Toolbar>
          <Typography variant="h5" noWrap component="div" sx={{ flexGrow: 1 }}>
            {"Cpee Machine Monitor"}
          </Typography>
        </Toolbar>}
      </AppBar>

      <Box sx={{ m: 8 }} >

        <p>Message from the server: {message?.Id}</p>

        <Grid container spacing={2}>
          <Grid item xs>
            <Box sx={{ borderRadius: '16px', bgcolor: '#E5E4E2' }} >
              <Typography sx={{mt:2}} variant="h5">Machine Quality</Typography>
              <LineChart
                width={500}
                height={300}
                series={[
                  { data: qualityData, label: 'Quality in pieces' },
                ]}
                xAxis={[{ scaleType: 'point', data: qualityLabel }]}
              />
              <Typography sx={{mt:-2}} variant="subtitle1">Measurements</Typography>
              <Line data={data} options={options} />
            </Box>
          </Grid>
          <Grid item xs>
            <Box sx={{ borderRadius: '16px', bgcolor: '#E5E4E2' }} >
              <Typography sx={{mt:2}} variant="h5">Machine Availability</Typography>
              <LineChart
                width={500}
                height={300}
                series={[
                  { data: availabilityData, label: 'Availability in %' },
                ]}
                xAxis={[{ scaleType: 'point', data: availabilityLabel }]}
              />
              <Typography sx={{mt:-2}} variant="subtitle1">Measurements</Typography>
            </Box>
          </Grid>
          <Grid item xs>
            <Box sx={{ borderRadius: '16px', bgcolor: '#E5E4E2' }} >
              <Typography sx={{mt:2}} variant="h5">Machine Performance</Typography>
              <LineChart
                width={500}
                height={300}
                series={[
                  { data: performanceData, label: 'Performance in %' },
                ]}
                xAxis={[{ scaleType: 'point', data: performanceLabel }]}
              />
              <Typography sx={{mt:-2}} variant="subtitle1">Measurements</Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </div>
  );
}

export default App;
