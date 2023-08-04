import React, { useEffect, useState } from 'react';
import './App.css';
import { Grid } from '@material-ui/core';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { LineChart } from '@mui/x-charts/LineChart';

const uData = [4000, 3000, 2000, 2780, 1890, 2390, 3490];
const pData = [2400, 1398, 9800, 3908, 4800, 3800, 4300];
const xLabels = [
  'Page A',
  'Page B',
  'Page C',
  'Page D',
  'Page E',
  'Page F',
  'Page G',
];

interface MonitorMessages {
  Id: string;
  value: number;
  Name: string;
  Time: string;
}


function App() {
  const [message, setMessage] = useState<MonitorMessages>();
  const [qualityData, setQualityData] = useState<number[]>([0]);
  const [qualityLabel, setQualityLabel] = useState<string[]>(["None"]);
  const [availabilityData, setAvailabilityData] = useState<number[]>([]);
  const [availabilityLabel, setAvailabilityLabel] = useState<number[]>([]);
  const [performanceData, setPerformanceData] = useState<number[]>([]);
  const [performanceLabel, setPerformanceLabel] = useState<number[]>([]);


  useEffect(() => {
    console.log("Try to connect to the server");
    const eventSource = new EventSource('http://localhost:8080/sse');

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
    if (message) {
      if (message.Id === "a8"){
        setQualityData(prevData => [...prevData, message.value]);
        setQualityLabel(prevData => [...prevData, message.Time]);
        console.log("Set quality data")
      }
      if (message.Id === "a6"){
        setAvailabilityData(prevData => [...prevData, message.value]);
        setAvailabilityLabel(prevData => [...prevData, parseInt(message.Time)]);
        console.log("Set availability data")
      }
      if (message.Id === "a7"){
        setPerformanceData(prevData => [...prevData, message.value]);
        setPerformanceLabel(prevData => [...prevData, parseInt(message.Time)]);
        console.log("Set performance data")
      }
    }
  }, [message]);


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
              <Typography variant="h5">Machine Quality</Typography>
              <LineChart
                width={500}
                height={300}
                series={[
                  { data: qualityData, label: 'Quality in pieces' },
                ]}
                xAxis={[{ scaleType: 'point', data: qualityLabel }]}
              />
            </Box>
          </Grid>
          <Grid item xs>
            <Box sx={{ borderRadius: '16px', bgcolor: '#E5E4E2' }} >
              <Typography variant="h5">Machine Availability</Typography>
              <LineChart
                width={500}
                height={300}
                series={[
                  { data: availabilityData, label: 'Availability in %' },
                ]}
                xAxis={[{ scaleType: 'point', data: availabilityLabel }]}
              />
            </Box>
          </Grid>
          <Grid item xs>
            <Box sx={{ borderRadius: '16px', bgcolor: '#E5E4E2' }} >
              <Typography variant="h5">Machine Performance</Typography>
              <LineChart
                width={500}
                height={300}
                series={[
                  { data: performanceData, label: 'Performance in %' },
                ]}
                xAxis={[{ scaleType: 'point', data: performanceLabel }]}
              />
            </Box>
          </Grid>
        </Grid>
      </Box>
    </div>
  );
}

export default App;
