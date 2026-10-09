import { useQuery } from "@tanstack/react-query";
import api from "../../auth/api/axios";

export interface ExpenseData {
    TravelAssignId : number , 
    ExpenseType : number , 
    Amount  :number ,
    Status: string , 
    Description : string,
    HrRemarks : string , 
    CreatedAt : Date,
    ApprovedBy : number ,
    Expensedate : Date,
}

const fetchExpenseDetailsfromPlanAssignId = async(id : number):Promise<ExpenseData[]>=>{
    const response = await api.get<ExpenseData[]>(`/Expense/getExpensesByTravelAssignedId/${id}`);
     console.log(response)
    return response.data;
}

const useExpense = (id: number) => {
   return useQuery<ExpenseData[],Error>({
        queryKey : ['ExpenseDetailsfromPlanAssignId' ,id ],
        queryFn :()=> fetchExpenseDetailsfromPlanAssignId(id),
        
    });
}
export default useExpense