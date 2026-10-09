import { QueryClient, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../../auth/api/axios";

export interface Expense{
    travelAssignId : number , 
    expenseType : number , 
    amount  :number ,
    status: string , 
    hrRemarks : string , 
    createdAt : Date,
    approvedBy : number, 
    expensedate : Date
}


const fetchAssignedEmployees = async(planId , empId):Promise<Expense[]>=>{
    try{
         const response = await api.get('/Expense/getId' , {
            params :{
                EmpId : empId , 
                PId : planId
            }
         }); 
        const travelassignid = response.data;
        console.log("Travel Assign Id : " , response.data , typeof(response.data)); 
        const expenseList = await api.get<Expense[]>(`/Expense/getExpensesByTravelAssignedId/${travelassignid}`);
        console.log("Expenses : ",expenseList.data);
        return expenseList.data;
    }catch(error){
        console.error("error occured" , error);
        throw error;
    }
}

const useExpense = (planId , empId) =>{
    return useQuery<Expense[], Error>({
        queryKey: ['fetchExpenses' , planId,empId],
        queryFn: () => fetchAssignedEmployees(planId,empId),
              staleTime: 1000 * 60 * 5,   
        gcTime: 1000 * 60 * 10,    
        refetchOnWindowFocus: false, 
        refetchOnMount: false,      
        retry: 2,
    });
}
export default  useExpense;