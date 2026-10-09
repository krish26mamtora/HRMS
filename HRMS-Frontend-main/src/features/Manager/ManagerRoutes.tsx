// ManagerRoutes.tsx
import TeamPeople from './team/TeamPeople';
import ListUser from '../OrgChart/ListUser';

import Social from '../Social/Social';
import AddPost from '../Social/AddPost';
import UserProfilePage from '../UserProfilePage';
import EmpTravelPlans from './travel/EmpTravelPlans';
import  EmpTravelExpense  from './travel/EmpTravelExpense';
import EmpTravelDocuments from './travel/EmpTravelDocuments';
import MyPosts from '../Social/MyPosts';
import MyComments from '../Social/MyComments';
import Profile from '../OrgChart/Profile';
const ManagerRoutes = [
  {
    path: 'team-members',
    element: <TeamPeople />,
   
  },
  {
    path: 'organization',
    element: <ListUser />, 
  }
  ,
   {
    path: 'profile',
    element: <UserProfilePage />, 
  }
  ,
  {
    path: 'social',
    element: <Social />,
  },{
    path : 'social/create',
    element : <AddPost/>
  },

  {
        path:'organization/profile/:userProfileId',
        element : <Profile/>
    }
  ,{
    path : 'social/myposts',
    element : <MyPosts/>
  },
     {
    path:'social/mycomments',
    element:<MyComments/>
  },
  ,{
    path: 'employee-plans/:empProfileId', 
    element: <EmpTravelPlans />
  },
    {
    path: 'employee-plans/expense/:empProfileId/:planid',
    element: <EmpTravelExpense />
  },
   {
    path: 'employee-plans/documents/:empProfileId/:id',
    element: <EmpTravelDocuments />
  }
];

export default ManagerRoutes;
