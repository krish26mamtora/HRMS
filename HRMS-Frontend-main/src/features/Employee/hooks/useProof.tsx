import { useQuery } from "@tanstack/react-query";
import api from "../../auth/api/axios";

export interface ExpenseProofData {
    travelExpenseId: number,
    proofDocumentUrl: string,
    createdAt: Date,
}

const fetchExpenseProoffromExpense = async (id: number): Promise<ExpenseProofData[]> => {
    const response = await api.get<ExpenseProofData[]>(`/ExpenseProof/${id}`);
    console.log(response)
    return response.data;
}

const useProof = (id: number) => {
    return useQuery<ExpenseProofData[], Error>({
        queryKey: ['fetchExpenseProoffromExpense', id],
        queryFn: () => fetchExpenseProoffromExpense(id),
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        retry: 2,
    });
}
export default useProof