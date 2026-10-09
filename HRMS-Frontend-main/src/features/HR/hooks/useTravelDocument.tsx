import { useQuery } from "@tanstack/react-query";
import api from "../../auth/api/axios";

export interface TravelDocument {
  UploadedBy: number;
  Type: string;
  TravelAssignmentId: number;
  TravelDocument: string;
  CreatedAt: Date;
  Description: string;
}

const fetchDocumentDetailsfromPlanAssignId = async (
  id: number,
): Promise<TravelDocument[]> => {
  const response = await api.get<TravelDocument[]>(
    `/TravelDocument/travelassignDocs/${id}`,
  );
  console.log(response);
  return response.data;
};

const useTravelDocument = (id: number) => {
  return useQuery<TravelDocument[], Error>({
    queryKey: ["DocumentDetailsfromPlanAssignId", id],
    queryFn: () => fetchDocumentDetailsfromPlanAssignId(id),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 2,
  });
};

export default useTravelDocument;
