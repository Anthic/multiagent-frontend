import { api } from "../lib/api";
import { ApiResponse } from "../types/api";
import { Job, PaginatedJobs, StartResearchPayload, StartResearchResponse } from "../types/research";

 const startResearch = (payload : StartResearchPayload) : Promise<ApiResponse<StartResearchResponse>> => api.post<StartResearchResponse>('/research' , payload)


 const getJobStatus = (jobId : string) : Promise<ApiResponse<Job>>=> api.get<Job>(`/research/job/${jobId}`)


 const getHistory = (limit = 10): Promise<ApiResponse<PaginatedJobs>> => api.get<PaginatedJobs>('/research/history', {limit})


 const getHistoryById = (id : string): Promise<ApiResponse<Job>>=> api.get<Job>(`/research/history/${id}`)


export const ResearchService = {
    startResearch,getJobStatus,getHistory,getHistoryById
}