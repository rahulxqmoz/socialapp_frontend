import React, { useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  ArcElement,
  RadarController,
  RadialLinearScale,
  BubbleController, 
} from 'chart.js';
import { Bar, Line ,Doughnut } from 'react-chartjs-2';
import { useDispatch, useSelector } from 'react-redux';
import ChartDataLabels from 'chartjs-plugin-datalabels'; 
import {
  fetchWeeklyUserRegistration,
  fetchEngagementStats,
  fetchWeeklyPostActivity,
} from '../features/auth/dashBoardSlice';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    RadarController,
    RadialLinearScale,
    BubbleController,
    Title,
    Tooltip,
    Legend,
    ChartDataLabels 
  );

  const AdminDashboardReports = () => {
    const dispatch = useDispatch();
    const {
      userRegistrationData = [],
      engagementData = { total_likes: 0, total_comments: 0, total_follows: 0 },
      postActivityData = { likes_per_day: [], comments_per_day: [] },
      loading,
      error,
    } = useSelector((state) => state.dashboard);
  
    useEffect(() => {
      dispatch(fetchWeeklyUserRegistration());
      dispatch(fetchEngagementStats());
      dispatch(fetchWeeklyPostActivity());
    }, [dispatch]);
  
    // Prepare data for the charts
    const userRegistrationChartData = {
        labels: userRegistrationData?.map((item) => item.day || 'Unknown') || [],
        datasets: [
          {
            label: 'User Registrations',
            data: userRegistrationData?.map((item) => item.count || 0) || [],
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            datalabels: {
                anchor: 'end',
                align: 'end',
                formatter: (value) => value,
                color: 'black',
              },
          },
        ],
      };
      const userRegistrationChartOptions = {
        responsive: true,
        plugins: {
            // Enable data labels for the Line chart
            datalabels: {
              anchor: 'end',
              align: 'end',
              formatter: (value) => value,
              color: 'black',
            },
          },
        scales: {
            x: {
                type: 'category', // Ensure x-axis is treated as a category
                beginAtZero: true, // This might not be necessary for a category axis
                min: 0, // Optional; might not apply to category scales
            },
            y: {
                beginAtZero: true, // Ensure the y-axis starts at 0
            },
        },
    };
      
     
      const postActivityChartData = {
        labels: postActivityData?.likes_per_day?.map((item) => item.day || 'Unknown') || [],
        datasets: [
          {
            label: 'Likes',
            data: postActivityData?.likes_per_day?.map((item) => item.count || 0) || [],
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            type: 'bar',
            datalabels: {
                anchor: 'center',
                align: 'center',
                formatter: (value) => value,
                color: 'black',
              },
          },
          {
            label: 'Comments',
            data: postActivityData?.comments_per_day?.map((item) => item.count || 0) || [],
            borderColor: 'rgba(153, 102, 255, 1)',
            backgroundColor: 'rgba(153, 102, 255, 0.6)',
            type: 'bar',
            datalabels: {
                anchor: 'center',
                align: 'center',
                formatter: (value) => value,
                color: 'black',
              },
          },
          {
            label: 'Total Follows',
            data: postActivityData?.follows_per_day?.map((item) => item.count || 0) || [], // assuming you have this data
            borderColor: 'rgba(255, 99, 132, 1)',
            fill: false,
            type: 'line',
            datalabels: {
                anchor: 'end',
                align: 'end',
                formatter: (value) => value,
                color: 'black',
              },
          },
        ],
      };
      const engagementChartData = {
        labels: ['Likes', 'Comments', 'Follows'],
        datasets: [
          {
            label: 'Engagement Stats',
            data: [
              engagementData.total_likes || 0,
              engagementData.total_comments || 0,
              engagementData.total_follows || 0,
            ],
            backgroundColor: [
              'rgba(75, 192, 192, 0.6)',
              'rgba(153, 102, 255, 0.6)',
              'rgba(255, 159, 64, 0.6)',
            ],
            borderColor: [
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)',
            ],
            borderWidth: 1,
            datalabels: {
                anchor: 'end',
                align: 'end',
                formatter: (value) => value,
                color: 'black',
              },
          },
        ],
      };
      if (!userRegistrationData || !postActivityData.likes_per_day || !postActivityData.comments_per_day) {
        return <p>Loading data...</p>;
      }
      
    return (
      <div className="p-8 bg-gray-100 min-h -screen">
        <h2 className="text-2xl font-bold text-center mb-6">Admin Dashboard</h2>
  
        {loading && <p className="text-center text-blue-500">Loading...</p>}
        {error && <p className="text-center text-red-500">Error: {error}</p>}
  
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* User Registrations */}
          <div className="bg-white p-6 shadow rounded">
            <h3 className="text-lg font-semibold mb-4">Weekly Post Activity</h3>
            <Bar data={postActivityChartData} options={{ responsive: true }} />
          </div>
  
          {/* Engagement Stats */}
          <div className="bg-white p-6 shadow rounded">
          <h3 className="text-lg font-semibold mb-4">User Engagement Stats</h3>
          <Doughnut data={engagementChartData} options={{ responsive: true }} />
          </div>
  
          {/* Post Activity */}
          <div className="bg-white p-6 shadow rounded col-span-1 md:col-span-2">
            
            <h3 className="text-lg font-semibold mb-4">Weekly User Registrations</h3>
            {Array.isArray(userRegistrationData) && userRegistrationData.length > 0 && (
              <Line data={userRegistrationChartData}  options={userRegistrationChartOptions}/>
          
            )}
          </div>
        </div>
      </div>
    );
  };
  
  export default AdminDashboardReports;