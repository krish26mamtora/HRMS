import React, { Children } from 'react'
import HRHomePage from './HRHomePage';
import TravelPlans from './TravelandExpense/TravelPlans';
import Jobs from './JobListing/Jobs';
import Games from '../Games/Games';
import AddPlanForm from './TravelandExpense/AddPlanForm';
import CreateJob from './JobListing/CreateJob';
import AssignEmployees from './TravelandExpense/AssignEmployees';
import JobApplications from './JobListing/JobApplications';
import ManageTravel from './TravelandExpense/ManageTravel';
import TravelDocument from './TravelandExpense/TravelDocument';
import Profile from '../OrgChart/Profile';
import ExpenseList from './TravelandExpense/ExpenseList';
import ExpenseProof from './TravelandExpense/ExpenseProof';
import ListUser from '../OrgChart/ListUser';
import GameConfig from './Games/GameConfig';
import Social from '../Social/Social';
import AddPost from '../Social/AddPost';
import MyPosts from '../Social/MyPosts';
import UserProfilePage from '../UserProfilePage';
import GameDetails from '../Games/GameDetails';
import MyBookings from '../Games/MyBookings';
import MyWating from '../Games/MyWaiting';
import Violations from '../Social/Violations';
import MyComments from '../Social/MyComments';

type Props = {}

const HrRoutes = [

  {
    path: 'travel',
    element: <TravelPlans />,
    children:[
      {
        path :  'create',
        element : <AddPlanForm/>
      },
 
    ]
  },
    {
        path:'travel/expense/:planId',
        element : <ManageTravel/>
    }
    //  ,
    //   {
    //     path:'travel/documents/:planId',
    //     element : <TravelDocument/>
    //   }
     ,
     {
        path:'travel/expense/:planId/:empId',
        element : <ExpenseList/>
     },
     {
        path:'organization',
        element : <ListUser/>
     },
       {
        path:'organization/profile/:userProfileId',
        element : <Profile/>
     },
      {
        path:'travel/documents/:planId/:empId',
        element : <TravelDocument/>
     },
     {
      path : 'travel/expense/proof/:expenseId',
      element : <ExpenseProof/>
     },
    { 
      path : 'UserProfile/:empProfileId',
      element : <Profile/>
    },
    {
    path : 'travel/:planId',
    element : <AssignEmployees/>
  },
  {
    path: 'social',
    element: <Social />,
  },
  ,{
    path : 'social/create',
    element : <AddPost/>
  },
  ,{
    path : 'social/myposts',
    element : <MyPosts/>
  },
  {
    path:'social/mycomments',
    element:<MyComments/>
  },
  {
    path:'social/manage-violations',
    element:<Violations/>
  },
  {
    path : 'profile',
    element : <UserProfilePage/>
  },
  {
    path : 'games',
    element : <Games/>
  },
  {
    path:'games/config',
    element:<GameConfig/>
  },
  {
    path : 'games/:gameId',
    element : <GameDetails/>
  },
  {
    path: 'games/my-bookings/:userId',
    element : <MyBookings/>
  },
{
  path: 'games/my-waitings/:userId',
    element : <MyWating/>
},
   {
    path: 'jobs',
    element: <Jobs />,
    children:[
      {
        path:'create',
        element : <CreateJob/>
      } , 
    ]
  },
{
  path:'jobs/:jobId',
  element :<JobApplications/>
}
]
export default HrRoutes;