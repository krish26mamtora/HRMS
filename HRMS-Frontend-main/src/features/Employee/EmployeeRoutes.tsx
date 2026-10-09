import React, { Children } from 'react'
import Jobs from './JobListing/Jobs';

import TravelPlans from './TravelandExpense/TravelPlans';
import TravelPlanDetails from './TravelandExpense/TravelPlanDetails';
import TravelExpense from './TravelandExpense/TravelExpense';
import ListUser from '../OrgChart/ListUser';
import Profile from '../OrgChart/Profile';

import AddPost from '../Social/AddPost';
import Social from '../Social/Social';
import MyPosts from '../Social/MyPosts';

import UserProfilePage from '../UserProfilePage';
import Games from '../Games/Games'
import GameDetails from '../Games/GameDetails';
import MyBookings from '../Games/MyBookings';
import MyWating from '../Games/MyWaiting';
import MyComments from '../Social/MyComments';
import MyReferrals from './JobListing/MyReferrals';
import MyJobShare from './JobListing/MyJobShare';

const EmployeeRoutes = [

  {
    path: 'travel',
    element: <TravelPlans />,
  },
    {
    path: 'profile',
    element: <UserProfilePage />,
  },
  {
    path : 'travel/:id',
    element : <TravelPlanDetails/>
  },
   {
    path : 'travel/expense/:id',
    element : <TravelExpense/>
  },
  {
    path: 'social',
    element: <Social />,
  },{
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
        path:'organization',
        element : <ListUser/>
      },
      {
        path:'organization/profile/:userProfileId',
        element : <Profile/>
      },
      {
        path : 'games',
        element : <Games/>
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
      },
      {
        path: 'jobs/my-referrals',
        element : <MyReferrals/>
      },
      {
        path: 'jobs/my-jobshare',
        element : <MyJobShare/>
      },
    ]
    export default EmployeeRoutes;