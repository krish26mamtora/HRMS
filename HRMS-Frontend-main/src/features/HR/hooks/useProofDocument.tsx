import { useQuery } from "@tanstack/react-query";
import api from "../../auth/api/axios";

export interface ExpenseProof{
    TravelExpenseId : string , 
    ProofDocumentUrl : string , 
    createdAt : Date,
   
}

const fetchProofDocuments = async(ExpenseId:number):Promise<ExpenseProof[]>=>{
    try{
        const expenseProofList = await api.get<ExpenseProof[]>(`ExpenseProof/getExpenseProofForExpenseid/${ExpenseId}`);
        console.log("Expens Proof List: ", expenseProofList.data);
        return expenseProofList.data;
    }catch(error){
        console.error("error occured" , error);
        throw error;
    }
}

const useProofDocument = (ExpenseId:number) =>{
    return useQuery<ExpenseProof[], Error>({
        queryKey: ['fetchExpensProof' , ExpenseId],
        queryFn: () => fetchProofDocuments(ExpenseId),
                staleTime: 1000 * 60 * 5,   
            gcTime: 1000 * 60 * 10,    
            refetchOnWindowFocus: false,
            refetchOnMount: false,      
            retry: 2,
    });
}
export default  useProofDocument;