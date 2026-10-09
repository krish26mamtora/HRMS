import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../auth/api/axios';

const useUpdateExpense = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn:({id,data}:{id:number;data:any}) =>{
            return api.put(`/Expense/${id}`,data);
        },
        
        onSuccess: () =>{
            queryClient.invalidateQueries({queryKey:['fetchExpenses']}); 
            alert("Expense updated successfully!");
        },
        onError:(error:any)=>{
            console.error("Update failed:",error);
            alert("Failed to update expense.");
        }
    });
};

export default useUpdateExpense;
